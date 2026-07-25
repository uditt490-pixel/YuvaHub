import CircuitBreaker from 'opossum';

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

  breaker.on('open', () => console.warn(`[CircuitBreaker] ${name} circuit OPEN`));
  breaker.on('halfOpen', () => console.warn(`[CircuitBreaker] ${name} circuit HALF_OPEN`));
  breaker.on('close', () => console.log(`[CircuitBreaker] ${name} circuit CLOSED`));
  breaker.on('fallback', (result, err) => {
    if (err) {
      console.warn(`[CircuitBreaker] ${name} fallback triggered. Error:`, err.message);
    } else {
      console.warn(`[CircuitBreaker] ${name} fallback triggered.`);
    }
  });

  return breaker;
}
