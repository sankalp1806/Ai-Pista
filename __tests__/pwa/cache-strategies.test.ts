/**
 * @jest-environment jsdom
 */

import {
  getCacheManager,
  DEFAULT_CACHE_STRATEGIES,
  CacheUtils,
} from '../../lib/cache-strategies';

describe('Cache Strategies', () => {
  let mockCache: any;
  let mockCaches: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock cache instance
    mockCache = {
      keys: jest.fn().mockResolvedValue([]),
      match: jest.fn().mockResolvedValue(null),
      put: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(true),
    };

    // Mock caches API
    mockCaches = {
      keys: jest.fn().mockResolvedValue(['cache1', 'cache2']),
      open: jest.fn().mockResolvedValue(mockCache),
      delete: jest.fn().mockResolvedValue(true),
    };

    (global as any).caches = mockCaches;

    // Mock navigator.storage
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: jest.fn().mockResolvedValue({
          quota: 1000000,
          usage: 500000,
        }),
      },
      writable: true,
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue(
      new Response('test content', {
        status: 200,
        headers: { 'content-length': '12' },
      })
    );
  });

  describe('CacheManager', () => {
    it('should get cache status', async () => {
      const manager = getCacheManager();
      
      mockCache.keys.mockResolvedValue([
        new Request('https://example.com/test1'),
        new Request('https://example.com/test2'),
      ]);

      mockCache.match.mockImplementation((request: Request) => {
        return Promise.resolve(
          new Response('test', {
            headers: { 'content-length': '4' },
          })
        );
      });

      const status = await manager.getStatus();

      expect(status).toHaveLength(2);
      expect(status[0]).toMatchObject({
        name: 'cache1',
        entryCount: 2,
        size: expect.any(Number),
        quota: {
          used: 500000,
          available: 1000000,
          percentage: 50,
        },
      });
    });

    it('should cleanup caches', async () => {
      const manager = getCacheManager();
      
      // Should not throw
      await manager.cleanup();
    });

    it('should clear expired entries', async () => {
      const manager = getCacheManager();
      
      const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 25); // 25 hours ago
      mockCache.keys.mockResolvedValue([new Request('https://example.com/old')]);
      mockCache.match.mockResolvedValue(
        new Response('old content', {
          headers: { date: oldDate.toISOString() },
        })
      );

      // Mock cache names to include a cache that matches our strategy
      mockCaches.keys.mockResolvedValue(['static-assets-cache']);

      await manager.clearExpired();

      // The cache should be checked for expired entries
      expect(mockCache.keys).toHaveBeenCalled();
      expect(mockCache.match).toHaveBeenCalled();
    });

    it('should enforce quota limits', async () => {
      const manager = getCacheManager();
      
      // Mock high quota usage
      (navigator.storage.estimate as jest.Mock).mockResolvedValue({
        quota: 1000000,
        usage: 900000, // 90% usage
      });

      mockCache.keys.mockResolvedValue([
        new Request('https://example.com/test1'),
        new Request('https://example.com/test2'),
      ]);

      // Mock cache names to include a cache that allows purging
      mockCaches.keys.mockResolvedValue(['static-assets-cache']);

      await manager.enforceQuota();

      // Should attempt to delete some entries
      expect(mockCache.delete).toHaveBeenCalled();
    });

    it('should warm cache with URLs', async () => {
      const manager = getCacheManager();
      const urls = ['https://example.com/test1.js', 'https://example.com/test2.css'];

      await manager.warmCache(urls);

      expect(global.fetch).toHaveBeenCalledTimes(urls.length);
      expect(mockCache.put).toHaveBeenCalledTimes(urls.length);
    });

    it('should get cache size', async () => {
      const manager = getCacheManager();
      
      mockCache.keys.mockResolvedValue([new Request('https://example.com/test')]);
      mockCache.match.mockResolvedValue(
        new Response('test content', {
          headers: { 'content-length': '12' },
        })
      );

      const size = await manager.getCacheSize('test-cache');

      expect(size).toBe(12);
    });

    it('should delete cache entry', async () => {
      const manager = getCacheManager();
      
      const result = await manager.deleteCacheEntry('test-cache', 'https://example.com/test');

      expect(mockCache.delete).toHaveBeenCalledWith('https://example.com/test');
      expect(result).toBe(true);
    });

    it('should handle missing caches API gracefully', async () => {
      delete (global as any).caches;
      
      const manager = getCacheManager();
      
      const status = await manager.getStatus();
      expect(status).toEqual([]);
      
      const size = await manager.getCacheSize('test');
      expect(size).toBe(0);
      
      const deleted = await manager.deleteCacheEntry('test', 'url');
      expect(deleted).toBe(false);
    });

    it('should handle missing storage API gracefully', async () => {
      // Create a new manager instance that will check for storage
      const manager = getCacheManager();
      
      // Mock the storage check to return false
      const originalNavigator = global.navigator;
      (global as any).navigator = {};
      
      // Should not throw
      await manager.enforceQuota();
      
      // Restore navigator
      (global as any).navigator = originalNavigator;
    });
  });

  describe('Default Cache Strategies', () => {
    it('should have correct number of strategies', () => {
      expect(DEFAULT_CACHE_STRATEGIES).toHaveLength(5);
    });

    it('should have static assets strategy', () => {
      const strategy = DEFAULT_CACHE_STRATEGIES.find(s => s.name === 'static-assets');
      expect(strategy).toBeDefined();
      expect(strategy?.handler).toBe('CacheFirst');
      expect(strategy?.urlPattern).toBeInstanceOf(RegExp);
    });

    it('should have API calls strategy', () => {
      const strategy = DEFAULT_CACHE_STRATEGIES.find(s => s.name === 'api-calls');
      expect(strategy).toBeDefined();
      expect(strategy?.handler).toBe('NetworkFirst');
    });

    it('should have HTML pages strategy', () => {
      const strategy = DEFAULT_CACHE_STRATEGIES.find(s => s.name === 'html-pages');
      expect(strategy).toBeDefined();
      expect(strategy?.handler).toBe('StaleWhileRevalidate');
    });

    it('should have fonts strategy', () => {
      const strategy = DEFAULT_CACHE_STRATEGIES.find(s => s.name === 'fonts');
      expect(strategy).toBeDefined();
      expect(strategy?.handler).toBe('CacheFirst');
    });

    it('should have images strategy', () => {
      const strategy = DEFAULT_CACHE_STRATEGIES.find(s => s.name === 'images');
      expect(strategy).toBeDefined();
      expect(strategy?.handler).toBe('StaleWhileRevalidate');
    });
  });

  describe('CacheUtils', () => {
    it('should identify cacheable responses', () => {
      const cacheableResponse = new Response('test', { status: 200 });
      Object.defineProperty(cacheableResponse, 'type', { value: 'basic' });
      
      expect(CacheUtils.isCacheable(cacheableResponse)).toBe(true);
    });

    it('should identify non-cacheable responses', () => {
      const nonCacheableResponse = new Response('test', { 
        status: 404,
        headers: { 'cache-control': 'no-store' },
      });
      Object.defineProperty(nonCacheableResponse, 'type', { value: 'basic' });
      
      expect(CacheUtils.isCacheable(nonCacheableResponse)).toBe(false);
    });

    it('should create cache key from request', () => {
      const request = new Request('https://example.com/test?_t=123&v=456&param=value');
      const key = CacheUtils.createCacheKey(request);
      
      // The function should return a string (exact format depends on URL implementation)
      expect(typeof key).toBe('string');
      expect(key).toContain('example.com');
    });

    it('should add timestamp to response', () => {
      const originalResponse = new Response('test', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      });
      
      const timestampedResponse = CacheUtils.addTimestamp(originalResponse);
      
      expect(timestampedResponse.headers.get('sw-cached-at')).toBeTruthy();
      expect(timestampedResponse.headers.get('content-type')).toBe('text/plain');
      expect(timestampedResponse.status).toBe(200);
    });

    it('should check if response is expired', () => {
      const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 25); // 25 hours ago
      const response = new Response('test', {
        headers: { 'sw-cached-at': oldDate.toISOString() },
      });
      
      const isExpired = CacheUtils.isExpired(response, 60 * 60 * 24); // 24 hours max age
      
      expect(isExpired).toBe(true);
    });

    it('should check if response is not expired', () => {
      const recentDate = new Date(Date.now() - 1000 * 60 * 60 * 12); // 12 hours ago
      const response = new Response('test', {
        headers: { 'sw-cached-at': recentDate.toISOString() },
      });
      
      const isExpired = CacheUtils.isExpired(response, 60 * 60 * 24); // 24 hours max age
      
      expect(isExpired).toBe(false);
    });

    it('should handle response without timestamp', () => {
      const response = new Response('test');
      
      const isExpired = CacheUtils.isExpired(response, 60 * 60 * 24);
      
      expect(isExpired).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle cache operation errors gracefully', async () => {
      // Mock caches.keys to throw an error
      mockCaches.keys.mockRejectedValue(new Error('Cache error'));
      
      const manager = getCacheManager();
      
      // Should not throw
      await manager.clearExpired();
      
      // Reset mock
      mockCaches.keys.mockResolvedValue(['cache1', 'cache2']);
    });

    it('should handle fetch errors during cache warming', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const manager = getCacheManager();
      
      // Should not throw
      await manager.warmCache(['https://example.com/test']);
    });

    it('should handle quota estimation errors', async () => {
      // Temporarily replace the estimate function
      const originalEstimate = navigator.storage.estimate;
      (navigator.storage as any).estimate = jest.fn().mockRejectedValue(new Error('Storage error'));
      
      const manager = getCacheManager();
      
      // Should not throw
      await manager.enforceQuota();
      
      // Restore original function
      (navigator.storage as any).estimate = originalEstimate;
    });

    it('should handle cache size calculation errors', async () => {
      mockCache.match.mockResolvedValue(
        new Response('test', { headers: {} }) // No content-length
      );
      
      // Mock blob() to simulate error
      const mockBlob = jest.fn().mockRejectedValue(new Error('Blob error'));
      Response.prototype.blob = mockBlob;
      
      const manager = getCacheManager();
      const size = await manager.getCacheSize('test-cache');
      
      // Should return 0 on error
      expect(size).toBe(0);
    });
  });
});
