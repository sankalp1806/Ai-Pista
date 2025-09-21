import type { ChatThread } from '@/lib/types';
import { safeUUID } from '../uuid';

// Mock implementation as Supabase is removed.
export async function fetchThreads(userId: string): Promise<ChatThread[]> {
  console.log('fetchThreads called, but database is removed. Returning empty array.', { userId });
  return Promise.resolve([]);
}

export async function createThread(params: {
  userId: string;
  title?: string;
  projectId?: string | null;
  pageType?: 'home' | 'compare';
  initialMessage?: any | null;
}): Promise<ChatThread> {
    console.log('createThread called, but database is removed. Creating in-memory.', params);
    const newThread: ChatThread = {
        id: safeUUID(),
        title: params.title || 'New Chat',
        messages: params.initialMessage ? [params.initialMessage] : [],
        createdAt: Date.now(),
        projectId: params.projectId || undefined,
        pageType: params.pageType || 'home',
    };
    return Promise.resolve(newThread);
}

export async function deleteThread(userId: string, chatId: string): Promise<void> {
  console.log('deleteThread called, but database is removed.', { userId, chatId });
  return Promise.resolve();
}

export async function updateThreadTitle(userId: string, chatId: string, title: string): Promise<void> {
  console.log('updateThreadTitle called, but database is removed.', { userId, chatId, title });
  return Promise.resolve();
}
