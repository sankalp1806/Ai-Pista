import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import { setupPWAMocks, createMockBeforeInstallPromptEvent } from './test-utils';

// Mock PWA config
jest.mock('@/lib/pwa-config', () => ({
  isStandalone: jest.fn(() => false),
}));

describe('InstallPrompt', () => {
  let mockBeforeInstallPromptEvent: ReturnType<typeof createMockBeforeInstallPromptEvent>;

  beforeEach(() => {
    // Clear session storage
    sessionStorage.clear();
    
    // Reset mocks
    jest.clearAllMocks();
    
    setupPWAMocks();
    mockBeforeInstallPromptEvent = createMockBeforeInstallPromptEvent();
  });

  it('should render install prompt when installable', () => {
    render(<InstallPrompt />);
    
    // Simulate beforeinstallprompt event
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
    }

    expect(screen.getByText('Install Ai Pista')).toBeInTheDocument();
    expect(screen.getByText('Get the app experience')).toBeInTheDocument();
    expect(screen.getByText('Faster loading')).toBeInTheDocument();
    expect(screen.getByText('Works offline')).toBeInTheDocument();
    expect(screen.getByText('Push notifications')).toBeInTheDocument();
  });

  it('should handle install button click', async () => {
    const onInstall = jest.fn();
    render(<InstallPrompt onInstall={onInstall} />);
    
    // Simulate beforeinstallprompt event
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
    }

    const installButton = screen.getByRole('button', { name: /install/i });
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(mockBeforeInstallPromptEvent.prompt).toHaveBeenCalled();
    });
  });

  it('should handle dismiss button click', () => {
    const onDismiss = jest.fn();
    render(<InstallPrompt onDismiss={onDismiss} />);
    
    // Simulate beforeinstallprompt event
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
    }

    const dismissButton = screen.getByLabelText('Dismiss install prompt');
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalled();
    expect(sessionStorage.getItem('pwa-install-dismissed')).toBe('true');
  });

  it('should not render when already dismissed', () => {
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    
    render(<InstallPrompt />);
    
    expect(screen.queryByText('Install Ai Pista')).not.toBeInTheDocument();
  });

  it('should show loading state during installation', async () => {
    const slowPrompt = {
      ...mockBeforeInstallPromptEvent,
      prompt: jest.fn(() => new Promise(resolve => setTimeout(resolve, 100))),
    };

    render(<InstallPrompt />);
    
    // Simulate beforeinstallprompt event
    const beforeInstallPromptHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'beforeinstallprompt')?.[1];
    
    if (beforeInstallPromptHandler) {
      beforeInstallPromptHandler(slowPrompt);
    }

    const installButton = screen.getByRole('button', { name: /install/i });
    fireEvent.click(installButton);

    expect(screen.getByText('Installing...')).toBeInTheDocument();
    expect(installButton).toBeDisabled();
  });
});

    