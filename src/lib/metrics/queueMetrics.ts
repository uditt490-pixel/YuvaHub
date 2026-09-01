import client from 'prom-client';
import { registry } from './registry.js';

export const queueActiveJobs = new client.Gauge({
  name: 'queue_active_jobs',
  help: 'Number of active jobs in a queue',
  labelNames: ['queue_name']
});

export const queueFailedJobs = new client.Gauge({
  name: 'queue_failed_jobs',
  help: 'Number of failed jobs in a queue',
  labelNames: ['queue_name']
});

registry.registerMetric(queueActiveJobs);
registry.registerMetric(queueFailedJobs);
