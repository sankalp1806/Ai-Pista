import type { ChatMessage, ChatThread } from '@/lib/types';
import type { SharedChatData } from './types';

/**
 * Sanitizes a chat message for sharing by removing sensitive information
 */
export function sanitizeMessage(message: ChatMessage): ChatMessage {
  const maxContentLength = 2000; // Limit individual message content to 2000 chars
  let content = message.content;
  
  // Truncate very long messages
  if (content.length > maxContentLength) {
    content = content.substring(0, maxContentLength) + '... [truncated]';
  }
  
  return {
    role: message.role,
    content,
    modelId: message.modelId,
    ts: message.ts,
    // Exclude sensitive fields: code, provider, usedKeyType
  };
}

/**
 * Sanitizes an array of messages for sharing
 */
export function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map(sanitizeMessage);
}

/**
 * Sanitizes a chat thread for sharing, removing all sensitive information
 */
export function sanitizeThreadForSharing(
  thread: ChatThread,
  projectName?: string
): Omit<SharedChatData, 'messages' | 'truncated' | 'originalMessageCount'> {
  return {
    version: 1,
    title: thread.title || 'Untitled Chat',
    createdAt: thread.createdAt,
    projectContext: thread.projectId && projectName ? {
      name: projectName
      // Exclude systemPrompt for privacy
    } : undefined
  };
}

/**
 * Validates that sanitized data contains no sensitive information
 */
export function validateSanitizedData(data: SharedChatData): boolean {
  // Check that no messages contain sensitive fields
  const hasSensitiveData = data.messages.some(msg => 
    'code' in msg || 
    'provider' in msg || 
    'usedKeyType' in msg
  );
  
  if (hasSensitiveData) return false;
  
  // Check that project context doesn't contain system prompt
  if (data.projectContext && 'systemPrompt' in data.projectContext) {
    return false;
  }
  
  return true;
}