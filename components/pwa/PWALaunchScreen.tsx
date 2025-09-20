'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/themeContext';
import { isStandalone } from '@/lib/pwa-config';
import { cn } from '@/lib/utils';

interface PWALaunchScreenProps {
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export const PWALaunchScreen: React.FC<PWALaunchScreenProps> = ({
  title = 'AI Pista',
  subtitle = 'AI Chat Platform',
  logoSrc = '/brand.svg',
  duration = 2000,
  onComplete,
  className = '',
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);

  const isDark = theme.mode === 'dark';

  useEffect(() => {
    setIsStandaloneMode(isStandalone());
  }, []);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    // Hide launch screen after duration
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      const fadeTimer = setTimeout(() => {
        onComplete?.();
      }, 300); // Wait for fade out animation
      
      return () => clearTimeout(fadeTimer);
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(hideTimer);
    };
  }, [duration, onComplete]);

  // Only show launch screen in standalone mode
  if (!isStandaloneMode) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${isDark ? '#ffffff' : '#000000'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-8">
        {/* Logo container with glow effect */}
        <div className="relative mb-8">
          <div 
            className={cn(
              "w-24 h-24 mx-auto rounded-2xl flex items-center justify-center shadow-2xl",
              isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"
            )}
            style={{
              boxShadow: isDark 
                ? '0 0 60px rgba(59, 130, 246, 0.3), 0 0 120px rgba(147, 51, 234, 0.2)'
                : '0 0 60px rgba(59, 130, 246, 0.2), 0 0 120px rgba(147, 51, 234, 0.1)'
            }}
          >
            {logoSrc && (
              <img 
                src={logoSrc} 
                alt={title}
                className="w-16 h-16 rounded-xl"
              />
            )}
          </div>
          
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className={cn(
                "w-32 h-32 rounded-full border-2 animate-pulse",
                isDark ? "border-blue-500/20" : "border-blue-500/30"
              )}
              style={{
                animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
            <div 
              className={cn(
                "absolute w-40 h-40 rounded-full border border-purple-500/10 animate-pulse",
              )}
              style={{
                animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.5s'
              }}
            />
          </div>
        </div>

        {/* App name and subtitle */}
        <div className="mb-8">
          <h1 className={cn(
            "text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          )}>
            {title}
          </h1>
          <p className={cn(
            "text-lg",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {subtitle}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className={cn(
            "h-1 rounded-full overflow-hidden",
            isDark ? "bg-gray-800" : "bg-gray-200"
          )}>
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-100 ease-out"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
              }}
            />
          </div>
          
          {/* Loading text */}
          <p className={cn(
            "text-sm mt-4",
            isDark ? "text-gray-500" : "text-gray-500"
          )}>
            {progress < 30 ? 'Initializing...' : 
             progress < 60 ? 'Loading components...' : 
             progress < 90 ? 'Almost ready...' : 
             'Welcome!'}
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PWALaunchScreen;
