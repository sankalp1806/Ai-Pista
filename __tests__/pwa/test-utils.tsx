import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock theme configuration
const mockTheme = {
  mode: 'dark' as const,
  accent: 'crimson' as const,
  font: 'geist' as const,
  background: 'gradient' as const,
  badgePair: 'gold-green' as const,
  chatInputStyle: 'default' as const,
};

// Mock theme context value
const mockThemeContextValue = {
  theme: mockTheme,
  setMode: jest.fn(),
  setAccent: jest.fn(),
  setFont: jest.fn(),
  setBackground: jest.fn(),
  setBadgePair: jest.fn(),
  toggleMode: jest.fn(),
  resetTheme: jest.fn(),
  updateTheme: jest.fn(),
  isLoading: false,
  isInitialized: true,
};

// Mock theme provider for tests
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const mockContext = {
    theme: mockTheme,
    setMode: jest.fn(),
    setAccent: jest.fn(),
    setFont: jest.fn(),
    setBackground: jest.fn(),
    setBadgePair: jest.fn(),
    toggleMode: jest.fn(),
    resetTheme: jest.fn(),
    updateTheme: jest.fn(),
    isLoading: false,
    isInitialized: true,
  };

  // Create a mock context provider
  const React = require('react');
  const ThemeContext = React.createContext(mockContext);
  
  return React.createElement(ThemeContext.Provider, { value: mockContext }, children);
};

// Mock theme context
export const mockThemeContext = {
  useTheme: jest.fn(() => mockThemeContextValue),
  ThemeProvider: MockThemeProvider,
};

// Mock PWA config
export const mockPWAConfig = {
  isStandalone: jest.fn(() => false),
  canInstall: jest.fn(() => false),
  getInstallSource: jest.fn(() => 'browser'),
  isPWAEnabled: jest.fn(() => true),
  isServiceWorkerSupported: jest.fn(() => true),
  isPushNotificationSupported: jest.fn(() => false),
};

// Mock window properties for PWA tests
export const setupPWAMocks = () => {
  // Mock matchMedia
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

  // Mock addEventListener
  Object.defineProperty(window, 'addEventListener', {
    writable: true,
    value: jest.fn(),
  });

  // Mock removeEventListener
  Object.defineProperty(window, 'removeEventListener', {
    writable: true,
    value: jest.fn(),
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });

  // Mock gtag
  Object.defineProperty(window, 'gtag', {
    value: jest.fn(),
    writable: true,
  });
};

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockThemeProvider>
      {children}
    </MockThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Helper to create mock beforeinstallprompt event
export const createMockBeforeInstallPromptEvent = () => ({
  preventDefault: jest.fn(),
  prompt: jest.fn().mockResolvedValue(undefined),
  userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
  platforms: ['web'],
});

// Helper to simulate PWA events
export const simulatePWAEvent = (eventType: string, handler?: Function) => {
  const mockEvent = createMockBeforeInstallPromptEvent();
  
  if (handler) {
    handler(mockEvent);
  }
  
  return mockEvent;
};

export default {
  mockThemeContext,
  mockPWAConfig,
  setupPWAMocks,
  createMockBeforeInstallPromptEvent,
  simulatePWAEvent,
};

