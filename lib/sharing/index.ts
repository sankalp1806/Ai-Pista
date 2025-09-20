// Export types
export type { 
  SharedChatData, 
  TruncationConfig, 
  TruncationResult, 
  ShareResult 
} from './types';

// Export utilities
export { 
  truncateMessages, 
  validateMessagesForSharing,
  DEFAULT_TRUNCATION_CONFIG 
} from './truncation';

export { 
  sanitizeMessage, 
  sanitizeMessages, 
  sanitizeThreadForSharing, 
  validateSanitizedData 
} from './sanitization';

export { 
  encodeShareData, 
  decodeShareData, 
  estimateUrlLength, 
  isUrlTooLong 
} from './encoding';

// Export main service
export { ShareService } from './shareService';
export type { ShareServiceConfig } from './shareService';