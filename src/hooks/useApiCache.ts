import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default 5 minutes
  enabled?: boolean; // Default true
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const apiCache = new ApiCache();

// Clean up expired entries every 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);

export function useApiCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
} {
  const { ttl = 5 * 60 * 1000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // Check cache first (unless forcing refresh)
      if (!force) {
        const cachedData = apiCache.get<T>(cacheKey);
        if (cachedData !== null) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const result = await fetcher();
      setData(result);

      // Cache the result
      apiCache.set(cacheKey, result, ttl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetcher, ttl, enabled]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    apiCache.delete(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch, invalidate };
}

// Hook for prefetching data
export function usePrefetch() {
  const prefetch = useCallback(async <T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    ttl = 5 * 60 * 1000
  ) => {
    try {
      const result = await fetcher();
      apiCache.set(cacheKey, result, ttl);
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }, []);

  return prefetch;
}

// Hook for cache management
export function useCache() {
  const clearCache = useCallback(() => {
    apiCache.clear();
  }, []);

  const invalidateKey = useCallback((key: string) => {
    apiCache.delete(key);
  }, []);

  const getCacheSize = useCallback(() => {
    return apiCache['cache'].size;
  }, []);

  return { clearCache, invalidateKey, getCacheSize };
}