'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { isStandalone } from '@/lib/pwa-config';

interface InstallBannerProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
  variant?: 'top' | 'bottom';
  showOnce?: boolean;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({
  onInstall,
  onDismiss,
  className = '',
  variant = 'top',
  showOnce = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) {
      return;
    }

    // Check if banner was permanently dismissed
    if (showOnce && localStorage.getItem('pwa-banner-dismissed')) {
      return;
    }

    // Check if banner was dismissed in this session
    if (sessionStorage.getItem('pwa-banner-session-dismissed')) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show banner after a short delay
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      onInstall?.();
      
      // Track installation
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'banner',
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstall, showOnce]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      // Track user choice
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_install_prompt', {
          event_category: 'PWA',
          event_label: choiceResult.outcome,
          custom_parameter_1: 'banner',
        });
      }
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installation accepted from banner');
        onInstall?.();
      }
    } catch (error) {
      console.error('Error during PWA installation from banner:', error);
    } finally {
      setDeferredPrompt(null);
      setIsVisible(false);
      setIsInstalling(false);
    }
  };

  const handleDismiss = (permanent = false) => {
    setIsVisible(false);
    
    if (permanent) {
      localStorage.setItem('pwa-banner-dismissed', 'true');
    } else {
      sessionStorage.setItem('pwa-banner-session-dismissed', 'true');
    }
    
    // Track dismissal
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_banner_dismiss', {
        event_category: 'PWA',
        event_label: permanent ? 'permanent' : 'session',
      });
    }
    
    onDismiss?.();
  };

  const getDeviceIcon = () => {
    if (typeof window === 'undefined') return Monitor;
    
    const userAgent = window.navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    return isMobile ? Smartphone : Monitor;
  };

  const DeviceIcon = getDeviceIcon();

  if (!isVisible || isStandalone()) {
    return null;
  }

  const bannerClasses = variant === 'top' 
    ? 'top-0 animate-in slide-in-from-top-2' 
    : 'bottom-0 animate-in slide-in-from-bottom-2';

  return (
    <div className={`fixed left-0 right-0 z-50 ${bannerClasses} ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <DeviceIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  Install Ai Pista for a better experience
                </p>
                <p className="text-xs text-blue-100">
                  Faster loading, offline access, and push notifications
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-white text-blue-600 hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
              >
                {isInstalling ? (
                  <>
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    <span>Install</span>
                  </>
                )}
              </button>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleDismiss(false)}
                  className="text-blue-100 hover:text-white text-xs px-2 py-1 rounded transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={() => handleDismiss(true)}
                  className="text-blue-100 hover:text-white p-1 rounded transition-colors"
                  aria-label="Dismiss permanently"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;

