// Offline functionality exports
export { offlineManager } from './manager';
export { offlineStorage } from './storage';
export { offlineDataLayer } from './dataLayer';
export { offlineChatActions } from './chatActionsOffline';
export { useOffline } from './useOffline';
export type {
  OfflineAction,
  OfflineQueueItem,
  CachedConversation,
  OfflineStorage,
  SyncResult,
  OfflineStatus
} from './types';

// Re-export components
export { OfflineIndicator } from '../../components/offline/OfflineIndicator';