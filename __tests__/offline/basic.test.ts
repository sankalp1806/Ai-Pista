/**
 * @jest-environment jsdom
 */

import { offlineManager } from '@/lib/offline/manager';

describe('Basic Offline Functionality', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('should detect online status', () => {
    expect(offlineManager.isOnline()).toBe(true);
  });

  it('should detect offline status', () => {
    (navigator as any).onLine = false;
    expect(offlineManager.isOnline()).toBe(false);
  });

  it('should return status without throwing', async () => {
    const status = await offlineManager.getStatus();
    
    expect(status).toHaveProperty('isOnline');
    expect(status).toHaveProperty('queuedActionsCount');
    expect(status).toHaveProperty('syncInProgress');
    expect(status).toHaveProperty('hasConflicts');
  });

  it('should handle status listeners', () => {
    const listener = jest.fn();
    const unsubscribe = offlineManager.addStatusListener(listener);
    
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });
});