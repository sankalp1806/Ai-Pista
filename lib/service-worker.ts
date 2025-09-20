/**
 * Service Worker registration and management utilities
 */

import { getServiceWorkerConfig, isPWAEnabled } from './pwa-config';
import { getCacheManager, CacheStatus, CacheManager } from './cache-strategies';

export interface ServiceWorkerManager {
  register(): Promise<ServiceWorkerRegistration | null>;
  unregister(): Promise<boolean>;
  update(): Promise<void>;
  skipWaiting(): Promise<void>;
  getCacheNames(): Promise<string[]>;
  clearCache(cacheName?: string): Promise<void>;
  getRegistration(): Promise<ServiceWorkerRegistration | null>;
  getCacheStatus(): Promise<CacheStatus[]>;
  cleanupCaches(): Promise<void>;
  warmCache(urls: string[]): Promise<void>;
  getCacheManager(): CacheManager;
}

class ServiceWorkerManagerImpl implements ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateCheckInterval: number;
  private cacheManager: CacheManager;

  constructor() {
    const config = getServiceWorkerConfig();
    this.updateCheckInterval = config.updateCheckInterval;
    this.cacheManager = getCacheManager();
  }

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!isPWAEnabled() || !('serviceWorker' in navigator)) {
      if (process.env.NODE_ENV !== 'test') {
        console.log('Service Worker not supported or PWA disabled');
      }
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      if (process.env.NODE_ENV !== 'test') {
        console.log('Service Worker registered successfully:', this.registration);
      }

      // Set up update checking
      this.setupUpdateChecking();

      // Handle service worker updates
      this.handleServiceWorkerUpdates();

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        return registration.unregister();
      }
      return false;
    }

    return this.registration.unregister();
  }

  /**
   * Update the service worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    await this.registration.update();
  }

  /**
   * Skip waiting for the new service worker
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    // Send skip waiting message to the waiting service worker
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Get all cache names
   */
  async getCacheNames(): Promise<string[]> {
    if (!('caches' in window)) {
      return [];
    }

    return caches.keys();
  }

  /**
   * Clear cache by name or all caches
   */
  async clearCache(cacheName?: string): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    if (cacheName) {
      await caches.delete(cacheName);
    } else {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  }

  /**
   * Get the current service worker registration
   */
  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.registration) {
      return this.registration;
    }

    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.getRegistration();
    }

    return null;
  }

  /**
   * Get cache status for all caches
   */
  async getCacheStatus(): Promise<CacheStatus[]> {
    return this.cacheManager.getStatus();
  }

  /**
   * Cleanup caches (remove expired entries and enforce quota)
   */
  async cleanupCaches(): Promise<void> {
    return this.cacheManager.cleanup();
  }

  /**
   * Warm cache with specified URLs
   */
  async warmCache(urls: string[]): Promise<void> {
    return this.cacheManager.warmCache(urls);
  }

  /**
   * Get the cache manager instance
   */
  getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  /**
   * Set up periodic update checking
   */
  private setupUpdateChecking(): void {
    if (!this.registration) return;

    // Check for updates periodically
    setInterval(async () => {
      try {
        await this.registration?.update();
      } catch (error) {
        console.error('Service Worker update check failed:', error);
      }
    }, this.updateCheckInterval);
  }

  /**
   * Handle service worker state changes and updates
   */
  private handleServiceWorkerUpdates(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is available
          this.dispatchUpdateEvent('available');
        }
      });
    });

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        this.dispatchUpdateEvent('applied');
      }
    });

    // Handle controlling service worker changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Service worker has been updated and is now controlling the page
      this.dispatchUpdateEvent('controlling');
    });
  }

  /**
   * Dispatch custom events for service worker updates
   */
  private dispatchUpdateEvent(type: 'available' | 'applied' | 'controlling'): void {
    const event = new CustomEvent('sw-update', {
      detail: { type },
    });
    window.dispatchEvent(event);
  }
}

// Singleton instance
let serviceWorkerManager: ServiceWorkerManager | null = null;

/**
 * Get the service worker manager instance
 */
export function getServiceWorkerManager(): ServiceWorkerManager {
  if (!serviceWorkerManager) {
    serviceWorkerManager = new ServiceWorkerManagerImpl();
  }
  return serviceWorkerManager;
}

/**
 * Registers the application's service worker and returns its registration.
 *
 * Resolves with the ServiceWorkerRegistration when registration succeeds, or
 * with `null` if service workers are not supported, PWA support is disabled,
 * or registration fails.
 *
 * @returns The new ServiceWorkerRegistration, or `null` on unsupported/failed registration
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  const manager = getServiceWorkerManager();
  return manager.register();
}

/**
 * Unregister the currently registered service worker, if any.
 *
 * Resolves to `true` if a service worker registration was found and successfully unregistered;
 * resolves to `false` if no registration existed or unregistration did not occur.
 *
 * @returns A promise that resolves to a boolean indicating whether unregistration occurred.
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  const manager = getServiceWorkerManager();
  return manager.unregister();
}

/**
 * Check if service worker is registered and active
 */
export async function isServiceWorkerActive(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  return !!(registration && registration.active);
}

/**
 * Returns the current service worker support and registration state.
 *
 * Resolves to an object describing whether service workers are supported in the
 * current environment and whether a registration is present, including the
 * presence of active, waiting, and installing workers.
 *
 * @returns An object with:
 *  - `supported` — true if the browser exposes `navigator.serviceWorker`.
 *  - `registered` — true if a ServiceWorkerRegistration is available.
 *  - `active` — true if the registration has an active worker.
 *  - `waiting` — true if the registration has a waiting worker.
 *  - `installing` — true if the registration has an installing worker.
 */
export async function getServiceWorkerStatus(): Promise<{
  supported: boolean;
  registered: boolean;
  active: boolean;
  waiting: boolean;
  installing: boolean;
}> {
  const supported = 'serviceWorker' in navigator;
  
  if (!supported) {
    return {
      supported: false,
      registered: false,
      active: false,
      waiting: false,
      installing: false,
    };
  }

  const registration = await navigator.serviceWorker.getRegistration();
  
  return {
    supported: true,
    registered: !!registration,
    active: !!(registration && registration.active),
    waiting: !!(registration && registration.waiting),
    installing: !!(registration && registration.installing),
  };
}