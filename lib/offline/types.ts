// Offline functionality types and interfaces

export interface OfflineAction {
  id: string;
  type: 'SEND_MESSAGE' | 'UPDATE_THREAD' | 'DELETE_THREAD' | 'CREATE_THREAD' | 'UPDATE_TITLE';
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  threadId?: string;
  userId?: string;
}

export interface OfflineQueueItem extends OfflineAction {
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error?: string;
  lastAttempt?: number;
}

export interface CachedConversation {
  id: string;
  thread: ChatThread;
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface OfflineStorage {
  conversations: Map<string, CachedConversation>;
  queuedActions: OfflineQueueItem[];
  lastSyncTimestamp: number;
}

export interface SyncResult {
  success: boolean;
  error?: string;
  retryAfter?: number;
  conflictResolution?: 'local' | 'remote' | 'merge';
}

export interface OfflineStatus {
  isOnline: boolean;
  queuedActionsCount: number;
  lastSyncTime?: Date;
  syncInProgress: boolean;
  hasConflicts: boolean;
}

import type { ChatThread } from '@/lib/types';