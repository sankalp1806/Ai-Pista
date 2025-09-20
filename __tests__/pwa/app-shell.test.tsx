import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import AppShell from '@/components/pwa/AppShell';
import { setupPWAMocks } from './test-utils';

// Mock PWA config
jest.mock('@/lib/pwa-config', () => ({
  isStandalone: jest.fn(() => false),
}));

// Mock LaunchScreen component
jest.mock('@/components/ui/LaunchScreen', () => {
  return function MockLaunchScreen() {
    return <div data-testid="launch-screen">Launch Screen</div>;
  };
});

// Mock Loading component
jest.mock('@/components/ui/Loading', () => {
  return function MockLoading() {
    return <div data-testid="loading">Loading...</div>;
  };
});

describe('AppShell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupPWAMocks();
  });

  it('should render children after hydration', async () => {
    render(
      <AppShell>
        <div data-testid="app-content">App Content</div>
      </AppShell>
    );

    await waitFor(() => {
      expect(screen.getByTestId('app-content')).toBeInTheDocument();
    });
  });

  it('should show loading state during hydration', () => {
    // Mock useState to simulate loading state
    const mockUseState = jest.spyOn(React, 'useState');
    mockUseState
      .mockReturnValueOnce([true, jest.fn()]) // isLoading
      .mockReturnValueOnce([false, jest.fn()]) // isStandaloneMode
      .mockReturnValueOnce([false, jest.fn()]); // isHydrated

    render(
      <AppShell>
        <div>App Content</div>
      </AppShell>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Restore useState
    mockUseState.mockRestore();
  });

  it('should show launch screen in standalone mode', async () => {
    // Mock isStandalone to return true
    const { isStandalone } = await import('@/lib/pwa-config');
    (isStandalone as jest.Mock).mockReturnValue(true);

    const mockUseState = jest.spyOn(React, 'useState');
    mockUseState
      .mockReturnValueOnce([true, jest.fn()]) // isLoading
      .mockReturnValueOnce([true, jest.fn()]) // isStandaloneMode
      .mockReturnValueOnce([true, jest.fn()]); // isHydrated

    render(
      <AppShell showLaunchScreen={true}>
        <div>App Content</div>
      </AppShell>
    );

    expect(screen.getByTestId('launch-screen')).toBeInTheDocument();
    
    // Restore useState
    mockUseState.mockRestore();
  });

  it('should apply standalone mode classes', async () => {
    const { isStandalone } = await import('@/lib/pwa-config');
    (isStandalone as jest.Mock).mockReturnValue(true);

    render(
      <AppShell>
        <div data-testid="app-content">App Content</div>
      </AppShell>
    );

    await waitFor(() => {
      const appShell = screen.getByTestId('app-content').closest('.app-shell');
      expect(appShell).toHaveClass('standalone-mode');
    });
  });

  it('should apply browser mode classes when not standalone', async () => {
    const { isStandalone } = await import('@/lib/pwa-config');
    (isStandalone as jest.Mock).mockReturnValue(false);

    render(
      <AppShell>
        <div data-testid="app-content">App Content</div>
      </AppShell>
    );

    await waitFor(() => {
      const appShell = screen.getByTestId('app-content').closest('.app-shell');
      expect(appShell).toHaveClass('browser-mode');
    });
  });

  it('should handle custom launch screen duration', async () => {
    jest.useFakeTimers();
    
    const mockSetIsLoading = jest.fn();
    const mockUseState = jest.spyOn(React, 'useState');
    mockUseState
      .mockReturnValueOnce([true, mockSetIsLoading]) // isLoading
      .mockReturnValueOnce([false, jest.fn()]) // isStandaloneMode
      .mockReturnValueOnce([true, jest.fn()]); // isHydrated

    render(
      <AppShell showLaunchScreen={true} launchScreenDuration={3000}>
        <div>App Content</div>
      </AppShell>
    );

    // Fast-forward time
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });

    jest.useRealTimers();
  });

  it('should disable launch screen when showLaunchScreen is false', () => {
    const mockSetIsLoading = jest.fn();
    const mockUseState = jest.spyOn(React, 'useState');
    mockUseState
      .mockReturnValueOnce([true, mockSetIsLoading]) // isLoading
      .mockReturnValueOnce([false, jest.fn()]) // isStandaloneMode
      .mockReturnValueOnce([true, jest.fn()]); // isHydrated

    render(
      <AppShell showLaunchScreen={false}>
        <div>App Content</div>
      </AppShell>
    );

    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('should apply custom className', async () => {
    render(
      <AppShell className="custom-class">
        <div data-testid="app-content">App Content</div>
      </AppShell>
    );

    await waitFor(() => {
      const appShell = screen.getByTestId('app-content').closest('.app-shell');
      expect(appShell).toHaveClass('custom-class');
    });
  });
});