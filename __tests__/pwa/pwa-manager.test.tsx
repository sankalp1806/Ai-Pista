import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import PWAManager from '@/components/pwa/PWAManager';

// Mock all PWA components
jest.mock('@/components/pwa/StandaloneDetector', () => ({
  StandaloneProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="standalone-provider">{children}</div>
  ),
}));

jest.mock('@/components/pwa/InstallPrompt', () => {
  return function MockInstallPrompt({ onInstall, onDismiss }: any) {
    return (
      <div data-testid="install-prompt">
        <button onClick={onInstall}>Install</button>
        <button onClick={onDismiss}>Dismiss</button>
      </div>
    );
  };
});

jest.mock('@/components/pwa/InstallBanner', () => {
  return function MockInstallBanner({ onInstall, onDismiss, variant }: any) {
    return (
      <div data-testid="install-banner" data-variant={variant}>
        <button onClick={onInstall}>Install Banner</button>
        <button onClick={onDismiss}>Dismiss Banner</button>
      </div>
    );
  };
});

jest.mock('@/components/pwa/PWALaunchScreen', () => {
  return function MockPWALaunchScreen({ onComplete, duration }: any) {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onComplete?.();
      }, duration || 100);
      return () => clearTimeout(timer);
    }, [onComplete, duration]);
    
    return <div data-testid="pwa-launch-screen">Launch Screen</div>;
  };
});

jest.mock('@/components/pwa/ServiceWorkerUpdate', () => ({
  ServiceWorkerUpdate: () => <div data-testid="service-worker-update">SW Update</div>,
}));

// Mock PWA config
jest.mock('@/lib/pwa-config', () => ({
  isPWAEnabled: jest.fn(() => true),
  isStandalone: jest.fn(() => false),
}));

// Mock PWA styles
jest.mock('@/lib/pwa-styles', () => ({
  injectPWAStyles: jest.fn(),
}));

// Mock gtag
Object.defineProperty(window, 'gtag', {
  value: jest.fn(),
  writable: true,
});

describe('PWAManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render children when PWA is enabled', async () => {
    render(
      <PWAManager>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
    expect(screen.getByTestId('standalone-provider')).toBeInTheDocument();
  });

  it('should not render PWA components when PWA is disabled', async () => {
    const { isPWAEnabled } = await import('@/lib/pwa-config');
    (isPWAEnabled as jest.Mock).mockReturnValue(false);

    render(
      <PWAManager>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
    expect(screen.queryByTestId('standalone-provider')).not.toBeInTheDocument();
  });

  it('should show launch screen in standalone mode', async () => {
    const { isStandalone } = await import('@/lib/pwa-config');
    (isStandalone as jest.Mock).mockReturnValue(true);

    render(
      <PWAManager showLaunchScreen={true}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    expect(screen.getByTestId('pwa-launch-screen')).toBeInTheDocument();
  });

  it('should hide launch screen after duration', async () => {
    const { isStandalone } = await import('@/lib/pwa-config');
    (isStandalone as jest.Mock).mockReturnValue(true);

    render(
      <PWAManager showLaunchScreen={true} launchScreenDuration={1000}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    expect(screen.getByTestId('pwa-launch-screen')).toBeInTheDocument();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('pwa-launch-screen')).not.toBeInTheDocument();
    });
  });

  it('should show install prompt after delay when not standalone', async () => {
    render(
      <PWAManager showInstallPrompt={true} installPromptDelay={2000}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
    });
  });

  it('should show install banner after delay when not standalone', async () => {
    render(
      <PWAManager showInstallBanner={true}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    expect(screen.queryByTestId('install-banner')).not.toBeInTheDocument();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('install-banner')).toBeInTheDocument();
    });
  });

  it('should not show install components in standalone mode', async () => {
    const { isStandalone } = await import('@/lib/pwa-config');
    (isStandalone as jest.Mock).mockReturnValue(true);

    render(
      <PWAManager showInstallPrompt={true} showInstallBanner={true}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
      expect(screen.queryByTestId('install-banner')).not.toBeInTheDocument();
    });
  });

  it('should handle install from prompt', async () => {
    render(
      <PWAManager showInstallPrompt={true} installPromptDelay={100}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    // Fast-forward to show prompt
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
    });

    // Click install
    const installButton = screen.getByText('Install');
    act(() => {
      installButton.click();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
    });

    // Should track installation
    expect(window.gtag).toHaveBeenCalledWith('event', 'pwa_install_success', {
      event_category: 'PWA',
      event_label: 'user_initiated',
    });
  });

  it('should handle install from banner', async () => {
    render(
      <PWAManager showInstallBanner={true}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    // Fast-forward to show banner
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('install-banner')).toBeInTheDocument();
    });

    // Click install
    const installButton = screen.getByText('Install Banner');
    act(() => {
      installButton.click();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('install-banner')).not.toBeInTheDocument();
    });
  });

  it('should handle dismissal of install components', async () => {
    render(
      <PWAManager showInstallPrompt={true} showInstallBanner={true} installPromptDelay={100}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    // Fast-forward to show components
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('install-banner')).toBeInTheDocument();
    });

    // Dismiss prompt
    const dismissPromptButton = screen.getByText('Dismiss');
    act(() => {
      dismissPromptButton.click();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
      expect(screen.queryByTestId('install-banner')).not.toBeInTheDocument();
    });
  });

  it('should render banner with correct variant', async () => {
    render(
      <PWAManager showInstallBanner={true} bannerVariant="bottom">
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    // Fast-forward to show banner
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      const banner = screen.getByTestId('install-banner');
      expect(banner).toHaveAttribute('data-variant', 'bottom');
    });
  });

  it('should inject PWA styles on mount', () => {
    const { injectPWAStyles } = require('@/lib/pwa-styles');
    
    render(
      <PWAManager>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    expect(injectPWAStyles).toHaveBeenCalled();
  });

  it('should always render ServiceWorkerUpdate component', () => {
    render(
      <PWAManager>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    expect(screen.getByTestId('service-worker-update')).toBeInTheDocument();
  });

  it('should disable launch screen when showLaunchScreen is false', () => {
    render(
      <PWAManager showLaunchScreen={false}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    expect(screen.queryByTestId('pwa-launch-screen')).not.toBeInTheDocument();
  });

  it('should disable install prompt when showInstallPrompt is false', async () => {
    render(
      <PWAManager showInstallPrompt={false} installPromptDelay={100}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('install-prompt')).not.toBeInTheDocument();
    });
  });

  it('should disable install banner when showInstallBanner is false', async () => {
    render(
      <PWAManager showInstallBanner={false}>
        <div data-testid="app-content">App Content</div>
      </PWAManager>
    );

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('install-banner')).not.toBeInTheDocument();
    });
  });
});
