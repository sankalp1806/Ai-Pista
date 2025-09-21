/**
 * @jest-environment jsdom
 */

import { offlineDataLayer } from '@/lib/offline/dataLayer';
import { offlineManager } from '@/lib/offline/manager';
import { fetchThreads } from '@/lib/db/threads';
import type { ChatThread } from '@/lib/types';

// Mock dependencies
jest.mock('@/lib/offline/manager');
jest.mock('@/lib/db/threads');

const mockOfflineManager = offlineManager as jest.Mocked<typeof offlineManager>;
const mockFetchThreads = fetchThreads as jest.MockedFunction<typeof fetchThreads>;

describe('OfflineDataLayer', () => {
  const mockUserId = 'test-user-123';
  const mockThreads: ChatThread[] = [
    {
      id: 'thread-1',
      title: 'Test Thread 1',
      messages: [
        { role: 'user', content: 'Hello', ts: Date.now() },
        { role: 'assistant', content: 'Hi there!', ts: Date.now() + 1000 },
      ],
      createdAt: Date.now() - 86400000, // 1 day ago
    },
    {
      id: 'thread-2',
      title: 'Test Thread 2',
      messages: [
        { role: 'user', content: 'How are you?', ts: Date.now() },
      ],
      createdAt: Date.now() - 3600000, // 1 hour ago
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockOfflineManager.isOnline.mockReturnValue(true);
    mockOfflineManager.getCachedConversations.mockResolvedValue(mockThreads);
    mockOfflineManager.getCachedConversation.mockImplementation(async (id) => 
      mockThreads.find(t => t.id === id) || null
    );
    mockOfflineManager.cacheConversation.mockResolvedValue();
    mockOfflineManager.syncQueuedActions.mockResolvedValue();
    
    mockFetchThreads.mockResolvedValue(mockThreads);
  });

  describe('loadThreads', () => {
    it('should load threads from server when online and data is stale', async () => {
      const threads = await offlineDataLayer.loadThreads(mockUserId, true);
      
      expect(mockFetchThreads).toHaveBeenCalledWith(mockUserId);
      expect(mockOfflineManager.cacheConversation).toHaveBeenCalledTimes(mockThreads.length);
      expect(threads).toEqual(mockThreads);
    });

    it('should load threads from cache when offline', async () => {
      mockOfflineManager.isOnline.mockReturnValue(false);
      
      const threads = await offlineDataLayer.loadThreads(mockUserId);
      
      expect(mockFetchThreads).not.toHaveBeenCalled();
      expect(mockOfflineManager.getCachedConversations).toHaveBeenCalled();
      expect(threads).toEqual(mockThreads);
    });

    it('should fallback to cache when server request fails', async () => {
      mockFetchThreads.mockRejectedValue(new Error('Network error'));
      
      const threads = await offlineDataLayer.loadThreads(mockUserId, true);
      
      expect(mockOfflineManager.getCachedConversations).toHaveBeenCalled();
      expect(threads).toEqual(mockThreads);
    });

    it('should fetch from server if no cached data exists', async () => {
      mockOfflineManager.getCachedConversations.mockResolvedValue([]);
      
      const threads = await offlineDataLayer.loadThreads(mockUserId);
      
      expect(mockFetchThreads).toHaveBeenCalledWith(mockUserId);
      expect(threads).toEqual(mockThreads);
    });
  });

  describe('getThread', () => {
    it('should return cached thread if available', async () => {
      const thread = await offlineDataLayer.getThread('thread-1');
      
      expect(mockOfflineManager.getCachedConversation).toHaveBeenCalledWith('thread-1');
      expect(thread).toEqual(mockThreads[0]);
    });

    it('should fetch from server if not in cache and online', async () => {
      mockOfflineManager.getCachedConversation.mockResolvedValue(null);
      
      const thread = await offlineDataLayer.getThread('thread-1', mockUserId);
      
      expect(mockFetchThreads).toHaveBeenCalledWith(mockUserId);
      expect(thread).toEqual(mockThreads[0]);
    });

    it('should return null if thread not found and offline', async () => {
      mockOfflineManager.getCachedConversation.mockResolvedValue(null);
      mockOfflineManager.isOnline.mockReturnValue(false);
      
      const thread = await offlineDataLayer.getThread('non-existent');
      
      expect(thread).toBeNull();
    });
  });

  describe('syncWithServer', () => {
    it('should sync queued actions and refresh data', async () => {
      await offlineDataLayer.syncWithServer(mockUserId);
      
      expect(mockOfflineManager.syncQueuedActions).toHaveBeenCalled();
      expect(mockFetchThreads).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw error when offline', async () => {
      mockOfflineManager.isOnline.mockReturnValue(false);
      
      await expect(offlineDataLayer.syncWithServer(mockUserId)).rejects.toThrow('Cannot sync while offline');
    });

    it('should handle sync errors', async () => {
      mockOfflineManager.syncQueuedActions.mockRejectedValue(new Error('Sync failed'));
      
      await expect(offlineDataLayer.syncWithServer(mockUserId)).rejects.toThrow('Sync failed');
    });
  });

  describe('isDataStale', () => {
    it('should return true for stale data', async () => {
      // Mock online status and successful fetch
      mockOfflineManager.isOnline.mockReturnValue(true);
      mockFetchThreads.mockResolvedValue([mockThread]);
      
      // First load to set sync time
      await offlineDataLayer.loadThreads(mockUserId, true);
      
      // Mock time passage (more than 5 minutes)
      const originalNow = Date.now;
      const futureTime = Date.now() + 6 * 60 * 1000;
      Date.now = jest.fn(() => futureTime);
      
      const isStale = await offlineDataLayer.isDataStale(mockUserId);
      
      expect(isStale).toBe(true);
      
      // Restore Date.now
      Date.now = originalNow;
    });

    it('should return false for fresh data', async () => {
      // First load to set sync time
      await offlineDataLayer.loadThreads(mockUserId, true);
      
      const isStale = await offlineDataLayer.isDataStale(mockUserId);
      
      expect(isStale).toBe(false);
    });

    it('should return true when no sync time recorded', async () => {
      const isStale = await offlineDataLayer.isDataStale('new-user');
      
      expect(isStale).toBe(true);
    });
  });

  describe('getLastSyncTime', () => {
    it('should return null when no syncs recorded', async () => {
      // Clear any existing sync times first
      await offlineDataLayer.clearCache();
      
      const lastSync = await offlineDataLayer.getLastSyncTime();
      
      expect(lastSync).toBeNull();
    });

    it('should return most recent sync time', async () => {
      const beforeSync = new Date();
      
      // Perform sync
      await offlineDataLayer.loadThreads(mockUserId, true);
      
      const lastSync = await offlineDataLayer.getLastSyncTime();
      
      expect(lastSync).toBeInstanceOf(Date);
      expect(lastSync!.getTime()).toBeGreaterThanOrEqual(beforeSync.getTime());
    });
  });

  describe('preloadForOffline', () => {
    it('should preload data when online', async () => {
      await offlineDataLayer.preloadForOffline(mockUserId);
      
      expect(mockFetchThreads).toHaveBeenCalledWith(mockUserId);
      expect(mockOfflineManager.cacheConversation).toHaveBeenCalledTimes(mockThreads.length);
    });

    it('should not preload when offline', async () => {
      mockOfflineManager.isOnline.mockReturnValue(false);
      
      await offlineDataLayer.preloadForOffline(mockUserId);
      
      expect(mockFetchThreads).not.toHaveBeenCalled();
    });

    it('should handle preload errors gracefully', async () => {
      mockFetchThreads.mockRejectedValue(new Error('Preload failed'));
      
      // Should not throw
      await expect(offlineDataLayer.preloadForOffline(mockUserId)).resolves.toBeUndefined();
    });
  });

  describe('resolveConflicts', () => {
    it('should resolve conflicts by refreshing from server', async () => {
      await offlineDataLayer.resolveConflicts(mockUserId);
      
      expect(mockFetchThreads).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle conflict resolution errors', async () => {
      mockOfflineManager.isOnline.mockReturnValue(false);
      
      // Should not throw even when offline
      await expect(offlineDataLayer.resolveConflicts(mockUserId)).resolves.toBeUndefined();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      // First load some data
      await offlineDataLayer.loadThreads(mockUserId, true);
      
      await offlineDataLayer.clearCache();
      
      expect(mockOfflineManager.clearOfflineData).toHaveBeenCalled();
      
      // Verify sync times are cleared
      const lastSync = await offlineDataLayer.getLastSyncTime();
      expect(lastSync).toBeNull();
    });
  });
});
