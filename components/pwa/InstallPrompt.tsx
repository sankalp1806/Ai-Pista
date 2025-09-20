'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Zap, Wifi, Bell } from 'lucide-react';
import { isStandalone } from '@/lib/pwa-config';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  onInstall,
  onDismiss,
  className = '',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Don't show if already installed
    if (isStandalone()) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      if (isMounted) {
        setDeferredPrompt(promptEvent);
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      if (isMounted) {
        setDeferredPrompt(null);
        setIsVisible(false);
        onInstall?.();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      isMounted = false;
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstall]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        // Track successful installation
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'pwa_install_success', {
            event_category: 'PWA',
            event_label: 'install_prompt',
          });
        }
        onInstall?.();
      } else {
        // Track dismissal
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'pwa_install_dismissed', {
            event_category: 'PWA',
            event_label: 'install_prompt',
          });
        }
      }
    } catch (error) {
      console.error('Error during PWA installation:', error instanceof Error ? error.message : 'Unknown error');
      // Reset state on error
      setIsInstalling(false);
      setIsVisible(false);
    } finally {
      setDeferredPrompt(null);
      setIsVisible(false);
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  if (!isVisible || isDismissed || isStandalone()) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Install Open Fiesta
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get the app experience
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <Zap className="w-3 h-3" />
            <span>Faster loading</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <Wifi className="w-3 h-3" />
            <span>Works offline</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <Bell className="w-3 h-3" />
            <span>Push notifications</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center space-x-1"
          >
            {isInstalling ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                <span>Installing...</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                <span>Install</span>
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;