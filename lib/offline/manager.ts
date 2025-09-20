// Offline manager for handling offline functionality and synchronization
import { offlineStorage } from './storage';
import { safeUUID } from '@/lib/uuid';
import type { ChatThread, ChatMessage } from '@/lib/types';
import type { OfflineAction, OfflineQueueItem, CachedConversation, OfflineStatus, SyncResult } from './types';
import { addMessage, createThread, deleteThread, updateThreadTitle, fetchThreads } from '@/lib/db';

class OfflineManager {
  private isOnlineState = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInProgress = false;
  private listeners: Set<(status: OfflineStatus) => void> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await offlineStorage.init();
      
      // Set up online/offline event listeners
      if (typeof window !== 'undefined') {
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
      }
      
      // Start periodic sync when online
      if (this.isOnlineState) {
        this.startPeriodicSync();
      }
      
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize offline manager:', error);
    }
  }

  private handleOnline(): void {
    this.isOnlineState = true;
    this.notifyListeners();
    this.startPeriodicSync();
    // Trigger immediate sync when coming back online
    this.syncQueuedActions();
  }

  private handleOffline(): void {
    this.isOnlineState = false;
    this.notifyListeners();
    this.stopPeriodicSync();
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) return;
    
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnlineState && !this.syncInProgress) {
        this.syncQueuedActions();
      }
    }, 30000);
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  addStatusListener(listener: (status: OfflineStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async notifyListeners(): Promise<void> {
    const status = await this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  async getStatus(): Promise<OfflineStatus> {
    const queuedActions = await offlineStorage.getQueuedActions();
    const pendingActions = queuedActions.filter(action => action.status === 'pending');
    const conversations = await offlineStorage.getAllConversations();
    const hasConflicts = conversations.some(conv => conv.syncStatus === 'conflict');

    return {
      isOnline: this.isOnlineState,
      queuedActionsCount: pendingActions.length,
      syncInProgress: this.syncInProgress,
      hasConflicts
    };
  }

  async queueAction(action: Omit<OfflineAction, 'id'>): Promise<string> {
    const queueItem: OfflineQueueItem = {
      ...action,
      id: safeUUID(),
      status: 'pending',
      retryCount: 0,
      maxRetries: action.maxRetries || 3
    };

    await offlineStorage.addToQueue(queueItem);
    this.notifyListeners();

    // If online, try to sync immediately
    if (this.isOnlineState) {
      setTimeout(() => this.syncQueuedActions(), 100);
    }

    return queueItem.id;
  }

  async cacheConversation(thread: ChatThread): Promise<void> {
    const cachedConversation: CachedConversation = {
      id: thread.id,
      thread,
      lastModified: Date.now(),
      syncStatus: 'synced'
    };

    await offlineStorage.storeConversation(cachedConversation);
  }

  async getCachedConversation(id: string): Promise<ChatThread | null> {
    const cached = await offlineStorage.getConversation(id);
    return cached ? cached.thread : null;
  }

  async getCachedConversations(): Promise<ChatThread[]> {
    const cached = await offlineStorage.getAllConversations();
    return cached.map(c => c.thread).sort((a, b) => b.createdAt - a.createdAt);
  }

  async syncQueuedActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnlineState) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners();

    try {
      const queuedActions = await offlineStorage.getQueuedActions();
      const pendingActions = queuedActions
        .filter(action => action.status === 'pending' || action.status === 'failed')
        .sort((a, b) => a.timestamp - b.timestamp);

      for (const action of pendingActions) {
        try {
          await this.executeAction(action);
          action.status = 'completed';
          await offlineStorage.updateQueueItem(action);
          // Remove completed actions from queue
          await offlineStorage.removeFromQueue(action.id);
        } catch (error) {
          action.retryCount++;
          action.lastAttempt = Date.now();
          action.error = error instanceof Error ? error.message : 'Unknown error';

          if (action.retryCount >= action.maxRetries) {
            action.status = 'failed';
          } else {
            action.status = 'pending';
          }

          await offlineStorage.updateQueueItem(action);
        }
      }
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  private async executeAction(action: OfflineQueueItem): Promise<void> {
    if (!action.userId) {
      throw new Error('User ID required for sync action');
    }

    switch (action.type) {
      case 'SEND_MESSAGE':
        await addMessage({
          userId: action.userId,
          chatId: action.payload.chatId,
          message: action.payload.message
        });
        break;

      case 'CREATE_THREAD':
        await createThread({
          userId: action.userId,
          title: action.payload.title,
          projectId: action.payload.projectId,
          pageType: action.payload.pageType,
          initialMessage: action.payload.initialMessage
        });
        break;

      case 'UPDATE_TITLE':
        await updateThreadTitle(
          action.userId,
          action.payload.chatId,
          action.payload.title
        );
        break;

      case 'DELETE_THREAD':
        await deleteThread(action.userId, action.payload.chatId);
        break;

      case 'UPDATE_THREAD':
        // Handle thread updates - this might involve multiple operations
        if (action.payload.messages) {
          for (const message of action.payload.messages) {
            await addMessage({
              userId: action.userId,
              chatId: action.payload.chatId,
              message
            });
          }
        }
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  async sendMessageOffline(
    userId: string,
    chatId: string,
    message: ChatMessage
  ): Promise<string> {
    // Cache the message locally first
    const cachedConversation = await offlineStorage.getConversation(chatId);
    if (cachedConversation) {
      cachedConversation.thread.messages.push(message);
      cachedConversation.lastModified = Date.now();
      cachedConversation.syncStatus = 'pending';
      await offlineStorage.storeConversation(cachedConversation);
    }

    // Queue the action for sync
    return this.queueAction({
      type: 'SEND_MESSAGE',
      payload: { chatId, message },
      timestamp: Date.now(),
      userId,
      threadId: chatId,
      maxRetries: 3
    });
  }

  async createThreadOffline(
    userId: string,
    title: string,
    projectId?: string,
    pageType?: 'home' | 'compare',
    initialMessage?: ChatMessage
  ): Promise<{ thread: ChatThread; actionId: string }> {
    // Create thread locally
    const thread: ChatThread = {
      id: safeUUID(),
      title,
      messages: initialMessage ? [initialMessage] : [],
      createdAt: Date.now(),
      projectId,
      pageType
    };

    // Cache locally
    await this.cacheConversation(thread);

    // Queue for sync
    const actionId = await this.queueAction({
      type: 'CREATE_THREAD',
      payload: { title, projectId, pageType, initialMessage },
      timestamp: Date.now(),
      userId,
      threadId: thread.id,
      maxRetries: 3
    });

    return { thread, actionId };
  }

  async deleteThreadOffline(userId: string, chatId: string): Promise<string> {
    // Remove from local cache
    await offlineStorage.deleteConversation(chatId);

    // Queue for sync
    return this.queueAction({
      type: 'DELETE_THREAD',
      payload: { chatId },
      timestamp: Date.now(),
      userId,
      threadId: chatId,
      maxRetries: 3
    });
  }

  async updateThreadTitleOffline(
    userId: string,
    chatId: string,
    title: string
  ): Promise<string> {
    // Update local cache
    const cachedConversation = await offlineStorage.getConversation(chatId);
    if (cachedConversation) {
      cachedConversation.thread.title = title;
      cachedConversation.lastModified = Date.now();
      cachedConversation.syncStatus = 'pending';
      await offlineStorage.storeConversation(cachedConversation);
    }

    // Queue for sync
    return this.queueAction({
      type: 'UPDATE_TITLE',
      payload: { chatId, title },
      timestamp: Date.now(),
      userId,
      threadId: chatId,
      maxRetries: 3
    });
  }

  async clearOfflineData(): Promise<void> {
    await offlineStorage.clearQueue();
    const conversations = await offlineStorage.getAllConversations();
    for (const conv of conversations) {
      await offlineStorage.deleteConversation(conv.id);
    }
    this.notifyListeners();
  }

  async getStorageUsage(): Promise<{ used: number; quota: number; percentage: number }> {
    const usage = await offlineStorage.getStorageUsage();
    return {
      ...usage,
      percentage: usage.quota > 0 ? (usage.used / usage.quota) * 100 : 0
    };
  }
}

export const offlineManager = new OfflineManager();