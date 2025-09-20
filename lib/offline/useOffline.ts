'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineManager } from './manager';
import type { OfflineStatus } from './types';
import type { ChatThread, ChatMessage } from '@/lib/types';

export interface UseOfflineReturn {
  status: OfflineStatus;
  isOnline: boolean;
  sendMessage: (userId: string, chatId: string, message: ChatMessage) => Promise<string>;
  createThread: (
    userId: string,
    title: string,
    projectId?: string,
    pageType?: 'home' | 'compare',
    initialMessage?: ChatMessage
  ) => Promise<{ thread: ChatThread; actionId: string }>;
  deleteThread: (userId: string, chatId: string) => Promise<string>;
  updateThreadTitle: (userId: string, chatId: string, title: string) => Promise<string>;
  getCachedConversations: () => Promise<ChatThread[]>;
  getCachedConversation: (id: string) => Promise<ChatThread | null>;
  syncNow: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  getStorageUsage: () => Promise<{ used: number; quota: number; percentage: number }>;
}

/**
 * React hook that exposes offline chat capabilities backed by the shared offlineManager.
 *
 * Returns the current offline `status` (keeps it updated by subscribing to the manager) and a set
 * of actions that delegate to `offlineManager` for sending messages, creating/updating/deleting
 * threads, reading cached conversations, forcing a sync, clearing offline data, and checking
 * storage usage.
 *
 * The returned `isOnline` mirrors `status.isOnline`. `syncNow()` will only trigger a sync when
 * the client is online and a sync is not already in progress. All action methods return the
 * promises produced by `offlineManager` (no additional error handling is applied here).
 */
export function useOffline(): UseOfflineReturn {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    queuedActionsCount: 0,
    syncInProgress: false,
    hasConflicts: false
  });

  useEffect(() => {
    const updateStatus = async () => {
      const currentStatus = await offlineManager.getStatus();
      setStatus(currentStatus);
    };

    updateStatus();
    const unsubscribe = offlineManager.addStatusListener(setStatus);

    return unsubscribe;
  }, []);

  const sendMessage = useCallback(async (
    userId: string,
    chatId: string,
    message: ChatMessage
  ): Promise<string> => {
    return offlineManager.sendMessageOffline(userId, chatId, message);
  }, []);

  const createThread = useCallback(async (
    userId: string,
    title: string,
    projectId?: string,
    pageType?: 'home' | 'compare',
    initialMessage?: ChatMessage
  ): Promise<{ thread: ChatThread; actionId: string }> => {
    return offlineManager.createThreadOffline(userId, title, projectId, pageType, initialMessage);
  }, []);

  const deleteThread = useCallback(async (
    userId: string,
    chatId: string
  ): Promise<string> => {
    return offlineManager.deleteThreadOffline(userId, chatId);
  }, []);

  const updateThreadTitle = useCallback(async (
    userId: string,
    chatId: string,
    title: string
  ): Promise<string> => {
    return offlineManager.updateThreadTitleOffline(userId, chatId, title);
  }, []);

  const getCachedConversations = useCallback(async (): Promise<ChatThread[]> => {
    return offlineManager.getCachedConversations();
  }, []);

  const getCachedConversation = useCallback(async (id: string): Promise<ChatThread | null> => {
    return offlineManager.getCachedConversation(id);
  }, []);

  const syncNow = useCallback(async (): Promise<void> => {
    if (status.isOnline && !status.syncInProgress) {
      await offlineManager.syncQueuedActions();
    }
  }, [status.isOnline, status.syncInProgress]);

  const clearOfflineData = useCallback(async (): Promise<void> => {
    await offlineManager.clearOfflineData();
  }, []);

  const getStorageUsage = useCallback(async () => {
    return offlineManager.getStorageUsage();
  }, []);

  return {
    status,
    isOnline: status.isOnline,
    sendMessage,
    createThread,
    deleteThread,
    updateThreadTitle,
    getCachedConversations,
    getCachedConversation,
    syncNow,
    clearOfflineData,
    getStorageUsage
  };
}