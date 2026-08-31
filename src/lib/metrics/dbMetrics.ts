import client from 'prom-client';
import { registry } from './registry.js';

export const dbQueryDurationMicroseconds = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'collection'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2]
});

registry.registerMetric(dbQueryDurationMicroseconds);
