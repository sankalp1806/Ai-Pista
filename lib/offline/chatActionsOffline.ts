// Enhanced chat actions with offline support
import { offlineManager } from './manager';
import { addMessage as addMessageDb, updateThreadTitle as updateTitleDb } from '@/lib/db';
import type { ChatMessage, ChatThread } from '@/lib/types';
import { safeUUID } from '@/lib/uuid';

export interface OfflineChatActions {
  sendMessage: (
    userId: string,
    chatId: string,
    message: ChatMessage,
    updateUI: (thread: ChatThread) => void
  ) => Promise<void>;
  
  createThread: (
    userId: string,
    title: string,
    projectId?: string,
    pageType?: 'home' | 'compare',
    initialMessage?: ChatMessage
  ) => Promise<ChatThread>;
  
  updateThreadTitle: (
    userId: string,
    chatId: string,
    title: string,
    updateUI: (chatId: string, title: string) => void
  ) => Promise<void>;
  
  deleteThread: (
    userId: string,
    chatId: string,
    updateUI: (chatId: string) => void
  ) => Promise<void>;
}

class OfflineChatActionsImpl implements OfflineChatActions {
  async sendMessage(
    userId: string,
    chatId: string,
    message: ChatMessage,
    updateUI: (thread: ChatThread) => void
  ): Promise<void> {
    try {
      if (offlineManager.isOnline()) {
        // Online: send directly to database
        await addMessageDb({ userId, chatId, message });
        
        // Also cache locally for offline access
        const cachedThread = await offlineManager.getCachedConversation(chatId);
        if (cachedThread) {
          cachedThread.messages.push(message);
          await offlineManager.cacheConversation(cachedThread);
          updateUI(cachedThread);
        }
      } else {
        // Offline: queue action and update local cache
        await offlineManager.sendMessageOffline(userId, chatId, message);
        
        // Update UI with cached data
        const cachedThread = await offlineManager.getCachedConversation(chatId);
        if (cachedThread) {
          updateUI(cachedThread);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to offline mode if online operation fails
      if (offlineManager.isOnline()) {
        await offlineManager.sendMessageOffline(userId, chatId, message);
        
        const cachedThread = await offlineManager.getCachedConversation(chatId);
        if (cachedThread) {
          updateUI(cachedThread);
        }
      }
      
      throw error;
    }
  }

  async createThread(
    userId: string,
    title: string,
    projectId?: string,
    pageType?: 'home' | 'compare',
    initialMessage?: ChatMessage
  ): Promise<ChatThread> {
    try {
      if (offlineManager.isOnline()) {
        // Online: create in database
        const { createThread } = await import('@/lib/db/threads');
        const thread = await createThread({
          userId,
          title,
          projectId,
          pageType,
          initialMessage
        });
        
        // Cache locally
        await offlineManager.cacheConversation(thread);
        return thread;
      } else {
        // Offline: create locally and queue for sync
        const { thread } = await offlineManager.createThreadOffline(
          userId,
          title,
          projectId,
          pageType,
          initialMessage
        );
        return thread;
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      
      // Fallback to offline mode
      const { thread } = await offlineManager.createThreadOffline(
        userId,
        title,
        projectId,
        pageType,
        initialMessage
      );
      return thread;
    }
  }

  async updateThreadTitle(
    userId: string,
    chatId: string,
    title: string,
    updateUI: (chatId: string, title: string) => void
  ): Promise<void> {
    try {
      if (offlineManager.isOnline()) {
        // Online: update database
        await updateTitleDb(userId, chatId, title);
        
        // Update local cache
        const cachedThread = await offlineManager.getCachedConversation(chatId);
        if (cachedThread) {
          cachedThread.title = title;
          await offlineManager.cacheConversation(cachedThread);
        }
        
        updateUI(chatId, title);
      } else {
        // Offline: queue action and update local cache
        await offlineManager.updateThreadTitleOffline(userId, chatId, title);
        updateUI(chatId, title);
      }
    } catch (error) {
      console.error('Error updating thread title:', error);
      
      // Fallback to offline mode
      if (offlineManager.isOnline()) {
        await offlineManager.updateThreadTitleOffline(userId, chatId, title);
        updateUI(chatId, title);
      }
      
      throw error;
    }
  }

  async deleteThread(
    userId: string,
    chatId: string,
    updateUI: (chatId: string) => void
  ): Promise<void> {
    try {
      if (offlineManager.isOnline()) {
        // Online: delete from database
        const { deleteThread } = await import('@/lib/db/threads');
        await deleteThread(userId, chatId);
        
        // Remove from local cache
        const cachedThread = await offlineManager.getCachedConversation(chatId);
        if (cachedThread) {
          await offlineManager.deleteThreadOffline(userId, chatId);
        }
        
        updateUI(chatId);
      } else {
        // Offline: queue action and remove from local cache
        await offlineManager.deleteThreadOffline(userId, chatId);
        updateUI(chatId);
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      
      // Fallback to offline mode
      if (offlineManager.isOnline()) {
        await offlineManager.deleteThreadOffline(userId, chatId);
        updateUI(chatId);
      }
      
      throw error;
    }
  }
}

export const offlineChatActions = new OfflineChatActionsImpl();