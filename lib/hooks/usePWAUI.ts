'use client';

import { useState, useEffect } from 'react';
import { isStandalone, getInstallSource } from '@/lib/pwa-config';

interface PWAUIState {
  isStandalone: boolean;
  installSource: string;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  displayMode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape';
  isInstallable: boolean;
}

/**
 * Custom hook for PWA UI adjustments and responsive behavior
 * 
 * @returns {Object} PWA UI state and utility functions
 * @example
 * ```tsx
 * const { isStandalone, getStandaloneStyles, shouldShowInstallPrompt } = usePWAUI();
 * ```
 */
export const usePWAUI = () => {
  const [state, setState] = useState<PWAUIState>({
    isStandalone: false,
    installSource: 'unknown',
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    displayMode: 'browser',
    orientation: 'portrait',
    isInstallable: false,
  });

  useEffect(() => {
    const updatePWAState = () => {
      const standalone = isStandalone();
      const source = getInstallSource();
      
      // Detect display mode
      let displayMode: PWAUIState['displayMode'] = 'browser';
      if (window.matchMedia('(display-mode: standalone)').matches) {
        displayMode = 'standalone';
      } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
        displayMode = 'fullscreen';
      } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        displayMode = 'minimal-ui';
      }

      // Detect orientation
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

      // Get safe area insets (for devices with notches)
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaInsets = {
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
      };

      // Check if app is installable
      const isInstallable = !!(window as any).deferredPrompt;

      setState({
        isStandalone: standalone,
        installSource: source,
        safeAreaInsets,
        displayMode,
        orientation,
        isInstallable,
      });
    };

    updatePWAState();

    // Listen for orientation changes with debounce
    let orientationTimeout: NodeJS.Timeout;
    const handleOrientationChange = () => {
      clearTimeout(orientationTimeout);
      orientationTimeout = setTimeout(updatePWAState, 100); // Small delay to ensure dimensions are updated
    };

    // Listen for display mode changes
    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    const fullscreenMediaQuery = window.matchMedia('(display-mode: fullscreen)');
    const minimalUIMediaQuery = window.matchMedia('(display-mode: minimal-ui)');

    const handleDisplayModeChange = () => {
      updatePWAState();
    };

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      updatePWAState();
    };

    const handleAppInstalled = () => {
      (window as any).deferredPrompt = null;
      updatePWAState();
    };

    // Add event listeners
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
    window.addEventListener('resize', handleOrientationChange, { passive: true });
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    standaloneMediaQuery.addEventListener('change', handleDisplayModeChange);
    fullscreenMediaQuery.addEventListener('change', handleDisplayModeChange);
    minimalUIMediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      clearTimeout(orientationTimeout);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      
      standaloneMediaQuery.removeEventListener('change', handleDisplayModeChange);
      fullscreenMediaQuery.removeEventListener('change', handleDisplayModeChange);
      minimalUIMediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  // Helper functions for UI adjustments
  const getStandaloneStyles = () => ({
    paddingTop: state.safeAreaInsets.top,
    paddingBottom: state.safeAreaInsets.bottom,
    paddingLeft: state.safeAreaInsets.left,
    paddingRight: state.safeAreaInsets.right,
  });

  const getViewportHeight = () => {
    if (state.isStandalone) {
      return `calc(100vh - ${state.safeAreaInsets.top + state.safeAreaInsets.bottom}px)`;
    }
    return '100vh';
  };

  const shouldShowInstallPrompt = () => {
    return !state.isStandalone && state.isInstallable;
  };

  const getResponsiveClasses = () => {
    const classes = [];
    
    if (state.isStandalone) {
      classes.push('pwa-standalone');
    }
    
    classes.push(`pwa-display-${state.displayMode}`);
    classes.push(`pwa-orientation-${state.orientation}`);
    
    if (state.safeAreaInsets.top > 0) {
      classes.push('pwa-has-notch');
    }
    
    return classes.join(' ');
  };

  return {
    ...state,
    getStandaloneStyles,
    getViewportHeight,
    shouldShowInstallPrompt,
    getResponsiveClasses,
  };
};

export default usePWAUI;