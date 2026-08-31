import client from 'prom-client';

// Create a Registry
export const registry = new client.Registry();

// Add default metrics (CPU, Memory, Event Loop, etc.)
client.collectDefaultMetrics({ register: registry });

// Generic wrapper to ensure all metrics use a specific prefix if desired
// (For now, we'll just use the default registry directly)
