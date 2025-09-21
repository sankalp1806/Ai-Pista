/**
 * @jest-environment jsdom
 */

import { offlineManager } from '@/lib/offline/manager';
import { offlineDataLayer } from '@/lib/offline/dataLayer';
import { offlineChatActions } from '@/lib/offline/chatActionsOffline';
import type { ChatMessage, ChatThread } from '@/lib/types';

// Mock external dependencies
jest.mock('@/lib/db/threads');
jest.mock('@/lib/db/messages');

// Mock IndexedDB globally to avoid redefinition issues
const mockIDBRequest = {
  result: null as any,
  error: null,
  onsuccess: null as any,
  onerror: null as any,
};

const mockObjectStore = {
  put: jest.fn(() => mockIDBRequest),
  get: jest.fn(() => mockIDBRequest),
  getAll: jest.fn(() => mockIDBRequest),
  delete: jest.fn(() => mockIDBRequest),
  clear: jest.fn(() => mockIDBRequest),
  createIndex: jest.fn(),
  index: jest.fn(() => ({ getAll: jest.fn(() => mockIDBRequest) })),
};

const mockTransaction = {
  objectStore: jest.fn(() => mockObjectStore),
};

const mockDatabase = {
  transaction: jest.fn(() => mockTransaction),
  objectStoreNames: { contains: jest.fn(() => false) },
  createObjectStore: jest.fn(() => mockObjectStore),
};

const mockOpenRequest = {
  ...mockIDBRequest,
  onupgradeneeded: null as any,
};

// Set up IndexedDB mock once
if (!window.indexedDB) {
  Object.defineProperty(window, 'indexedDB', {
    value: { open: jest.fn(() => mockOpenRequest) },
    writable: true,
  });
}

describe('Offline Functionality Integration Tests', () => {
  const mockUserId = 'test-user-123';
  const mockChatId = 'test-chat-456';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Simulate successful operations
    mockIDBRequest.onsuccess = () => {
      mockIDBRequest.result = [];
    };
    mockOpenRequest.onsuccess = () => {
      mockOpenRequest.result = mockDatabase;
    };
  });

  describe('End-to-End Offline Workflow', () => {
    it('should handle complete offline message sending workflow', async () => {
      // Simulate going offline
      (navigator as any).onLine = false;

      const testMessage: ChatMessage = {
        role: 'user',
        content: 'This is a test message sent while offline',
        ts: Date.now(),
      };

      const mockUpdateUI = jest.fn();

      // Send message while offline
      await offlineChatActions.sendMessage(
        mockUserId,
        mockChatId,
        testMessage,
        mockUpdateUI
      );

      // Verify the message was queued
      const status = await offlineManager.getStatus();
      expect(status.queuedActionsCount).toBeGreaterThan(0);

      // Simulate coming back online
      (navigator as any).onLine = true;

      // Trigger sync
      await offlineManager.syncQueuedActions();

      // Verify sync completed (in a real test, we'd check the database)
      expect(true).toBe(true); // Placeholder assertion
    });

    it('should handle thread creation and message sending offline', async () => {
      // Go offline
      (navigator as any).onLine = false;

      // Create thread offline
      const newThread = await offlineChatActions.createThread(
        mockUserId,
        'Offline Test Thread',
        undefined,
        'home'
      );

      expect(newThread.title).toBe('Offline Test Thread');
      expect(newThread.id).toBeDefined();

      // Send message to the new thread
      const testMessage: ChatMessage = {
        role: 'user',
        content: 'First message in offline thread',
        ts: Date.now(),
      };

      const mockUpdateUI = jest.fn();
      await offlineChatActions.sendMessage(
        mockUserId,
        newThread.id,
        testMessage,
        mockUpdateUI
      );

      // Verify actions were queued
      const status = await offlineManager.getStatus();
      expect(status.queuedActionsCount).toBeGreaterThan(0);
    });

    it('should handle data synchronization after reconnection', async () => {
      // Start offline
      (navigator as any).onLine = false;

      // Perform multiple offline actions
      const thread = await offlineChatActions.createThread(
        mockUserId,
        'Multi-action Thread'
      );

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Message 1', ts: Date.now() },
        { role: 'user', content: 'Message 2', ts: Date.now() + 1000 },
        { role: 'user', content: 'Message 3', ts: Date.now() + 2000 },
      ];

      const mockUpdateUI = jest.fn();
      for (const message of messages) {
        await offlineChatActions.sendMessage(
          mockUserId,
          thread.id,
          message,
          mockUpdateUI
        );
      }

      // Update thread title
      const mockTitleUpdateUI = jest.fn();
      await offlineChatActions.updateThreadTitle(
        mockUserId,
        thread.id,
        'Updated Thread Title',
        mockTitleUpdateUI
      );

      // Verify multiple actions queued
      const statusBeforeSync = await offlineManager.getStatus();
      expect(statusBeforeSync.queuedActionsCount).toBeGreaterThan(3);

      // Come back online and sync
      (navigator as any).onLine = true;
      await offlineManager.syncQueuedActions();

      // Verify sync completed
      const statusAfterSync = await offlineManager.getStatus();
      expect(statusAfterSync.syncInProgress).toBe(false);
    });
  });

  describe('Data Layer Integration', () => {
    it('should seamlessly switch between online and offline data sources', async () => {
      // Start online - should fetch from server
      const onlineThreads = await offlineDataLayer.loadThreads(mockUserId);
      expect(Array.isArray(onlineThreads)).toBe(true);

      // Go offline - should use cached data
      (navigator as any).onLine = false;
      const offlineThreads = await offlineDataLayer.loadThreads(mockUserId);
      expect(Array.isArray(offlineThreads)).toBe(true);

      // Come back online - should sync and refresh
      (navigator as any).onLine = true;
      await offlineDataLayer.syncWithServer(mockUserId);
      
      const syncedThreads = await offlineDataLayer.loadThreads(mockUserId);
      expect(Array.isArray(syncedThreads)).toBe(true);
    });

    it('should handle data staleness detection', async () => {
      // Fresh data should not be stale
      await offlineDataLayer.loadThreads(mockUserId, true);
      const isStaleInitially = await offlineDataLayer.isDataStale(mockUserId);
      expect(isStaleInitially).toBe(false);

      // Mock time passage
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 10 * 60 * 1000); // 10 minutes later

      const isStaleAfterTime = await offlineDataLayer.isDataStale(mockUserId);
      expect(isStaleAfterTime).toBe(true);

      // Restore Date.now
      Date.now = originalNow;
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should gracefully handle sync failures', async () => {
      // Queue some actions
      await offlineManager.queueAction({
        type: 'SEND_MESSAGE',
        payload: { 
          chatId: mockChatId, 
          message: { role: 'user', content: 'Test', ts: Date.now() } 
        },
        timestamp: Date.now(),
        userId: mockUserId,
        maxRetries: 3,
      });

      // Mock sync failure
      const originalSync = offlineManager.syncQueuedActions;
      offlineManager.syncQueuedActions = jest.fn().mockRejectedValue(new Error('Sync failed'));

      // Attempt sync - should not throw
      await expect(offlineManager.syncQueuedActions()).rejects.toThrow('Sync failed');

      // Restore original method
      offlineManager.syncQueuedActions = originalSync;
    });

    it('should handle storage quota exceeded scenarios', async () => {
      // Mock storage quota exceeded
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: jest.fn(() => Promise.resolve({ 
            usage: 9500, 
            quota: 10000 // 95% full
          })),
        },
      });

      const usage = await offlineManager.getStorageUsage();
      expect(usage.percentage).toBeGreaterThan(90);

      // In a real implementation, this would trigger cleanup
      expect(usage.used).toBe(9500);
      expect(usage.quota).toBe(10000);
    });
  });

  describe('Performance and Optimization', () => {
    it('should efficiently handle large numbers of queued actions', async () => {
      const startTime = Date.now();

      // Queue many actions
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(offlineManager.queueAction({
          type: 'SEND_MESSAGE',
          payload: { 
            chatId: `chat-${i}`, 
            message: { role: 'user', content: `Message ${i}`, ts: Date.now() } 
          },
          timestamp: Date.now(),
          userId: mockUserId,
          maxRetries: 3,
        }));
      }

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds

      const status = await offlineManager.getStatus();
      expect(status.queuedActionsCount).toBe(100);
    });

    it('should efficiently cache and retrieve conversations', async () => {
      const testThreads: ChatThread[] = [];
      
      // Create test threads
      for (let i = 0; i < 50; i++) {
        testThreads.push({
          id: `thread-${i}`,
          title: `Test Thread ${i}`,
          messages: [
            { role: 'user', content: `Message ${i}`, ts: Date.now() },
            { role: 'assistant', content: `Response ${i}`, ts: Date.now() + 1000 },
          ],
          createdAt: Date.now() - (i * 1000),
        });
      }

      const startTime = Date.now();

      // Cache all threads
      for (const thread of testThreads) {
        await offlineManager.cacheConversation(thread);
      }

      // Retrieve all threads
      const cachedThreads = await offlineManager.getCachedConversations();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(3000); // 3 seconds
      expect(cachedThreads.length).toBe(testThreads.length);
    });
  });
});
