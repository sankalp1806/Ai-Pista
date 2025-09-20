// Offline-first data layer with automatic synchronization
import { offlineManager } from './manager';
import { fetchThreads } from '@/lib/db/threads';
import type { ChatThread } from '@/lib/types';

export interface OfflineDataLayer {
  loadThreads: (userId: string, forceRefresh?: boolean) => Promise<ChatThread[]>;
  getThread: (threadId: string, userId?: string) => Promise<ChatThread | null>;
  syncWithServer: (userId: string) => Promise<void>;
  isDataStale: (userId: string) => Promise<boolean>;
  getLastSyncTime: () => Promise<Date | null>;
}

class OfflineDataLayerImpl implements OfflineDataLayer {
  private lastSyncTimes = new Map<string, Date>();
  private readonly STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  async loadThreads(userId: string, forceRefresh = false): Promise<ChatThread[]> {
    try {
      if (offlineManager.isOnline() && (forceRefresh || await this.isDataStale(userId))) {
        // Online and data is stale: fetch from server and cache
        const serverThreads = await fetchThreads(userId);
        
        // Cache all threads locally
        for (const thread of serverThreads) {
          await offlineManager.cacheConversation(thread);
        }
        
        this.lastSyncTimes.set(userId, new Date());
        return serverThreads;
      } else {
        // Offline or data is fresh: use cached data
        const cachedThreads = await offlineManager.getCachedConversations();
        
        // If no cached data and we're online, fetch from server
        if (cachedThreads.length === 0 && offlineManager.isOnline()) {
          return this.loadThreads(userId, true);
        }
        
        return cachedThreads;
      }
    } catch (error) {
      console.error('Error loading threads:', error);
      
      // Fallback to cached data
      const cachedThreads = await offlineManager.getCachedConversations();
      return cachedThreads;
    }
  }

  async getThread(threadId: string, userId?: string): Promise<ChatThread | null> {
    try {
      // First try to get from cache
      const cachedThread = await offlineManager.getCachedConversation(threadId);
      
      if (cachedThread) {
        return cachedThread;
      }
      
      // If not in cache and we're online, try to fetch all threads
      if (offlineManager.isOnline() && userId) {
        const threads = await this.loadThreads(userId, true);
        return threads.find(t => t.id === threadId) || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting thread:', error);
      return null;
    }
  }

  async syncWithServer(userId: string): Promise<void> {
    if (!offlineManager.isOnline()) {
      throw new Error('Cannot sync while offline');
    }

    try {
      // Sync queued actions first
      await offlineManager.syncQueuedActions();
      
      // Then refresh data from server
      await this.loadThreads(userId, true);
      
      this.lastSyncTimes.set(userId, new Date());
    } catch (error) {
      console.error('Error syncing with server:', error);
      throw error;
    }
  }

  async isDataStale(userId: string): Promise<boolean> {
    const lastSync = this.lastSyncTimes.get(userId);
    if (!lastSync) {
      return true; // No sync time recorded, consider stale
    }
    
    const now = new Date();
    const timeSinceSync = now.getTime() - lastSync.getTime();
    return timeSinceSync > this.STALE_THRESHOLD;
  }

  async getLastSyncTime(): Promise<Date | null> {
    // Return the most recent sync time across all users
    const syncTimes = Array.from(this.lastSyncTimes.values());
    if (syncTimes.length === 0) {
      return null;
    }
    
    return new Date(Math.max(...syncTimes.map(d => d.getTime())));
  }

  // Method to preload data for offline use
  async preloadForOffline(userId: string): Promise<void> {
    if (!offlineManager.isOnline()) {
      return;
    }

    try {
      // Load all threads and cache them
      await this.loadThreads(userId, true);
      
      console.log('Data preloaded for offline use');
    } catch (error) {
      console.error('Error preloading data for offline:', error);
    }
  }

  // Method to handle conflict resolution
  async resolveConflicts(userId: string): Promise<void> {
    // This would implement conflict resolution logic
    // For now, we'll use a simple "server wins" strategy
    try {
      if (offlineManager.isOnline()) {
        await this.loadThreads(userId, true);
      }
    } catch (error) {
      console.error('Error resolving conflicts:', error);
    }
  }

  // Method to clear all cached data
  async clearCache(): Promise<void> {
    await offlineManager.clearOfflineData();
    this.lastSyncTimes.clear();
  }
}

export const offlineDataLayer = new OfflineDataLayerImpl();