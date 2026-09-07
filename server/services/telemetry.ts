import client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'roadmap-engine'
});

// Enable the collection of default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// --- Custom Metrics ---

export const llmGenerationDuration = new client.Histogram({
  name: 'llm_generation_duration_seconds',
  help: 'Duration of LLM generations in seconds',
  labelNames: ['model', 'operation'],
  buckets: [1, 2, 5, 10, 20, 60]
});
register.registerMetric(llmGenerationDuration);

export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});
register.registerMetric(dbQueryDuration);

export const cacheHits = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type']
});
register.registerMetric(cacheHits);

export const cacheMisses = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type']
});
register.registerMetric(cacheMisses);

export const nodeStuckCounter = new client.Counter({
  name: 'learning_node_stuck_total',
  help: 'Total number of times users reported being stuck on a node',
  labelNames: ['node_id']
});
register.registerMetric(nodeStuckCounter);

export class Telemetry {
  static async getMetrics() {
    return register.metrics();
  }

  static getContentType() {
    return register.contentType;
  }
}
