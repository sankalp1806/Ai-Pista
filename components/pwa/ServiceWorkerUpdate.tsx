'use client';

import React, { useState, useEffect } from 'react';
import { getServiceWorkerManager } from '../../lib/service-worker';

interface ServiceWorkerUpdateProps {
  onUpdate?: () => void;
  onDismiss?: () => void;
}

export const ServiceWorkerUpdate: React.FC<ServiceWorkerUpdateProps> = ({
  onUpdate,
  onDismiss,
}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleServiceWorkerUpdate = (event: CustomEvent) => {
      if (event.detail.type === 'available') {
        setUpdateAvailable(true);
      } else if (event.detail.type === 'applied') {
        setUpdateAvailable(false);
        setIsUpdating(false);
        // Reload the page to use the new service worker
        window.location.reload();
      }
    };

    // Listen for service worker update events
    window.addEventListener('sw-update', handleServiceWorkerUpdate as EventListener);

    return () => {
      window.removeEventListener('sw-update', handleServiceWorkerUpdate as EventListener);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      const manager = getServiceWorkerManager();
      await manager.skipWaiting();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update service worker:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
    onDismiss?.();
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            App Update Available
          </h3>
          <p className="text-xs opacity-90 mb-3">
            A new version of the app is ready. Update now to get the latest features and improvements.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white px-3 py-1 rounded text-xs"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/60 hover:text-white ml-2 p-1"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ServiceWorkerUpdate;