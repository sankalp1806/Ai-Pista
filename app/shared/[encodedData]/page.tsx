"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { decodeShareData } from '@/lib/sharing/encoding';
import type { SharedChatData } from '@/lib/sharing/types';
import SharedChatPage from '@/components/shared/SharedChatPage';
import SharedChatError from '@/components/shared/SharedChatError';
import SharedChatLoading from '@/components/shared/SharedChatLoading';

export default function SharedChatRoute() {
  const params = useParams();
  const encodedData = params.encodedData as string;
  
  const [chatData, setChatData] = useState<SharedChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!encodedData) {
      setError('No chat data provided');
      setLoading(false);
      return;
    }

    const startTime = Date.now();
    const shareId = encodedData.substring(0, 8); // Use first 8 chars as share ID for logging

    try {
      setLoading(true);
      setError(null);
      
      // Decode the shared chat data
      const decoded = decodeShareData(encodedData);
      
      if (!decoded) {
        setError('Invalid or corrupted share link');
        setLoading(false);
        
        // Log decode failure
        if (process.env.NODE_ENV === 'production') {
          fetch('/api/metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'share_decode_error',
              data: {
                shareId,
                error: 'Invalid or corrupted share link',
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
              }
            })
          }).catch(() => {}); // Silently fail
        }
        
        return;
      }
      
      const loadTime = Date.now() - startTime;
      
      setChatData(decoded);
      setLoading(false);
      
      // Log successful share view
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'share_viewed',
            data: {
              shareId,
              messageCount: decoded.messages.length,
              truncated: decoded.truncated || false,
              loadTime,
              userAgent: navigator.userAgent,
              referrer: document.referrer,
              timestamp: new Date().toISOString()
            }
          })
        }).catch(() => {}); // Silently fail
      }
      
    } catch (err) {
      console.error('Error decoding shared chat:', err);
      setError('Failed to load shared chat');
      setLoading(false);
      
      // Log decode error
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'share_decode_error',
            data: {
              shareId,
              error: err instanceof Error ? err.message : 'Unknown error',
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          })
        }).catch(() => {}); // Silently fail
      }
    }
  }, [encodedData]);

  if (loading) {
    return <SharedChatLoading />;
  }

  if (error || !chatData) {
    return <SharedChatError error={error || 'Unknown error occurred'} />;
  }

  return <SharedChatPage chatData={chatData} />;
}