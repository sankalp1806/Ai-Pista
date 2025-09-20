'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { isStandalone } from '@/lib/pwa-config';
import { LaunchScreen } from '@/components/ui/LaunchScreen';
import { Loading } from '@/components/ui/Loading';

interface AppShellProps {
  children: React.ReactNode;
  showLaunchScreen?: boolean;
  launchScreenDuration?: number;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  showLaunchScreen = true,
  launchScreenDuration = 1500,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(showLaunchScreen);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    setIsStandaloneMode(isStandalone());
    setIsHydrated(true);

    // Handle launch screen timing
    if (showLaunchScreen) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, launchScreenDuration);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [showLaunchScreen, launchScreenDuration]);

  // Show loading state during hydration
  if (!isHydrated) {
    return <Loading />;
  }

  // Show launch screen for PWA
  if (isLoading && isStandaloneMode) {
    return <LaunchScreen />;
  }

  return (
    <div className={`app-shell min-h-screen ${isStandaloneMode ? 'standalone-mode' : 'browser-mode'} ${className}`}>
      {/* App Shell Header - Critical above-the-fold content */}
      <div className="app-shell-header">
        {/* This will be populated by the actual header component */}
      </div>

      {/* Main Content Area */}
      <main className="app-shell-main flex-1">
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </main>

      {/* App Shell Footer - Non-critical content */}
      <div className="app-shell-footer">
        {/* This will be populated by the actual footer component */}
      </div>

      {/* PWA-specific styles */}
      <style jsx>{`
        .app-shell {
          display: flex;
          flex-direction: column;
        }
        
        .standalone-mode {
          /* Adjust for standalone PWA mode */
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        .app-shell-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        /* Optimize for PWA performance */
        .app-shell * {
          box-sizing: border-box;
        }
        
        /* Prevent overscroll in standalone mode */
        .standalone-mode {
          overscroll-behavior: none;
        }
        
        /* Handle notch and safe areas */
        @supports (padding: max(0px)) {
          .standalone-mode {
            padding-top: max(env(safe-area-inset-top), 0px);
            padding-bottom: max(env(safe-area-inset-bottom), 0px);
            padding-left: max(env(safe-area-inset-left), 0px);
            padding-right: max(env(safe-area-inset-right), 0px);
          }
        }
      `}</style>
    </div>
  );
};

export default AppShell;