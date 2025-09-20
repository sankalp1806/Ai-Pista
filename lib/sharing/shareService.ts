import type { ChatThread } from '@/lib/types';
import type { SharedChatData, ShareResult } from './types';
import { truncateMessages, validateMessagesForSharing } from './truncation';
import { sanitizeMessages, sanitizeThreadForSharing, validateSanitizedData } from './sanitization';
import { encodeShareData, isUrlTooLong } from './encoding';

export interface ShareServiceConfig {
  baseUrl?: string;
  maxUrlLength?: number;
}

/**
 * Main service for creating shareable URLs from chat threads
 */
export class ShareService {
  private config: ShareServiceConfig;

  constructor(config: ShareServiceConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
      maxUrlLength: config.maxUrlLength || 16000, // Increased to accommodate full conversations
    };
  }

  /**
   * Generates a shareable URL for a chat thread
   */
  async generateShareableUrl(thread: ChatThread, projectName?: string): Promise<ShareResult> {
    const startTime = Date.now();
    const shareId = Math.random().toString(36).substring(7);

    try {

      // Validate input
      if (!thread || !thread.messages || thread.messages.length === 0) {
        return {
          success: false,
          error: 'Cannot share empty conversation'
        };
      }

      if (!validateMessagesForSharing(thread.messages)) {
        return {
          success: false,
          error: 'Invalid message format'
        };
      }

      // Process the thread for sharing with progressive truncation
      let sharedData = this.processThreadForSharing(thread, projectName);

      // Validate sanitized data
      if (!validateSanitizedData(sharedData)) {
        return {
          success: false,
          error: 'Data sanitization failed'
        };
      }

      // Check URL length with progressive truncation (only if really necessary)
      let attempts = 0;
      const maxAttempts = 5; // Increased attempts
      
      while (isUrlTooLong(sharedData, this.config.baseUrl, this.config.maxUrlLength) && attempts < maxAttempts) {
        attempts++;
        // More conservative reduction - only reduce by 20% each time to preserve more content
        const newMaxMessages = Math.max(5, Math.floor(sharedData.messages.length * 0.8)); 
        
        const truncationResult = truncateMessages(thread.messages, { 
          maxMessages: newMaxMessages, 
          preserveOrder: true, 
          includeMetadata: true 
        });
        
        const sanitizedMessages = sanitizeMessages(truncationResult.messages);
        const sanitizedThread = sanitizeThreadForSharing(thread, projectName);
        
        sharedData = {
          ...sanitizedThread,
          messages: sanitizedMessages,
          truncated: true,
          originalMessageCount: truncationResult.originalCount,
          originalUserMessageCount: truncationResult.originalUserMessageCount
        };
      }
      
      if (isUrlTooLong(sharedData, this.config.baseUrl, this.config.maxUrlLength)) {
        return {
          success: false,
          error: 'Conversation too large to share. Try sharing a shorter conversation.'
        };
      }

      // Generate the shareable URL
      const encoded = encodeShareData(sharedData);
      const url = `${this.config.baseUrl}/shared/${encoded}`;
      
      const duration = Date.now() - startTime;

      // Share created successfully

      return {
        success: true,
        url
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: 'An unexpected error occurred while sharing'
      };
    }
  }

  /**
   * Processes a chat thread for sharing (truncation + sanitization)
   */
  processThreadForSharing(thread: ChatThread, projectName?: string): SharedChatData {
    // Apply truncation logic
    const truncationResult = truncateMessages(thread.messages);
    
    // Sanitize the messages
    const sanitizedMessages = sanitizeMessages(truncationResult.messages);
    
    // Sanitize thread metadata
    const sanitizedThread = sanitizeThreadForSharing(thread, projectName);
    
    // Combine into shared data structure
    return {
      ...sanitizedThread,
      messages: sanitizedMessages,
      truncated: truncationResult.truncated,
      originalMessageCount: truncationResult.truncated ? truncationResult.originalCount : undefined,
      originalUserMessageCount: truncationResult.truncated ? truncationResult.originalUserMessageCount : undefined
    };
  }

  /**
   * Copies text to clipboard with comprehensive fallback handling
   */
  async copyToClipboard(text: string): Promise<boolean> {
    // Validate input
    if (!text || typeof text !== 'string') {
      console.error('Invalid text provided to copyToClipboard');
      return false;
    }

    try {
      // Try modern clipboard API first (preferred method)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback for older browsers or non-secure contexts
      return this.fallbackCopyToClipboard(text);
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback:', error);
      // If clipboard API fails, try fallback
      return this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * Fallback clipboard method with enhanced error handling
   */
  private fallbackCopyToClipboard(text: string): boolean {
    try {
      // Check if document.execCommand is available
      if (!document.execCommand) {
        console.warn('document.execCommand not available');
        return false;
      }

      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make the textarea invisible but accessible
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.setAttribute('readonly', '');
      textArea.setAttribute('aria-hidden', 'true');
      
      document.body.appendChild(textArea);
      
      // Focus and select the text
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);
      
      // Attempt to copy
      const successful = document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textArea);
      
      if (!successful) {
        console.warn('document.execCommand copy failed');
      }
      
      return successful;
    } catch (error) {
      console.error('Fallback copy method failed:', error);
      return false;
    }
  }

  /**
   * Checks if clipboard functionality is available
   */
  isClipboardAvailable(): boolean {
    return !!(
      (navigator.clipboard && window.isSecureContext) || 
      document.execCommand
    );
  }

  /**
   * Gets user-friendly error message for clipboard failures
   */
  getClipboardErrorMessage(): string {
    if (!this.isClipboardAvailable()) {
      return 'Clipboard access is not available in this browser. Please copy the link manually.';
    }
    
    if (!window.isSecureContext) {
      return 'Clipboard access requires a secure connection (HTTPS). Please copy the link manually.';
    }
    
    return 'Clipboard access failed. Please copy the link manually.';
  }


}