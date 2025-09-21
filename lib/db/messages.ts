import type { ChatMessage } from '@/lib/types'

// Mock implementation, as Supabase is removed.
export async function addMessage(params: {
  userId: string
  chatId: string
  message: ChatMessage
}): Promise<void> {
  console.log('addMessage called, but database is removed. Data not saved.', params);
  return Promise.resolve();
}
