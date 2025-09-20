/**
 * Custom Service Worker with advanced caching strategies
 * This file implements cache-first, network-first, and stale-while-revalidate strategies
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-assets-cache-${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-cache-${CACHE_VERSION}`;
const FONTS_CACHE = `fonts-cache-${CACHE_VERSION}`;
const IMAGES_CACHE = `images-cache-${CACHE_VERSION}`;

// Cache configurations
const CACHE_CONFIGS = {
  [STATIC_CACHE]: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
  [API_CACHE]: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }, // 24 hours
  [PAGES_CACHE]: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
  [FONTS_CACHE]: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
  [IMAGES_CACHE]: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
};

// URL patterns for different cache strategies
const CACHE_PATTERNS = {
  static: /\.(js|css|woff|woff2|ttf|eot|ico|png|jpg|jpeg|gif|svg|webp)$/i,
  api: /\/api\//,
  fonts: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
  images: /\/_next\/image\?/,
  pages: /\.html$|\/$/,
};

/**
 * Install event - precache essential resources
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Precache essential resources
      return cache.addAll([
        '/',
        '/manifest.json',
        // Add other essential resources here
      ]);
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Claim all clients
      self.clients.claim(),
      // Cleanup old caches
      cleanupOldCaches(),
    ])
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on URL pattern
  if (CACHE_PATTERNS.static.test(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (CACHE_PATTERNS.api.test(url.pathname)) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else if (CACHE_PATTERNS.fonts.test(url.href)) {
    event.respondWith(cacheFirstStrategy(request, FONTS_CACHE));
  } else if (CACHE_PATTERNS.images.test(url.href)) {
    event.respondWith(staleWhileRevalidateStrategy(request, IMAGES_CACHE));
  } else if (CACHE_PATTERNS.pages.test(url.pathname)) {
    event.respondWith(staleWhileRevalidateStrategy(request, PAGES_CACHE));
  } else {
    // Default to network first for other requests
    event.respondWith(networkFirstStrategy(request, PAGES_CACHE));
  }
});

/**
 * Message event - handle commands from main thread
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEANUP_CACHES':
      event.waitUntil(cleanupCaches());
      break;
    case 'WARM_CACHE':
      if (payload?.urls) {
        event.waitUntil(warmCache(payload.urls));
      }
      break;
    case 'GET_CACHE_STATUS':
      event.waitUntil(
        getCacheStatus().then((status) => {
          event.ports[0]?.postMessage({ type: 'CACHE_STATUS', payload: status });
        })
      );
      break;
  }
});

/**
 * Serve a request using a cache-first strategy: return a valid cached response if available,
 * otherwise fetch from the network, store a timestamped copy in the specified cache, and return
 * the network response.
 *
 * If the cached response exists but is expired, this function will perform a network fetch and
 * replace the cached entry. Successful network responses are timestamped (via addTimestamp)
 * before being stored and will trigger enforceMaxEntries for the cache.
 *
 * On error, attempts to return any stale cached response as a fallback; if none is available the
 * original error is rethrown.
 *
 * @param {Request} request - The request to satisfy.
 * @param {string} cacheName - Name of the cache to open/store entries (used for expiration and limits).
 * @returns {Promise<Response>} A response from cache or network.
 * @throws Will rethrow the original error if network/cache access fails and no cached fallback exists.
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !isExpired(cachedResponse, cacheName)) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = addTimestamp(networkResponse.clone());
      await cache.put(request, responseToCache);
      await enforceMaxEntries(cache, cacheName);
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    
    // Try to return stale cache as fallback
    const cache = await caches.open(cacheName);
    const staleResponse = await cache.match(request);
    if (staleResponse) {
      return staleResponse;
    }
    
    throw error;
  }
}

/**
 * Network-first fetch strategy: attempt a network request and fall back to cache on failure.
 *
 * Tries to fetch the request from the network (racing against a configurable timeout). If a network
 * response is received and is OK, the response is timestamped, stored in the given cache, and
 * cache size limits are enforced. If the network request fails or times out, a matching cached
 * response (if any) is returned. If neither network nor cache yields a response, the returned
 * promise rejects with the underlying error.
 *
 * @param {Request|string} request - The request to fetch or a URL string.
 * @param {string} cacheName - Name of the cache to store successful network responses and to read fallbacks from.
 * @param {number} [timeout=3000] - Milliseconds to wait for the network before treating it as a timeout.
 * @return {Promise<Response>} Resolves with a Response from network or cache; rejects if both fail.
 */
async function networkFirstStrategy(request, cacheName, timeout = 3000) {
  try {
    const cache = await caches.open(cacheName);
    
    // Race network request against timeout
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    );

    try {
      const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
      
      if (networkResponse.ok) {
        const responseToCache = addTimestamp(networkResponse.clone());
        await cache.put(request, responseToCache);
        await enforceMaxEntries(cache, cacheName);
      }

      return networkResponse;
    } catch (networkError) {
      // Network failed or timed out, try cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('Network-first strategy failed:', error);
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy: return a cached response immediately when available and valid,
 * while fetching an updated response in the background to refresh the cache.
 *
 * If a cached response exists and is not expired (per isExpired), it is returned immediately and
 * a network request runs in the background; a successful network response is timestamped,
 * stored in the given cache, and then enforceMaxEntries is run for that cache.
 *
 * If there is no cached response or the cached entry is expired, this function waits for the
 * network response, caches it on success, and returns it.
 *
 * @param {Request} request - The fetch request to satisfy and/or refresh.
 * @param {string} cacheName - The name of the cache to read from and write to.
 * @returns {Promise<Response|undefined>} A Response resolved from cache or network. May resolve
 * to undefined if the network update fails and no cached response is available.
 * @throws {Error} Propagates unexpected errors encountered while opening caches or performing operations.
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // Start network request in background
    const networkPromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        const responseToCache = addTimestamp(networkResponse.clone());
        await cache.put(request, responseToCache);
        await enforceMaxEntries(cache, cacheName);
      }
      return networkResponse;
    }).catch((error) => {
      console.warn('Background update failed:', error);
    });

    // Return cached response immediately if available
    if (cachedResponse && !isExpired(cachedResponse, cacheName)) {
      // Don't await the network promise - let it update in background
      networkPromise;
      return cachedResponse;
    }

    // No cache or expired, wait for network
    return await networkPromise;
  } catch (error) {
    console.error('Stale-while-revalidate strategy failed:', error);
    throw error;
  }
}

/**
 * Return a new Response identical to the given one but with an `sw-cached-at`
 * header set to the current ISO timestamp for cache expiration tracking.
 *
 * The original Response is not modified; the function builds a new Response
 * preserving status, statusText, headers (plus `sw-cached-at`) and body.
 *
 * @param {Response} response - The response to timestamp.
 * @return {Response} A cloned Response with the `sw-cached-at` header added.
 */
function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', new Date().toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Determine whether a cached Response has expired according to cache configuration.
 *
 * Reads the `sw-cached-at` header on the given Response and compares it against
 * the `maxAgeSeconds` for the provided cache name in CACHE_CONFIGS.
 *
 * If the response lacks the `sw-cached-at` header or the cache has no
 * `maxAgeSeconds` configured, the function returns false (treats the entry as not expired).
 *
 * @param {Response} response - The cached Response object (may contain `sw-cached-at` header).
 * @param {string} cacheName - The cache key used to look up `maxAgeSeconds` in CACHE_CONFIGS.
 * @returns {boolean} True if the cached response is older than the configured max age; otherwise false.
 */
function isExpired(response, cacheName) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;

  const config = CACHE_CONFIGS[cacheName];
  if (!config?.maxAgeSeconds) return false;

  const cachedTime = new Date(cachedAt).getTime();
  const now = Date.now();
  return (now - cachedTime) > (config.maxAgeSeconds * 1000);
}

/**
 * Trim a Cache to its configured maximum number of entries.
 *
 * If a maxEntries value is configured for the provided cacheName in CACHE_CONFIGS,
 * deletes the oldest cached requests until the number of entries is at or below that limit.
 *
 * @param {Cache} cache - The Cache instance to trim.
 * @param {string} cacheName - The key used to look up maxEntries in CACHE_CONFIGS.
 * @returns {Promise<void>} Resolves once trimming is complete.
 */
async function enforceMaxEntries(cache, cacheName) {
  const config = CACHE_CONFIGS[cacheName];
  if (!config?.maxEntries) return;

  const keys = await cache.keys();
  if (keys.length <= config.maxEntries) return;

  // Remove oldest entries
  const entriesToRemove = keys.length - config.maxEntries;
  for (let i = 0; i < entriesToRemove; i++) {
    await cache.delete(keys[i]);
  }
}

/**
 * Remove outdated service worker caches.
 *
 * Determines the set of current cache names from CACHE_CONFIGS and deletes any caches whose name includes "cache" but is not present in the current configuration.
 *
 * @returns {Promise<void>} Resolves when all old caches have been removed.
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = Object.values(CACHE_CONFIGS).map(config => config.name);
  
  const oldCaches = cacheNames.filter(name => 
    !Object.keys(CACHE_CONFIGS).includes(name) && 
    name.includes('cache')
  );

  await Promise.all(
    oldCaches.map(cacheName => caches.delete(cacheName))
  );
}

/**
 * Remove expired cached responses from all configured caches.
 *
 * Iterates through all caches whose names appear in CACHE_CONFIGS, checks each cached
 * response with isExpired, and deletes entries whose responses are expired.
 *
 * @returns {Promise<void>} Resolves when cleanup is complete.
 */
async function cleanupCaches() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    if (!CACHE_CONFIGS[cacheName]) continue;
    
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response && isExpired(response, cacheName)) {
        await cache.delete(request);
      }
    }
  }
}

/**
 * Preloads (warms) caches by fetching and storing a list of URLs.
 *
 * For each URL this function performs a fetch and, if the response is OK,
 * selects a target cache based on URL patterns (static, api, fonts, images,
 * otherwise pages), timestamps the response via addTimestamp, and stores it.
 * The operation proceeds in parallel for all URLs and the function waits for
 * all attempts to settle. Failures for individual URLs are caught and logged
 * but do not reject the overall operation.
 *
 * @param {string[]} urls - Array of absolute or relative request URLs to warm.
 */
async function warmCache(urls) {
  const promises = urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        // Determine appropriate cache based on URL
        let cacheName = PAGES_CACHE; // default
        
        if (CACHE_PATTERNS.static.test(url)) {
          cacheName = STATIC_CACHE;
        } else if (CACHE_PATTERNS.api.test(url)) {
          cacheName = API_CACHE;
        } else if (CACHE_PATTERNS.fonts.test(url)) {
          cacheName = FONTS_CACHE;
        } else if (CACHE_PATTERNS.images.test(url)) {
          cacheName = IMAGES_CACHE;
        }
        
        const cache = await caches.open(cacheName);
        const responseToCache = addTimestamp(response.clone());
        await cache.put(url, responseToCache);
      }
    } catch (error) {
      console.warn(`Failed to warm cache for ${url}:`, error);
    }
  });

  await Promise.allSettled(promises);
}

/**
 * Retrieve status information for all caches accessible to the service worker.
 *
 * Returns an array of cache status objects, each describing:
 * - name: cache name.
 * - entryCount: number of requests stored in the cache.
 * - size: total size in bytes of readable cached response bodies (best-effort, skips unreadable entries).
 * - lastAccessed: ISO timestamp when the status was generated.
 *
 * @return {Promise<Array<{name: string, entryCount: number, size: number, lastAccessed: string}>>}
 *         A promise that resolves to the list of cache status objects.
 */
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = [];

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    let totalSize = 0;
    for (const request of keys) {
      try {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      } catch {
        // Skip entries that can't be read
      }
    }

    status.push({
      name: cacheName,
      entryCount: keys.length,
      size: totalSize,
      lastAccessed: new Date().toISOString(),
    });
  }

  return status;
}

console.log('Custom Service Worker loaded');