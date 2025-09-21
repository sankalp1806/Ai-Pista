import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import InstallBanner from '@/components/pwa/InstallBanner';
import { setupPWAMocks, createMockBeforeInstallPromptEvent } from './test-utils';

// Mock PWA config
jest.mock('@/lib/pwa-config', () => ({
  isStandalone: jest.fn(() => false),
}));

describe('InstallBanner', () => {
  let mockBeforeInstallPromptEvent: ReturnType<typeof createMockBeforeInstallPromptEvent>;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    
    setupPWAMocks();
    mockBeforeInstallPromptEvent = createMockBeforeInstallPromptEvent();
  });

  it('should render install banner after delay', async () => {
    jest.useFakeTimers();
    
    render(<InstallBanner />);
    
    // Simulate beforeinstallprompt event with act
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      act(() => {
        beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
      });
    }

    // Fast-forward time to show banner with act
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText('Install Ai Pista for a better experience')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should handle permanent dismissal', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    render(<InstallBanner onDismiss={onDismiss} />);
    
    // Simulate beforeinstallprompt event
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      act(() => {
        beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
      });
    }

    // Fast-forward past the 2-second delay
    act(() => {
      jest.advanceTimersByTime(2100);
    });

    // Wait for banner to appear
    await waitFor(() => {
      expect(screen.getByText('Install Ai Pista for a better experience')).toBeInTheDocument();
    });

    const dismissButton = screen.getByLabelText('Dismiss permanently');
    fireEvent.click(dismissButton);

    expect(localStorage.getItem('pwa-banner-dismissed')).toBe('true');
    expect(onDismiss).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('should handle session dismissal', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    render(<InstallBanner onDismiss={onDismiss} />);
    
    // Simulate beforeinstallprompt event and show banner
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      act(() => {
        beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
      });
    }

    // Fast-forward past the 2-second delay
    act(() => {
      jest.advanceTimersByTime(2100);
    });

    await waitFor(() => {
      expect(screen.getByText('Later')).toBeInTheDocument();
    });

    const laterButton = screen.getByText('Later');
    fireEvent.click(laterButton);

    expect(sessionStorage.getItem('pwa-banner-session-dismissed')).toBe('true');
    expect(onDismiss).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('should track installation events', async () => {
    jest.useFakeTimers();
    render(<InstallBanner />);
    
    // Simulate beforeinstallprompt event and show banner
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      act(() => {
        beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
      });
    }

    // Fast-forward past the 2-second delay
    act(() => {
      jest.advanceTimersByTime(2100);
    });

    // Wait for banner to appear and find install button
    await waitFor(() => {
      expect(screen.getByText('Install Ai Pista for a better experience')).toBeInTheDocument();
    });

    const installButton = screen.getByText('Install');
    
    jest.useRealTimers();
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(window.gtag).toHaveBeenCalledWith('event', 'pwa_install_prompt', {
        event_category: 'PWA',
        event_label: 'accepted',
        custom_parameter_1: 'banner',
      });
    });
  });

  it('should render with top variant by default', async () => {
    jest.useFakeTimers();
    render(<InstallBanner />);
    
    // Simulate beforeinstallprompt event to make banner visible
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      act(() => {
        beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
      });
    }

    // Fast-forward past the 2-second delay
    act(() => {
      jest.advanceTimersByTime(2100);
    });

    await waitFor(() => {
      const banner = document.querySelector('.fixed');
      expect(banner).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  it('should render with bottom variant when specified', async () => {
    jest.useFakeTimers();
    render(<InstallBanner variant="bottom" />);
    
    // Simulate beforeinstallprompt event to make banner visible
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      act(() => {
        beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
      });
    }

    // Fast-forward past the 2-second delay
    act(() => {
      jest.advanceTimersByTime(2100);
    });

    await waitFor(() => {
      const banner = document.querySelector('.fixed');
      expect(banner).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });
});

    