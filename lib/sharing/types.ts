import type { ChatMessage } from '@/lib/types';

export interface SharedChatData {
  version: number; // For future compatibility
  title: string;
  createdAt: number;
  messages: ChatMessage[]; // Truncated to last 20 messages
  truncated: boolean;
  originalMessageCount?: number;
  originalUserMessageCount?: number;
  projectContext?: {
    name: string;
    // Exclude systemPrompt for privacy
  };
}

export interface TruncationConfig {
  maxMessages: number; // 20
  preserveOrder: boolean; // true
  includeMetadata: boolean; // true
}

export interface TruncationResult {
  messages: ChatMessage[];
  truncated: boolean;
  originalCount: number;
  originalUserMessageCount: number;
}

export interface ShareResult {
  success: boolean;
  url?: string;
  error?: string;
}