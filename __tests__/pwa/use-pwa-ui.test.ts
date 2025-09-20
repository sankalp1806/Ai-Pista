import { renderHook, act, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import usePWAUI from '@/lib/hooks/usePWAUI';

// Mock PWA config
jest.mock('@/lib/pwa-config', () => ({
  isStandalone: jest.fn(() => false),
  getInstallSource: jest.fn(() => 'browser'),
}));

// Mock window properties
const mockMatchMedia = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 800,
});

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 400,
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: jest.fn(() => ({
    getPropertyValue: jest.fn((prop: string) => {
      if (prop === 'env(safe-area-inset-top)') return '20px';
      if (prop === 'env(safe-area-inset-bottom)') return '10px';
      if (prop === 'env(safe-area-inset-left)') return '0px';
      if (prop === 'env(safe-area-inset-right)') return '0px';
      return '0px';
    }),
  })),
});

describe('usePWAUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default matchMedia mock
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('should return initial PWA UI state', async () => {
    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      expect(result.current.isStandalone).toBe(false);
      expect(result.current.installSource).toBe('browser');
      expect(result.current.displayMode).toBe('browser');
      expect(result.current.orientation).toBe('portrait');
      expect(result.current.isInstallable).toBe(false);
    });
  });

  it('should detect standalone mode', async () => {
    const { isStandalone } = await import('@/lib/pwa-config');
    (isStandalone as jest.Mock).mockReturnValue(true);

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      expect(result.current.isStandalone).toBe(true);
      expect(result.current.displayMode).toBe('standalone');
    });
  });

  it('should detect fullscreen display mode', async () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(display-mode: fullscreen)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      expect(result.current.displayMode).toBe('fullscreen');
    });
  });

  it('should detect minimal-ui display mode', async () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(display-mode: minimal-ui)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      expect(result.current.displayMode).toBe('minimal-ui');
    });
  });

  it('should detect landscape orientation', async () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: 400,
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 800,
    });

    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      expect(result.current.orientation).toBe('landscape');
    });
  });

  it('should detect safe area insets', async () => {
    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      expect(result.current.safeAreaInsets).toEqual({
        top: 20,
        bottom: 10,
        left: 0,
        right: 0,
      });
    });
  });

  it('should detect installable state', async () => {
    // Mock deferredPrompt
    (window as any).deferredPrompt = { prompt: jest.fn() };

    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      expect(result.current.isInstallable).toBe(true);
    });
  });

  it('should provide standalone styles', async () => {
    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      const styles = result.current.getStandaloneStyles();
      expect(styles).toEqual({
        paddingTop: 20,
        paddingBottom: 10,
        paddingLeft: 0,
        paddingRight: 0,
      });
    });
  });

  it('should calculate viewport height for standalone mode', async () => {
    // Set the mock before using the hook
    const { isStandalone } = await import('@/lib/pwa-config');
    (isStandalone as jest.Mock).mockReturnValue(true);

    // Mock getComputedStyle to return safe area insets
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = jest.fn(() => ({
      getPropertyValue: (prop: string) => {
        if (prop === 'env(safe-area-inset-top)') return '20px';
        if (prop === 'env(safe-area-inset-bottom)') return '10px';
        if (prop === 'env(safe-area-inset-left)') return '0px';
        if (prop === 'env(safe-area-inset-right)') return '0px';
        return '0px';
      },
    })) as any;

    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      const viewportHeight = result.current.getViewportHeight();
      expect(viewportHeight).toBe('calc(100vh - 30px)'); // 20 + 10
    });

    // Restore original getComputedStyle
    window.getComputedStyle = originalGetComputedStyle;
  });

  it('should calculate viewport height for browser mode', async () => {
    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      const viewportHeight = result.current.getViewportHeight();
      expect(viewportHeight).toBe('100vh');
    });
  });

  it('should determine when to show install prompt', async () => {
    // Clear any existing deferredPrompt
    (window as any).deferredPrompt = null;

    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      expect(result.current.shouldShowInstallPrompt()).toBe(false);
    });

    // Make it installable by setting deferredPrompt and triggering event
    act(() => {
      (window as any).deferredPrompt = { prompt: jest.fn() };
    });

    // Simulate beforeinstallprompt event
    act(() => {
      const beforeInstallPromptHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'beforeinstallprompt',
      )?.[1];
      if (beforeInstallPromptHandler) {
        beforeInstallPromptHandler({ preventDefault: jest.fn() });
      }
    });

    await waitFor(() => {
      expect(result.current.shouldShowInstallPrompt()).toBe(true);
    });
  });

  it('should generate responsive classes', async () => {
    // Set up portrait orientation
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 400,
    });

    const { isStandalone } = await import('@/lib/pwa-config');
    (isStandalone as jest.Mock).mockReturnValue(true);

    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      const classes = result.current.getResponsiveClasses();
      expect(classes).toContain('pwa-standalone');
      expect(classes).toContain('pwa-display-standalone');
      expect(classes).toContain('pwa-orientation-portrait');
      expect(classes).toContain('pwa-has-notch');
    });
  });

  it('should handle orientation change events', async () => {
    const { result } = renderHook(() => usePWAUI());

    // Verify event listeners are added (with passive option)
    expect(mockAddEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function), {
      passive: true,
    });
    expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function), {
      passive: true,
    });

    // Simulate orientation change
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: 400,
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 800,
    });

    const orientationHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'orientationchange',
    )?.[1];

    if (orientationHandler) {
      act(() => {
        orientationHandler();
      });
    }

    await waitFor(() => {
      expect(result.current.orientation).toBe('landscape');
    });
  });

  it('should handle beforeinstallprompt events', async () => {
    const { result } = renderHook(() => usePWAUI());

    const mockEvent = { preventDefault: jest.fn() };
    const beforeInstallPromptHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'beforeinstallprompt',
    )?.[1];

    if (beforeInstallPromptHandler) {
      act(() => {
        beforeInstallPromptHandler(mockEvent);
      });
    }

    await waitFor(() => {
      expect(result.current.isInstallable).toBe(true);
    });
  });

  it('should handle appinstalled events', async () => {
    // Set up initial installable state
    (window as any).deferredPrompt = { prompt: jest.fn() };

    const { result } = renderHook(() => usePWAUI());

    await waitFor(() => {
      expect(result.current.isInstallable).toBe(true);
    });

    const appInstalledHandler = mockAddEventListener.mock.calls.find(
      (call) => call[0] === 'appinstalled',
    )?.[1];

    if (appInstalledHandler) {
      act(() => {
        (window as any).deferredPrompt = null;
        appInstalledHandler();
      });
    }

    await waitFor(() => {
      expect(result.current.isInstallable).toBe(false);
    });
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => usePWAUI());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function),
    );
    expect(mockRemoveEventListener).toHaveBeenCalledWith('appinstalled', expect.any(Function));
  });
});
