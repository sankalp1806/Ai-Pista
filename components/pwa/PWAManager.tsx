'use client';

import React, { useEffect, useState } from 'react';
import { StandaloneProvider } from './StandaloneDetector';
import InstallPrompt from './InstallPrompt';
import InstallBanner from './InstallBanner';
import PWALaunchScreen from './PWALaunchScreen';
import { ServiceWorkerUpdate } from './ServiceWorkerUpdate';
import PWAErrorBoundary from './PWAErrorBoundary';
import { injectPWAStyles } from '@/lib/pwa-styles';
import { isPWAEnabled, isStandalone } from '@/lib/pwa-config';

interface PWAManagerProps {
  children: React.ReactNode;
  showInstallPrompt?: boolean;
  showInstallBanner?: boolean;
  showLaunchScreen?: boolean;
  launchScreenDuration?: number;
  installPromptDelay?: number;
  bannerVariant?: 'top' | 'bottom';
}

export const PWAManager: React.FC<PWAManagerProps> = ({
  children,
  showInstallPrompt = true,
  showInstallBanner = true,
  showLaunchScreen = true,
  launchScreenDuration = 2000,
  installPromptDelay = 5000,
  bannerVariant = 'top',
}) => {
  const [isLaunchScreenVisible, setIsLaunchScreenVisible] = useState(showLaunchScreen);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [pwaEnabled, setPwaEnabled] = useState(false);

  useEffect(() => {
    // Check if PWA features should be enabled
    setPwaEnabled(isPWAEnabled());
    
    // Inject PWA styles
    injectPWAStyles();
    
    // Handle launch screen timing
    if (showLaunchScreen && isStandalone()) {
      const timer = setTimeout(() => {
        setIsLaunchScreenVisible(false);
      }, launchScreenDuration);
      
      return () => clearTimeout(timer);
    } else {
      setIsLaunchScreenVisible(false);
    }
  }, [showLaunchScreen, launchScreenDuration]);

  useEffect(() => {
    if (!pwaEnabled || isStandalone()) return;

    // Show install prompt after delay
    if (showInstallPrompt) {
      const promptTimer = setTimeout(() => {
        setShowPrompt(true);
      }, installPromptDelay);

      return () => clearTimeout(promptTimer);
    }

    // Show install banner
    if (showInstallBanner) {
      const bannerTimer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);

      return () => clearTimeout(bannerTimer);
    }
  }, [pwaEnabled, showInstallPrompt, showInstallBanner, installPromptDelay]);

  const handleInstall = () => {
    setShowPrompt(false);
    setShowBanner(false);
    
    // Track installation
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_install_success', {
        event_category: 'PWA',
        event_label: 'user_initiated',
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowBanner(false);
  };

  if (!pwaEnabled) {
    return <>{children}</>;
  }

  return (
    <PWAErrorBoundary>
      <StandaloneProvider>
        {/* PWA Launch Screen */}
        {isLaunchScreenVisible && (
          <PWAErrorBoundary>
            <PWALaunchScreen
              duration={launchScreenDuration}
              onComplete={() => setIsLaunchScreenVisible(false)}
            />
          </PWAErrorBoundary>
        )}

        {/* Main App Content */}
        <div className="pwa-app-container">
          {children}
        </div>

        {/* PWA Install Components */}
        {!isStandalone() && (
          <>
            {/* Install Banner */}
            {showBanner && showInstallBanner && (
              <PWAErrorBoundary>
                <InstallBanner
                  variant={bannerVariant}
                  onInstall={handleInstall}
                  onDismiss={handleDismiss}
                />
              </PWAErrorBoundary>
            )}

            {/* Install Prompt */}
            {showPrompt && showInstallPrompt && (
              <PWAErrorBoundary>
                <InstallPrompt
                  onInstall={handleInstall}
                  onDismiss={handleDismiss}
                />
              </PWAErrorBoundary>
            )}
          </>
        )}

        {/* Service Worker Update Notification */}
        <PWAErrorBoundary>
          <ServiceWorkerUpdate />
        </PWAErrorBoundary>

        {/* PWA-specific styles */}
        <style jsx global>{`
          .pwa-app-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .pwa-standalone .pwa-app-container {
            min-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
          
          .pwa-standalone {
            overscroll-behavior: none;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .pwa-standalone::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </StandaloneProvider>
    </PWAErrorBoundary>
  );
};

export default PWAManager;