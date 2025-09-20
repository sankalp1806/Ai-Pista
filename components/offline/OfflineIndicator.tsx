'use client';

import React, { useState, useEffect } from 'react';
import { offlineManager } from '@/lib/offline/manager';
import type { OfflineStatus } from '@/lib/offline/types';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showDetails = false
}) => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    queuedActionsCount: 0,
    syncInProgress: false,
    hasConflicts: false
  });

  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const updateStatus = async () => {
      const currentStatus = await offlineManager.getStatus();
      setStatus(currentStatus);
    };

    updateStatus();
    const unsubscribe = offlineManager.addStatusListener(setStatus);

    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    if (status.isOnline && !status.syncInProgress) {
      await offlineManager.syncQueuedActions();
    }
  };

  const getStatusColor = () => {
    if (!status.isOnline) return 'bg-red-500';
    if (status.syncInProgress) return 'bg-yellow-500';
    if (status.queuedActionsCount > 0) return 'bg-orange-500';
    if (status.hasConflicts) return 'bg-purple-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (status.syncInProgress) return 'Syncing...';
    if (status.queuedActionsCount > 0) return `${status.queuedActionsCount} pending`;
    if (status.hasConflicts) return 'Conflicts';
    return 'Online';
  };

  const getTooltipText = () => {
    if (!status.isOnline) {
      return 'You are offline. Changes will be saved locally and synced when you reconnect.';
    }
    if (status.syncInProgress) {
      return 'Synchronizing your changes with the server...';
    }
    if (status.queuedActionsCount > 0) {
      return `${status.queuedActionsCount} actions waiting to be synced. Click to sync now.`;
    }
    if (status.hasConflicts) {
      return 'Some changes have conflicts that need to be resolved.';
    }
    return 'All changes are synchronized.';
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleManualSync}
      >
        {/* Status indicator dot */}
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} transition-colors duration-200`}>
          {status.syncInProgress && (
            <div className="w-3 h-3 rounded-full bg-current animate-pulse" />
          )}
        </div>

        {/* Status text */}
        {showDetails && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getStatusText()}
          </span>
        )}

        {/* Sync button for pending actions */}
        {status.isOnline && status.queuedActionsCount > 0 && !status.syncInProgress && (
          <button
            onClick={handleManualSync}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Sync now"
          >
            Sync
          </button>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
          {getTooltipText()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;