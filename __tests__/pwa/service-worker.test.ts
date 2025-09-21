/**
 * @jest-environment jsdom
 */

import {
  getServiceWorkerManager,
  registerServiceWorker,
  unregisterServiceWorker,
  isServiceWorkerActive,
  getServiceWorkerStatus,
} from '../../lib/service-worker';
import { getCacheManager } from '../../lib/cache-strategies';

// Mock the PWA config
jest.mock('../../lib/pwa-config', () => ({
  getServiceWorkerConfig: () => ({
    updateCheckInterval: 1000, // Short interval for testing
    skipWaiting: true,
    clientsClaim: true,
  }),
  isPWAEnabled: () => true,
}));

describe('Service Worker Manager', () => {
  let mockRegistration: Partial<ServiceWorkerRegistration>;
  let mockServiceWorker: Partial<ServiceWorker>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Mock service worker
    mockServiceWorker = {
      state: 'activated',
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
    };

    // Mock registration
    mockRegistration = {
      active: mockServiceWorker as ServiceWorker,
      waiting: null,
      installing: null,
      update: jest.fn().mockResolvedValue(undefined),
      unregister: jest.fn().mockResolvedValue(true),
      addEventListener: jest.fn(),
    };

    // Mock navigator.serviceWorker
    Object.defineProperty(window, 'navigator', {
      value: {
        serviceWorker: {
          register: jest.fn().mockResolvedValue(mockRegistration),
          getRegistration: jest.fn().mockResolvedValue(mockRegistration),
          addEventListener: jest.fn(),
          controller: mockServiceWorker,
        },
      },
      writable: true,
    });

    // Mock caches API
    (global as any).caches = {
      keys: jest.fn().mockResolvedValue(['cache1', 'cache2']),
      delete: jest.fn().mockResolvedValue(true),
      open: jest.fn().mockResolvedValue({
        keys: jest.fn().mockResolvedValue([]),
        match: jest.fn().mockResolvedValue(null),
        put: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(true),
      }),
    };

    // Mock window events
    window.dispatchEvent = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ServiceWorkerManager', () => {
    it('should register service worker successfully', async () => {
      const manager = getServiceWorkerManager();
      const registration = await manager.register();

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
      });
      expect(registration).toBe(mockRegistration);
    });

    it('should handle registration failure', async () => {
      const error = new Error('Registration failed');
      (navigator.serviceWorker.register as jest.Mock).mockRejectedValue(error);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const manager = getServiceWorkerManager();
      const registration = await manager.register();

      expect(registration).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Service Worker registration failed:', error);
      
      consoleSpy.mockRestore();
    });

    it('should unregister service worker', async () => {
      const manager = getServiceWorkerManager();
      await manager.register();
      
      const result = await manager.unregister();

      expect(mockRegistration.unregister).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should update service worker', async () => {
      const manager = getServiceWorkerManager();
      await manager.register();
      
      await manager.update();

      expect(mockRegistration.update).toHaveBeenCalled();
    });

    it('should skip waiting for new service worker', async () => {
      const waitingWorker = {
        ...mockServiceWorker,
        postMessage: jest.fn(),
      };
      mockRegistration.waiting = waitingWorker as ServiceWorker;
      
      const manager = getServiceWorkerManager();
      await manager.register();
      
      await manager.skipWaiting();

      expect(waitingWorker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    });

    it('should get cache names', async () => {
      const manager = getServiceWorkerManager();
      const cacheNames = await manager.getCacheNames();

      expect(caches.keys).toHaveBeenCalled();
      expect(cacheNames).toEqual(['cache1', 'cache2']);
    });

    it('should clear specific cache', async () => {
      const manager = getServiceWorkerManager();
      await manager.clearCache('cache1');

      expect(caches.delete).toHaveBeenCalledWith('cache1');
    });

    it('should clear all caches', async () => {
      const manager = getServiceWorkerManager();
      await manager.clearCache();

      expect(caches.keys).toHaveBeenCalled();
      expect(caches.delete).toHaveBeenCalledWith('cache1');
      expect(caches.delete).toHaveBeenCalledWith('cache2');
    });

    it('should get registration', async () => {
      const manager = getServiceWorkerManager();
      await manager.register();
      
      const registration = await manager.getRegistration();

      expect(registration).toBe(mockRegistration);
    });

    it('should get cache status', async () => {
      const manager = getServiceWorkerManager();
      const status = await manager.getCacheStatus();

      expect(Array.isArray(status)).toBe(true);
    });

    it('should cleanup caches', async () => {
      const manager = getServiceWorkerManager();
      
      // Should not throw
      await manager.cleanupCaches();
    });

    it('should warm cache with URLs', async () => {
      const manager = getServiceWorkerManager();
      const urls = ['https://example.com/api/test', '/static/image.png'];
      
      // Mock fetch for cache warming
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        clone: () => ({ ok: true, status: 200 }),
      });
      
      await manager.warmCache(urls);
      
      expect(global.fetch).toHaveBeenCalledTimes(urls.length);
    });

    it('should get cache manager', () => {
      const manager = getServiceWorkerManager();
      const cacheManager = manager.getCacheManager();

      expect(cacheManager).toBeDefined();
      expect(typeof cacheManager.getStatus).toBe('function');
    });

    it('should handle update events', async () => {
      const manager = getServiceWorkerManager();
      await manager.register();

      // Simulate updatefound event
      const updateFoundCallback = (mockRegistration.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'updatefound')?.[1];
      
      if (updateFoundCallback) {
        const installingWorker = {
          ...mockServiceWorker,
          state: 'installing',
          addEventListener: jest.fn(),
        };
        mockRegistration.installing = installingWorker as ServiceWorker;
        
        updateFoundCallback();
        
        // Simulate state change to installed
        const stateChangeCallback = (installingWorker.addEventListener as jest.Mock).mock.calls
          .find(call => call[0] === 'statechange')?.[1];
        
        if (stateChangeCallback) {
          installingWorker.state = 'installed';
          stateChangeCallback();
          
          expect(window.dispatchEvent).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'sw-update',
              detail: { type: 'available' },
            })
          );
        }
      }
    });
  });

  describe('Utility Functions', () => {
    it('should register service worker using utility function', async () => {
      const registration = await registerServiceWorker();
      
      expect(navigator.serviceWorker.register).toHaveBeenCalled();
      expect(registration).toBe(mockRegistration);
    });

    it('should unregister service worker using utility function', async () => {
      await registerServiceWorker();
      const result = await unregisterServiceWorker();
      
      expect(result).toBe(true);
    });

    it('should check if service worker is active', async () => {
      const isActive = await isServiceWorkerActive();
      
      expect(isActive).toBe(true);
    });

    it('should get service worker status', async () => {
      const status = await getServiceWorkerStatus();
      
      expect(status).toEqual({
        supported: true,
        registered: true,
        active: true,
        waiting: false,
        installing: false,
      });
    });

    it('should handle unsupported service worker', async () => {
      delete (window.navigator as any).serviceWorker;
      
      const status = await getServiceWorkerStatus();
      
      expect(status).toEqual({
        supported: false,
        registered: false,
        active: false,
        waiting: false,
        installing: false,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service worker not supported', async () => {
      delete (window.navigator as any).serviceWorker;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const manager = getServiceWorkerManager();
      const registration = await manager.register();

      expect(registration).toBeNull();
      // Console log is suppressed in test environment
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle update failure gracefully', async () => {
      const error = new Error('Update failed');
      mockRegistration.update = jest.fn().mockRejectedValue(error);
      
      const manager = getServiceWorkerManager();
      await manager.register();
      
      await expect(manager.update()).rejects.toThrow('Update failed');
    });

    it('should handle skip waiting when no waiting worker', async () => {
      mockRegistration.waiting = null;
      
      const manager = getServiceWorkerManager();
      await manager.register();
      
      // Should not throw
      await manager.skipWaiting();
    });

    it('should handle cache operations when not supported', async () => {
      delete (global as any).caches;
      
      const manager = getServiceWorkerManager();
      
      const cacheNames = await manager.getCacheNames();
      expect(cacheNames).toEqual([]);
      
      // Should not throw
      await manager.clearCache();
    });
  });
});
