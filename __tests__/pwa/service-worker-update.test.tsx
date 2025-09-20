/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ServiceWorkerUpdate } from '../../components/pwa/ServiceWorkerUpdate';

// Mock the service worker manager
jest.mock('../../lib/service-worker', () => ({
  getServiceWorkerManager: () => ({
    skipWaiting: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('ServiceWorkerUpdate Component', () => {
  let mockOnUpdate: jest.Mock;
  let mockOnDismiss: jest.Mock;

  beforeEach(() => {
    mockOnUpdate = jest.fn();
    mockOnDismiss = jest.fn();

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: {
        reload: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when no update is available', () => {
    render(<ServiceWorkerUpdate onUpdate={mockOnUpdate} onDismiss={mockOnDismiss} />);

    expect(screen.queryByText('App Update Available')).not.toBeInTheDocument();
  });

  it('should render when update is available', async () => {
    render(<ServiceWorkerUpdate onUpdate={mockOnUpdate} onDismiss={mockOnDismiss} />);

    // Simulate service worker update event
    act(() => {
      const updateEvent = new CustomEvent('sw-update', {
        detail: { type: 'available' },
      });
      window.dispatchEvent(updateEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('App Update Available')).toBeInTheDocument();
    });

    expect(screen.getByText(/A new version of the app is ready/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Later' })).toBeInTheDocument();
  });

  it('should handle update button click', async () => {
    render(<ServiceWorkerUpdate onUpdate={mockOnUpdate} onDismiss={mockOnDismiss} />);

    // Trigger update available
    act(() => {
      const updateEvent = new CustomEvent('sw-update', {
        detail: { type: 'available' },
      });
      window.dispatchEvent(updateEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('App Update Available')).toBeInTheDocument();
    });

    const updateButton = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });

    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('should handle dismiss button click', async () => {
    render(<ServiceWorkerUpdate onUpdate={mockOnUpdate} onDismiss={mockOnDismiss} />);

    // Trigger update available
    act(() => {
      const updateEvent = new CustomEvent('sw-update', {
        detail: { type: 'available' },
      });
      window.dispatchEvent(updateEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('App Update Available')).toBeInTheDocument();
    });

    const laterButton = screen.getByRole('button', { name: 'Later' });
    fireEvent.click(laterButton);

    await waitFor(() => {
      expect(screen.queryByText('App Update Available')).not.toBeInTheDocument();
    });

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should handle close button click', async () => {
    render(<ServiceWorkerUpdate onUpdate={mockOnUpdate} onDismiss={mockOnDismiss} />);

    // Trigger update available
    act(() => {
      const updateEvent = new CustomEvent('sw-update', {
        detail: { type: 'available' },
      });
      window.dispatchEvent(updateEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('App Update Available')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('App Update Available')).not.toBeInTheDocument();
    });

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should reload page when update is applied', async () => {
    render(<ServiceWorkerUpdate onUpdate={mockOnUpdate} onDismiss={mockOnDismiss} />);

    // Trigger update available first
    act(() => {
      const updateAvailableEvent = new CustomEvent('sw-update', {
        detail: { type: 'available' },
      });
      window.dispatchEvent(updateAvailableEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('App Update Available')).toBeInTheDocument();
    });

    // Trigger update applied
    act(() => {
      const updateAppliedEvent = new CustomEvent('sw-update', {
        detail: { type: 'applied' },
      });
      window.dispatchEvent(updateAppliedEvent);
    });

    await waitFor(() => {
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it('should handle service worker update error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock the service worker manager to throw an error BEFORE rendering
    const { getServiceWorkerManager } = require('../../lib/service-worker');
    const mockManager = getServiceWorkerManager();
    mockManager.skipWaiting = jest.fn().mockRejectedValue(new Error('Update failed'));

    render(<ServiceWorkerUpdate onUpdate={mockOnUpdate} onDismiss={mockOnDismiss} />);

    // Trigger update available
    act(() => {
      const updateEvent = new CustomEvent('sw-update', {
        detail: { type: 'available' },
      });
      window.dispatchEvent(updateEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('App Update Available')).toBeInTheDocument();
    });

    const updateButton = screen.getByRole('button', { name: 'Update' });
    await act(async () => {
      fireEvent.click(updateButton);
    });

    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update service worker:',
        expect.any(Error),
      );
    });

    // Should reset updating state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<ServiceWorkerUpdate />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('sw-update', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('should handle multiple update events correctly', async () => {
    render(<ServiceWorkerUpdate onUpdate={mockOnUpdate} onDismiss={mockOnDismiss} />);

    // First update available
    act(() => {
      const updateEvent1 = new CustomEvent('sw-update', {
        detail: { type: 'available' },
      });
      window.dispatchEvent(updateEvent1);
    });

    await waitFor(() => {
      expect(screen.getByText('App Update Available')).toBeInTheDocument();
    });

    // Second update available (should not change state)
    act(() => {
      const updateEvent2 = new CustomEvent('sw-update', {
        detail: { type: 'available' },
      });
      window.dispatchEvent(updateEvent2);
    });

    // Should still show the update notification
    expect(screen.getByText('App Update Available')).toBeInTheDocument();
  });

  it('should disable update button while updating', async () => {
    render(<ServiceWorkerUpdate onUpdate={mockOnUpdate} onDismiss={mockOnDismiss} />);

    // Trigger update available
    act(() => {
      const updateEvent = new CustomEvent('sw-update', {
        detail: { type: 'available' },
      });
      window.dispatchEvent(updateEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('App Update Available')).toBeInTheDocument();
    });

    const updateButton = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(updateButton);

    await waitFor(() => {
      const updatingButton = screen.getByRole('button', { name: 'Updating...' });
      expect(updatingButton).toBeDisabled();
    });
  });
});
