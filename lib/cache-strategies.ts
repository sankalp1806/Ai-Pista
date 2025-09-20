/**
 * Cache strategies and management utilities for PWA service worker
 */

export interface CacheConfig {
  name: string;
  maxEntries?: number;
  maxAgeSeconds?: number;
  purgeOnQuotaError?: boolean;
}

export interface CacheStrategy {
  name: string;
  handler: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate' | 'NetworkOnly' | 'CacheOnly';
  urlPattern: RegExp | string;
  options: CacheConfig;
}

export interface CacheStatus {
  name: string;
  size: number;
  entryCount: number;
  lastAccessed: Date;
  quota: {
    used: number;
    available: number;
    percentage: number;
  };
}

export interface CacheManager {
  getStatus(): Promise<CacheStatus[]>;
  cleanup(): Promise<void>;
  clearExpired(): Promise<void>;
  enforceQuota(): Promise<void>;
  warmCache(urls: string[]): Promise<void>;
  getCacheSize(cacheName: string): Promise<number>;
  deleteCacheEntry(cacheName: string, url: string): Promise<boolean>;
}

/**
 * Default cache strategies for different resource types
 */
export const DEFAULT_CACHE_STRATEGIES: CacheStrategy[] = [
  // Static assets - Cache First
  {
    name: 'static-assets',
    handler: 'CacheFirst',
    urlPattern: /\.(js|css|woff|woff2|ttf|eot|ico|png|jpg|jpeg|gif|svg|webp)$/i,
    options: {
      name: 'static-assets-cache',
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      purgeOnQuotaError: true,
    },
  },
  // API calls - Network First
  {
    name: 'api-calls',
    handler: 'NetworkFirst',
    urlPattern: /\/api\//,
    options: {
      name: 'api-cache',
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24, // 24 hours
      purgeOnQuotaError: false,
    },
  },
  // HTML pages - Stale While Revalidate
  {
    name: 'html-pages',
    handler: 'StaleWhileRevalidate',
    urlPattern: /\.html$|\/$/,
    options: {
      name: 'pages-cache',
      maxEntries: 20,
      maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      purgeOnQuotaError: true,
    },
  },
  // Fonts - Cache First with long expiration
  {
    name: 'fonts',
    handler: 'CacheFirst',
    urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
    options: {
      name: 'fonts-cache',
      maxEntries: 20,
      maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      purgeOnQuotaError: false,
    },
  },
  // Images - Stale While Revalidate
  {
    name: 'images',
    handler: 'StaleWhileRevalidate',
    urlPattern: /\/_next\/image\?/,
    options: {
      name: 'images-cache',
      maxEntries: 60,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      purgeOnQuotaError: true,
    },
  },
];

/**
 * Cache management implementation
 */
class CacheManagerImpl implements CacheManager {
  private readonly QUOTA_THRESHOLD = 0.8; // 80% of available quota
  private readonly CLEANUP_BATCH_SIZE = 10;

  /**
   * Get status of all caches
   */
  async getStatus(): Promise<CacheStatus[]> {
    if (!('caches' in window) || !('storage' in navigator) || !navigator.storage) {
      return [];
    }

    const cacheNames = await caches.keys();
    const quota = await navigator.storage.estimate();
    const totalQuota = quota.quota || 0;
    const usedQuota = quota.usage || 0;

    const statuses: CacheStatus[] = [];

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      const size = await this.calculateCacheSize(cache, keys);

      statuses.push({
        name: cacheName,
        size,
        entryCount: keys.length,
        lastAccessed: new Date(), // Would need to track this separately in real implementation
        quota: {
          used: usedQuota,
          available: totalQuota,
          percentage: totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0,
        },
      });
    }

    return statuses;
  }

  /**
   * Perform cache cleanup based on age and quota
   */
  async cleanup(): Promise<void> {
    await this.clearExpired();
    await this.enforceQuota();
  }

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    if (!('caches' in window)) return;

    const cacheNames = await caches.keys();
    const now = Date.now();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      const strategy = this.findStrategyForCache(cacheName);

      if (!strategy?.options.maxAgeSeconds) continue;

      const maxAge = strategy.options.maxAgeSeconds * 1000;

      for (const request of keys) {
        const response = await cache.match(request);
        if (!response) continue;

        const dateHeader = response.headers.get('date');
        if (!dateHeader) continue;

        const responseDate = new Date(dateHeader).getTime();
        if (now - responseDate > maxAge) {
          await cache.delete(request);
        }
      }
    }
  }

  /**
   * Enforce storage quota by removing oldest entries
   */
  async enforceQuota(): Promise<void> {
    if (!('storage' in navigator) || !navigator.storage) return;

    const quota = await navigator.storage.estimate();
    const totalQuota = quota.quota || 0;
    const usedQuota = quota.usage || 0;

    if (totalQuota === 0 || usedQuota / totalQuota < this.QUOTA_THRESHOLD) {
      return;
    }

    // Remove entries from caches that allow purging
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const strategy = this.findStrategyForCache(cacheName);
      if (!strategy?.options.purgeOnQuotaError) continue;

      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      // Remove oldest entries in batches
      const entriesToRemove = Math.min(this.CLEANUP_BATCH_SIZE, keys.length);
      for (let i = 0; i < entriesToRemove; i++) {
        await cache.delete(keys[i]);
      }

      // Check if we're under quota threshold
      const newQuota = await navigator.storage.estimate();
      const newUsed = newQuota.usage || 0;
      if (newUsed / totalQuota < this.QUOTA_THRESHOLD) {
        break;
      }
    }
  }

  /**
   * Warm cache with specified URLs
   */
  async warmCache(urls: string[]): Promise<void> {
    if (!('caches' in window)) return;

    const promises = urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const strategy = this.findStrategyForUrl(url);
          if (strategy) {
            const cache = await caches.open(strategy.options.name);
            await cache.put(url, response.clone());
          }
        }
      } catch (error) {
        console.warn(`Failed to warm cache for ${url}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get size of a specific cache
   */
  async getCacheSize(cacheName: string): Promise<number> {
    if (!('caches' in window)) return 0;

    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      return this.calculateCacheSize(cache, keys);
    } catch {
      return 0;
    }
  }

  /**
   * Delete a specific cache entry
   */
  async deleteCacheEntry(cacheName: string, url: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    try {
      const cache = await caches.open(cacheName);
      return cache.delete(url);
    } catch {
      return false;
    }
  }

  /**
   * Calculate approximate cache size
   */
  private async calculateCacheSize(cache: Cache, keys: readonly Request[]): Promise<number> {
    let totalSize = 0;

    for (const request of keys) {
      try {
        const response = await cache.match(request);
        if (response) {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            totalSize += parseInt(contentLength, 10);
          } else {
            // Estimate size if content-length is not available
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      } catch {
        // Skip entries that can't be read
      }
    }

    return totalSize;
  }

  /**
   * Find cache strategy for a given cache name
   */
  private findStrategyForCache(cacheName: string): CacheStrategy | undefined {
    return DEFAULT_CACHE_STRATEGIES.find(
      strategy => strategy.options.name === cacheName
    );
  }

  /**
   * Find cache strategy for a given URL
   */
  private findStrategyForUrl(url: string): CacheStrategy | undefined {
    return DEFAULT_CACHE_STRATEGIES.find(strategy => {
      if (typeof strategy.urlPattern === 'string') {
        return url.includes(strategy.urlPattern);
      }
      return strategy.urlPattern.test(url);
    });
  }
}

// Singleton instance
let cacheManager: CacheManager | null = null;

/**
 * Get the cache manager instance
 */
export function getCacheManager(): CacheManager {
  if (!cacheManager) {
    cacheManager = new CacheManagerImpl();
  }
  return cacheManager;
}

/**
 * Utility functions for cache operations
 */
export const CacheUtils = {
  /**
   * Check if a response is cacheable
   */
  isCacheable(response: Response): boolean {
    return (
      response.status === 200 &&
      response.type === 'basic' &&
      !response.headers.get('cache-control')?.includes('no-store')
    );
  },

  /**
   * Create a cache key from request
   */
  createCacheKey(request: Request): string {
    const url = new URL(request.url);
    // Remove cache-busting parameters
    url.searchParams.delete('_t');
    url.searchParams.delete('v');
    return url.toString();
  },

  /**
   * Add timestamp to response headers for expiration tracking
   */
  addTimestamp(response: Response): Response {
    const headers = new Headers(response.headers);
    if (!headers.has('date')) {
      headers.set('date', new Date().toISOString());
    }
    headers.set('sw-cached-at', new Date().toISOString());
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },

  /**
   * Check if cached response is expired
   */
  isExpired(response: Response, maxAgeSeconds: number): boolean {
    const cachedAt = response.headers.get('sw-cached-at');
    if (!cachedAt) return false;

    const cachedTime = new Date(cachedAt).getTime();
    const now = Date.now();
    return (now - cachedTime) > (maxAgeSeconds * 1000);
  },
};