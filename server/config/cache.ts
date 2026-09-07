import { LRUCache } from 'lru-cache';

// Using LRUCache as an in-memory substitute for Redis. 
// In a full production environment, we would connect to a Redis cluster using 'ioredis' or 'redis'.
export const redisCache = new LRUCache<string, any>({
  max: 1000, // Keep max 1000 roadmaps in memory
  ttl: 1000 * 60 * 60, // 1 hour TTL
  updateAgeOnGet: true, // LRU behavior
});

// Cache wrapper functions for uniform access
export async function getCache(key: string) {
  // In real Redis, this is await redis.get(key)
  return redisCache.get(key);
}

export async function setCache(key: string, value: any, ttlMs: number = 1000 * 60 * 60) {
  // In real Redis, this is await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  redisCache.set(key, value, { ttl: ttlMs });
}

export async function clearCachePrefix(prefix: string) {
  // Clear matching keys
  const keysToDelete: string[] = [];
  for (const [key] of redisCache.entries()) {
    if (key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(k => redisCache.delete(k));
}

export async function deleteCache(key: string) {
  redisCache.delete(key);
}
