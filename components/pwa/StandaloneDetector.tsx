'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { isStandalone, getInstallSource } from '@/lib/pwa-config';

interface StandaloneContextType {
  isStandalone: boolean;
  installSource: string;
  isLoading: boolean;
}

const StandaloneContext = createContext<StandaloneContextType>({
  isStandalone: false,
  installSource: 'unknown',
  isLoading: true,
});

export const useStandalone = () => {
  const context = useContext(StandaloneContext);
  if (!context) {
    throw new Error('useStandalone must be used within a StandaloneProvider');
  }
  return context;
};

interface StandaloneProviderProps {
  children: React.ReactNode;
}

export const StandaloneProvider: React.FC<StandaloneProviderProps> = ({ children }) => {
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [installSource, setInstallSource] = useState('unknown');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStandaloneMode = () => {
      const standalone = isStandalone();
      const source = getInstallSource();
      
      setIsStandaloneMode(standalone);
      setInstallSource(source);
      setIsLoading(false);

      // Add CSS class to body for global styling
      if (standalone) {
        document.body.classList.add('pwa-standalone');
        document.documentElement.classList.add('pwa-standalone');
      } else {
        document.body.classList.remove('pwa-standalone');
        document.documentElement.classList.remove('pwa-standalone');
      }

      // Track PWA usage
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_mode_detected', {
          event_category: 'PWA',
          event_label: standalone ? 'standalone' : 'browser',
          custom_parameter_1: source,
        });
      }
    };

    checkStandaloneMode();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      checkStandaloneMode();
    };

    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const value = {
    isStandalone: isStandaloneMode,
    installSource,
    isLoading,
  };

  return (
    <StandaloneContext.Provider value={value}>
      {children}
    </StandaloneContext.Provider>
  );
};

interface StandaloneUIProps {
  children: React.ReactNode;
  standaloneClassName?: string;
  browserClassName?: string;
}

export const StandaloneUI: React.FC<StandaloneUIProps> = ({
  children,
  standaloneClassName = '',
  browserClassName = '',
}) => {
  const { isStandalone: standalone, isLoading } = useStandalone();

  if (isLoading) {
    return <div className="standalone-loading">{children}</div>;
  }

  return (
    <div className={standalone ? standaloneClassName : browserClassName}>
      {children}
    </div>
  );
};

export default StandaloneProvider;