import client from 'prom-client';
import { registry } from './registry.js';

export const aiGenerationLatency = new client.Histogram({
  name: 'ai_generation_duration_seconds',
  help: 'Latency of AI model generation in seconds',
  labelNames: ['model', 'operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30]
});

export const aiCacheHits = new client.Counter({
  name: 'ai_cache_hits_total',
  help: 'Total number of AI cache hits',
  labelNames: ['operation']
});

export const aiCacheMisses = new client.Counter({
  name: 'ai_cache_misses_total',
  help: 'Total number of AI cache misses',
  labelNames: ['operation']
});

registry.registerMetric(aiGenerationLatency);
registry.registerMetric(aiCacheHits);
registry.registerMetric(aiCacheMisses);
