/**
 * @jest-environment jsdom
 */

import {
  getPWAConfig,
  getServiceWorkerConfig,
  getPushNotificationConfig,
  isPWAEnabled,
  isServiceWorkerSupported,
  isPushNotificationSupported,
  isStandalone,
  canInstall,
  getInstallSource,
  PWAFeatures,
  DEFAULT_MANIFEST,
} from '../../lib/pwa-config';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_PWA_NAME: 'Test PWA App',
  NEXT_PUBLIC_PWA_SHORT_NAME: 'Test App',
  NEXT_PUBLIC_PWA_THEME_COLOR: '#ff0000',
  NEXT_PUBLIC_PWA_BACKGROUND_COLOR: '#00ff00',
  NEXT_PUBLIC_PWA_DISPLAY: 'fullscreen',
  NEXT_PUBLIC_PWA_START_URL: '/test',
  NEXT_PUBLIC_PWA_SCOPE: '/test',
  NEXT_PUBLIC_PWA_DISABLE_DEV: 'false',
  NEXT_PUBLIC_SW_UPDATE_CHECK_INTERVAL: '30000',
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'test-public-key',
  VAPID_PRIVATE_KEY: 'test-private-key',
  VAPID_SUBJECT: 'mailto:test@example.com',
  NODE_ENV: 'test',
};

describe('PWA Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv, ...mockEnv };
    
    // Reset window properties
    delete (window as any).deferredPrompt;
    delete (window as any).navigator;
    
    // Mock navigator
    Object.defineProperty(window, 'navigator', {
      value: {
        serviceWorker: {},
        standalone: false,
      },
      writable: true,
    });

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getPWAConfig', () => {
    it('should return configuration from environment variables', () => {
      const config = getPWAConfig();
      
      expect(config).toEqual({
        name: 'Test PWA App',
        shortName: 'Test App',
        themeColor: '#ff0000',
        backgroundColor: '#00ff00',
        display: 'fullscreen',
        startUrl: '/test',
        scope: '/test',
        disableInDev: false,
      });
    });

    it('should return default values when environment variables are not set', () => {
      // Clear PWA-specific env vars but keep NODE_ENV
      const cleanEnv = { NODE_ENV: originalEnv.NODE_ENV };
      process.env = cleanEnv;
      
      const config = getPWAConfig();
      
      expect(config).toEqual({
        name: 'AI Pista - AI Chat Platform',
        shortName: 'AI Pista',
        themeColor: '#000000',
        backgroundColor: '#000000',
        display: 'standalone',
        startUrl: '/',
        scope: '/',
        disableInDev: false, // Default when env var is not set
      });
    });
  });

  describe('getServiceWorkerConfig', () => {
    it('should return service worker configuration', () => {
      const config = getServiceWorkerConfig();
      
      expect(config).toEqual({
        updateCheckInterval: 30000,
        skipWaiting: true,
        clientsClaim: true,
      });
    });

    it('should return default update check interval when not set', () => {
      delete process.env.NEXT_PUBLIC_SW_UPDATE_CHECK_INTERVAL;
      
      const config = getServiceWorkerConfig();
      
      expect(config.updateCheckInterval).toBe(60000);
    });
  });

  describe('getPushNotificationConfig', () => {
    it('should return push notification configuration', () => {
      const config = getPushNotificationConfig();
      
      expect(config).toEqual({
        vapidPublicKey: 'test-public-key',
        vapidPrivateKey: 'test-private-key',
        vapidSubject: 'mailto:test@example.com',
      });
    });
  });

  describe('isPWAEnabled', () => {
    it('should return true when PWA is enabled', () => {
      expect(isPWAEnabled()).toBe(true);
    });

    it('should return false when disabled in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_PWA_DISABLE_DEV = 'true';
      
      expect(isPWAEnabled()).toBe(false);
    });

    it('should return true in production even when disable dev is true', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_PWA_DISABLE_DEV = 'true';
      
      expect(isPWAEnabled()).toBe(true);
    });
  });

  describe('isServiceWorkerSupported', () => {
    it('should return true when service worker is supported', () => {
      expect(isServiceWorkerSupported()).toBe(true);
    });

    it('should return false when service worker is not supported', () => {
      delete (window.navigator as any).serviceWorker;
      
      expect(isServiceWorkerSupported()).toBe(false);
    });
  });

  describe('isPushNotificationSupported', () => {
    it('should return true when push notifications are supported', () => {
      (window as any).PushManager = {};
      (window as any).Notification = {};
      
      expect(isPushNotificationSupported()).toBe(true);
    });

    it('should return false when push notifications are not supported', () => {
      delete (window as any).PushManager;
      delete (window as any).Notification;
      
      expect(isPushNotificationSupported()).toBe(false);
    });
  });

  describe('isStandalone', () => {
    it('should return true when app is in standalone mode', () => {
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      
      expect(isStandalone()).toBe(true);
    });

    it('should return true when navigator.standalone is true', () => {
      (window.navigator as any).standalone = true;
      
      expect(isStandalone()).toBe(true);
    });

    it('should return true when referrer includes android-app', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'android-app://com.example.app',
        writable: true,
      });
      
      expect(isStandalone()).toBe(true);
    });

    it('should return false when not in standalone mode', () => {
      // Reset all standalone indicators
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      (window.navigator as any).standalone = false;
      Object.defineProperty(document, 'referrer', {
        value: 'https://example.com',
        writable: true,
      });
      
      expect(isStandalone()).toBe(false);
    });
  });

  describe('canInstall', () => {
    it('should return true when deferredPrompt is available', () => {
      (window as any).deferredPrompt = {};
      
      expect(canInstall()).toBe(true);
    });

    it('should return false when deferredPrompt is not available', () => {
      expect(canInstall()).toBe(false);
    });
  });

  describe('getInstallSource', () => {
    it('should return "installed" when app is standalone', () => {
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      
      expect(getInstallSource()).toBe('installed');
    });

    it('should return "installable" when app can be installed', () => {
      // Reset standalone mode first
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      (window.navigator as any).standalone = false;
      Object.defineProperty(document, 'referrer', {
        value: 'https://example.com',
        writable: true,
      });
      
      // Then set deferredPrompt
      (window as any).deferredPrompt = {};
      
      expect(getInstallSource()).toBe('installable');
    });

    it('should return "browser" when app is in browser mode', () => {
      // Reset all indicators
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      (window.navigator as any).standalone = false;
      Object.defineProperty(document, 'referrer', {
        value: 'https://example.com',
        writable: true,
      });
      delete (window as any).deferredPrompt;
      
      expect(getInstallSource()).toBe('browser');
    });
  });

  describe('PWAFeatures', () => {
    it('should provide feature detection functions', () => {
      expect(typeof PWAFeatures.serviceWorker).toBe('function');
      expect(typeof PWAFeatures.pushNotifications).toBe('function');
      expect(typeof PWAFeatures.standalone).toBe('function');
      expect(typeof PWAFeatures.installable).toBe('function');
    });
  });

  describe('DEFAULT_MANIFEST', () => {
    it('should provide default manifest configuration', () => {
      expect(DEFAULT_MANIFEST).toEqual({
        name: 'AI Pista - AI Chat Platform',
        short_name: 'AI Pista',
        description: 'A powerful AI chat platform supporting multiple models with offline capabilities',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'en',
        categories: ['productivity', 'utilities', 'education'],
      });
    });
  });
});
