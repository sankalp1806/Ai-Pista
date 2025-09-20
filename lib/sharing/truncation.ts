import type { ChatMessage } from '@/lib/types';
import type { TruncationConfig, TruncationResult } from './types';

export const DEFAULT_TRUNCATION_CONFIG: TruncationConfig = {
  maxMessages: 100, // Increased to show full conversations
  preserveOrder: true,
  includeMetadata: true,
};

/**
 * Truncates messages to the last N messages while preserving complete conversation turns
 */
export function truncateMessages(
  messages: ChatMessage[], 
  config: TruncationConfig = DEFAULT_TRUNCATION_CONFIG
): TruncationResult {
  const originalCount = messages.length;
  const originalUserMessageCount = messages.filter(msg => msg.role === 'user').length;
  
  if (originalCount <= config.maxMessages) {
    return {
      messages,
      truncated: false,
      originalCount,
      originalUserMessageCount
    };
  }
  
  // Try to preserve complete conversation turns
  const selectedMessages = truncatePreservingTurns(messages, config.maxMessages);
  
  return {
    messages: selectedMessages,
    truncated: true,
    originalCount,
    originalUserMessageCount
  };
}

/**
 * Truncates messages while trying to preserve complete conversation turns
 * (user message + all associated assistant responses)
 */
function truncatePreservingTurns(messages: ChatMessage[], maxMessages: number): ChatMessage[] {
  // If we can fit all messages, return them all
  if (messages.length <= maxMessages) {
    return messages;
  }
  
  // Extract any leading system messages (preserve if possible)
  const systemMessages: ChatMessage[] = [];
  let restStart = 0;
  for (const msg of messages) {
    if (msg.role === 'system') {
      systemMessages.push(msg);
      restStart++;
    } else {
      break;
    }
  }
  const conversationMessages = messages.slice(restStart);
  
  // Group conversation messages into turns
  const turns: ChatMessage[][] = [];
  let currentTurn: ChatMessage[] = [];
  
  for (const message of conversationMessages) {
    if (message.role === 'user') {
      // Start a new turn
      if (currentTurn.length > 0) {
        turns.push(currentTurn);
      }
      currentTurn = [message];
    } else if (message.role === 'assistant') {
      // Add to current turn
      currentTurn.push(message);
    }
    // Note: system messages in the middle are intentionally dropped for privacy
  }
  
  // Don't forget the last turn
  if (currentTurn.length > 0) {
    turns.push(currentTurn);
  }
  
  // Select the last complete turns that fit within maxMessages
  let selectedMessages: ChatMessage[] = [];
  let messageCount = 0;
  
  // Start from the end and work backwards
  for (let i = turns.length - 1; i >= 0; i--) {
    const turn = turns[i];
    if (messageCount + turn.length <= maxMessages) {
      selectedMessages = [...turn, ...selectedMessages];
      messageCount += turn.length;
    } else {
      // If we can't fit this complete turn, stop here
      break;
    }
  }
  
  // If we couldn't fit any complete turns, fall back to simple truncation
  if (selectedMessages.length === 0) {
    selectedMessages = conversationMessages.slice(-maxMessages);
  }
  
  // Try to include system messages if they fit
  const finalMessages = [...systemMessages, ...selectedMessages];
  return finalMessages.length <= maxMessages ? finalMessages : selectedMessages;
}

/**
 * Validates that messages array is suitable for sharing
 */
export function validateMessagesForSharing(messages: ChatMessage[]): boolean {
  if (!Array.isArray(messages)) {
    return false;
  }
  
  if (messages.length === 0) {
    return false;
  }
  
  // Filter to shareable message types
  const shareableMessages = messages.filter(msg => 
    msg && (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system')
  );
  
  if (shareableMessages.length === 0) {
    return false;
  }
  
  // Check that all shareable messages have required fields
  return shareableMessages.every(msg => 
    msg.role && 
    typeof msg.content === 'string' && 
    msg.content.trim().length > 0
  );
}