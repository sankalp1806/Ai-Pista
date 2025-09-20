'use client';

import React, { useState, useEffect } from 'react';
import { useOffline } from '@/lib/offline/useOffline';
import { OfflineIndicator } from './OfflineIndicator';
import type { ChatMessage } from '@/lib/types';

interface OfflineDemoProps {
  userId?: string;
}

export const OfflineDemo: React.FC<OfflineDemoProps> = ({ userId = 'demo-user' }) => {
  const {
    status,
    isOnline,
    sendMessage,
    createThread,
    getCachedConversations,
    syncNow,
    getStorageUsage
  } = useOffline();

  const [conversations, setConversations] = useState<any[]>([]);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConversations();
    loadStorageInfo();
  }, []);

  const loadConversations = async () => {
    try {
      const cached = await getCachedConversations();
      setConversations(cached);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageUsage();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const handleCreateThread = async () => {
    try {
      const { thread } = await createThread(
        userId,
        'Demo Thread',
        undefined,
        'home'
      );
      console.log('Created thread:', thread);
      await loadConversations();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || conversations.length === 0) return;

    try {
      const testMessage: ChatMessage = {
        role: 'user',
        content: message.trim(),
        ts: Date.now()
      };

      await sendMessage(userId, conversations[0].id, testMessage);
      setMessage('');
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSync = async () => {
    try {
      await syncNow();
      await loadConversations();
      await loadStorageInfo();
    } catch (error) {
      console.error('Error syncing:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Offline Functionality Demo</h2>
      
      {/* Status Section */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
        <div className="flex items-center gap-4">
          <OfflineIndicator showDetails={true} />
          <div className="text-sm">
            <div>Online: {isOnline ? 'Yes' : 'No'}</div>
            <div>Queued Actions: {status.queuedActionsCount}</div>
            <div>Sync in Progress: {status.syncInProgress ? 'Yes' : 'No'}</div>
            <div>Has Conflicts: {status.hasConflicts ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      {storageInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Storage Usage</h3>
          <div className="text-sm">
            <div>Used: {(storageInfo.used / 1024 / 1024).toFixed(2)} MB</div>
            <div>Quota: {(storageInfo.quota / 1024 / 1024).toFixed(2)} MB</div>
            <div>Percentage: {storageInfo.percentage.toFixed(1)}%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thread Management */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Thread Management</h3>
          <button
            onClick={handleCreateThread}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-3"
          >
            Create Demo Thread
          </button>
          
          <div className="text-sm">
            <div>Cached Conversations: {conversations.length}</div>
            {conversations.slice(0, 3).map((conv, index) => (
              <div key={conv.id} className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                {conv.title} ({conv.messages.length} messages)
              </div>
            ))}
          </div>
        </div>

        {/* Message Sending */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Send Message</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || conversations.length === 0}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
          
          {conversations.length === 0 && (
            <div className="text-sm text-gray-500">
              Create a thread first to send messages
            </div>
          )}
        </div>
      </div>

      {/* Sync Controls */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Sync Controls</h3>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={!isOnline || status.syncInProgress}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {status.syncInProgress ? 'Syncing...' : 'Sync Now'}
          </button>
          
          <button
            onClick={() => {
              (navigator as any).onLine = !(navigator as any).onLine;
              window.dispatchEvent(new Event((navigator as any).onLine ? 'online' : 'offline'));
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Toggle Online/Offline
          </button>
        </div>
        
        <div className="text-sm mt-2 text-gray-600 dark:text-gray-400">
          Try going offline and creating threads or sending messages. 
          They will be queued and synced when you come back online.
        </div>
      </div>
    </div>
  );
};

export default OfflineDemo;