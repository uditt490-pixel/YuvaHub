import CircuitBreaker from 'opossum';
import * as Sentry from '@sentry/node';
import { redisClient } from '../api/redis.js';

export function createBreaker<T extends (...args: any[]) => Promise<any>>(
  action: T,
  options: CircuitBreaker.Options = {},
  name: string = 'Unnamed Breaker'
): CircuitBreaker {
  const defaultOptions: CircuitBreaker.Options = {
    timeout: 10000, // 10 seconds
    errorThresholdPercentage: 50, // 50% errors trips the circuit
    resetTimeout: 30000, // wait 30 seconds before trying again
  };

  const finalOptions = { ...defaultOptions, ...options };
  const breaker = new CircuitBreaker(action, finalOptions);

  const baseResetTimeout = finalOptions.resetTimeout || 30000;
  let failureMultiplier = 1;
  let lastState: 'closed' | 'open' | 'halfOpen' = 'closed';

  // Sync state to Redis for distributed instances
  const syncStateToRedis = async (state: string) => {
    if ((globalThis as any).REDIS_AVAILABLE && redisClient) {
      try {
        await redisClient.set(`circuit_breaker:${name}:state`, state, 'EX', 3600); // 1 hour expiry
      } catch (err: any) {
        console.error(`[CircuitBreaker] Redis sync error for ${name}:`, err.message);
      }
    }
  };

  // Intercept fire to check remote Redis state
  const originalFire = breaker.fire.bind(breaker);
  breaker.fire = async function (...args: any[]) {
    if ((globalThis as any).REDIS_AVAILABLE && redisClient) {
      try {
        const remoteState = await redisClient.get(`circuit_breaker:${name}:state`);
        if (remoteState === 'open' && !breaker.opened) {
          breaker.open();
        } else if (remoteState === 'closed' && breaker.opened) {
          breaker.close();
        }
      } catch (err: any) {
        console.error(`[CircuitBreaker] Redis read error for ${name}:`, err.message);
      }
    }
    return originalFire(...args);
  };

  breaker.on('open', () => {
    console.warn(`[CircuitBreaker] ${name} circuit OPEN`);
    
    // Exponential backoff if transitioning from halfOpen
    if (lastState === 'halfOpen') {
      failureMultiplier = Math.min(failureMultiplier * 2, 10); // cap at 10x
      const nextTimeout = baseResetTimeout * failureMultiplier;
      breaker.options.resetTimeout = nextTimeout;
      console.warn(`[CircuitBreaker] ${name} failed in HALF_OPEN. Backoff resetTimeout to ${nextTimeout}ms.`);
    }
    
    lastState = 'open';
    syncStateToRedis('open');

    // Trigger Sentry alerting
    try {
      Sentry.captureMessage(`[CircuitBreaker] Circuit ${name} is OPEN due to multiple failures.`, {
        level: 'warning',
        tags: { service: name, component: 'circuit-breaker' }
      });
    } catch (e: any) {
      console.error(`[CircuitBreaker] Failed to send Sentry alert for ${name}:`, e.message);
    }
  });

  breaker.on('halfOpen', () => {
    console.warn(`[CircuitBreaker] ${name} circuit HALF_OPEN`);
    lastState = 'halfOpen';
    syncStateToRedis('halfOpen');
  });

  breaker.on('close', () => {
    console.log(`[CircuitBreaker] ${name} circuit CLOSED`);
    failureMultiplier = 1;
    breaker.options.resetTimeout = baseResetTimeout;
    lastState = 'closed';
    syncStateToRedis('closed');
  });

  breaker.on('fallback', (result, err) => {
    if (err) {
      console.warn(`[CircuitBreaker] ${name} fallback triggered. Error:`, err.message);
    } else {
      console.warn(`[CircuitBreaker] ${name} fallback triggered.`);
    }
  });

  return breaker;
}

