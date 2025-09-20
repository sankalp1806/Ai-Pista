/**
 * PWA Configuration utilities
 * Handles PWA-specific settings and environment variables
 */

export interface PWAConfig {
  name: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  startUrl: string;
  scope: string;
  disableInDev: boolean;
}

export interface ServiceWorkerConfig {
  updateCheckInterval: number;
  skipWaiting: boolean;
  clientsClaim: boolean;
}

export interface PushNotificationConfig {
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
  vapidSubject?: string;
}

/**
 * Build a PWAConfig from environment variables.
 *
 * Reads NEXT_PUBLIC_PWA_* environment variables and returns a PWAConfig populated
 * from those values or sensible defaults.
 *
 * Environment variables:
 * - NEXT_PUBLIC_PWA_NAME
 * - NEXT_PUBLIC_PWA_SHORT_NAME
 * - NEXT_PUBLIC_PWA_THEME_COLOR
 * - NEXT_PUBLIC_PWA_BACKGROUND_COLOR
 * - NEXT_PUBLIC_PWA_DISPLAY (cast to PWAConfig['display'])
 * - NEXT_PUBLIC_PWA_START_URL
 * - NEXT_PUBLIC_PWA_SCOPE
 * - NEXT_PUBLIC_PWA_DISABLE_DEV ('true' to set `disableInDev` true)
 *
 * @returns The resolved PWAConfig object with defaults applied when variables are unset.
 */
export function getPWAConfig(): PWAConfig {
  return {
    name: process.env.NEXT_PUBLIC_PWA_NAME || 'AI Pista - AI Chat Platform',
    shortName: process.env.NEXT_PUBLIC_PWA_SHORT_NAME || 'AI Pista',
    themeColor: process.env.NEXT_PUBLIC_PWA_THEME_COLOR || '#000000',
    backgroundColor: process.env.NEXT_PUBLIC_PWA_BACKGROUND_COLOR || '#000000',
    display: (process.env.NEXT_PUBLIC_PWA_DISPLAY as PWAConfig['display']) || 'standalone',
    startUrl: process.env.NEXT_PUBLIC_PWA_START_URL || '/',
    scope: process.env.NEXT_PUBLIC_PWA_SCOPE || '/',
    disableInDev: process.env.NEXT_PUBLIC_PWA_DISABLE_DEV === 'true',
  };
}

/**
 * Returns the service worker runtime configuration derived from environment variables.
 *
 * Reads NEXT_PUBLIC_SW_UPDATE_CHECK_INTERVAL and parses it as an integer (milliseconds).
 * If the variable is not set or not a valid integer, a default of 60000 ms is used.
 *
 * @returns The resolved ServiceWorkerConfig with `updateCheckInterval`, and booleans `skipWaiting` and `clientsClaim` (both true).
 */
export function getServiceWorkerConfig(): ServiceWorkerConfig {
  return {
    updateCheckInterval: parseInt(process.env.NEXT_PUBLIC_SW_UPDATE_CHECK_INTERVAL || '60000', 10),
    skipWaiting: true,
    clientsClaim: true,
  };
}

/**
 * Reads VAPID push notification settings from environment variables.
 *
 * Returns a PushNotificationConfig populated from:
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY -> vapidPublicKey
 * - VAPID_PRIVATE_KEY -> vapidPrivateKey
 * - VAPID_SUBJECT -> vapidSubject
 *
 * Any field will be undefined if the corresponding environment variable is not set.
 *
 * @returns The push notification configuration (values may be undefined)
 */
export function getPushNotificationConfig(): PushNotificationConfig {
  return {
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    vapidSubject: process.env.VAPID_SUBJECT,
  };
}

/**
 * Determine whether PWA features should be active for the current runtime.
 *
 * Reads the PWA configuration and returns false when running in Node.js `development`
 * mode and the PWA config has `disableInDev` set to `true`. In all other cases
 * it returns `true`.
 *
 * @returns `true` if PWA features are allowed in the current environment, otherwise `false`
 */
export function isPWAEnabled(): boolean {
  const config = getPWAConfig();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Disable PWA in development if configured to do so
  if (isDevelopment && config.disableInDev) {
    return false;
  }
  
  return true;
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Determines whether the current environment supports web push notifications.
 *
 * Returns true only when running in a browser (not SSR) and the following APIs are available:
 * - Service Workers (`navigator.serviceWorker`)
 * - Push Manager (`window.PushManager`)
 * - Notifications (`window.Notification`)
 *
 * @returns True if push notifications are supported in the current runtime; otherwise false.
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Returns true when the app is running as an installed/standalone PWA.
 *
 * Performs a safe check (returns false during server-side rendering) and
 * detects standalone mode via one of:
 * - the `(display-mode: standalone)` media query,
 * - iOS `navigator.standalone`,
 * - an Android referrer beginning with `android-app://`.
 *
 * @returns True if running as an installed/standalone PWA, otherwise false.
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Returns true if the app is currently installable (a pending `beforeinstallprompt` event was captured).
 *
 * Checks for a `deferredPrompt` property on `window` (set by a `beforeinstallprompt` handler). Returns false during server-side rendering (when `window` is undefined).
 *
 * @returns `true` when a `beforeinstallprompt` event has been captured and installation can be triggered; otherwise `false`.
 */
export function canInstall(): boolean {
  if (typeof window === 'undefined') return false;
  
  // This will be set by the beforeinstallprompt event handler
  return !!(window as any).deferredPrompt;
}

/**
 * Determine how the current page was or can be installed as a PWA.
 *
 * Returns a string describing the installation source/state:
 * - `'unknown'` — executing outside a browser environment (e.g., SSR).
 * - `'installed'` — the app is running in a standalone/installed context.
 * - `'installable'` — the app can be installed (beforeinstallprompt available).
 * - `'browser'` — running in a regular browser tab with no installability.
 *
 * @returns The installation source/state as one of `'unknown' | 'installed' | 'installable' | 'browser'`.
 */
export function getInstallSource(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  if (isStandalone()) {
    return 'installed';
  }
  
  if (canInstall()) {
    return 'installable';
  }
  
  return 'browser';
}

/**
 * PWA feature detection utilities
 */
export const PWAFeatures = {
  serviceWorker: isServiceWorkerSupported,
  pushNotifications: isPushNotificationSupported,
  standalone: isStandalone,
  installable: canInstall,
} as const;

/**
 * Default PWA manifest data
 */
export const DEFAULT_MANIFEST = {
  name: 'AI Pista - AI Chat Platform',
  short_name: 'AI Pista',
  description: 'A powerful AI chat platform supporting multiple models with offline capabilities',
  start_url: '/',
  display: 'standalone' as const,
  background_color: '#000000',
  theme_color: '#000000',
  orientation: 'portrait-primary' as const,
  scope: '/',
  lang: 'en',
  categories: ['productivity', 'utilities', 'education'],
} as const;
