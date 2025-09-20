"use client";

import Link from 'next/link';
import { useTheme } from '@/lib/themeContext';
import { BACKGROUND_STYLES } from '@/lib/themes';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

interface SharedChatErrorProps {
  error: string;
}

export default function SharedChatError({ error }: SharedChatErrorProps) {
  const { theme } = useTheme();
  const backgroundClass = BACKGROUND_STYLES[theme.background].className;

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'No chat data provided':
        return {
          title: 'Invalid Share Link',
          description: 'The share link appears to be incomplete or malformed.',
          suggestion: 'Please check that you have the complete URL and try again.',
          severity: 'error' as const
        };
      case 'Invalid or corrupted share link':
        return {
          title: 'Corrupted Share Link',
          description: 'The shared conversation data could not be decoded.',
          suggestion: 'The link may have been corrupted during sharing. Please request a new share link.',
          severity: 'error' as const
        };
      case 'Failed to load shared chat':
        return {
          title: 'Loading Failed',
          description: 'An unexpected error occurred while loading the shared conversation.',
          suggestion: 'Please try refreshing the page or contact support if the problem persists.',
          severity: 'error' as const
        };
      default:
        return {
          title: 'Something Went Wrong',
          description: error,
          suggestion: 'Please try again or return to the main application.',
          severity: 'error' as const
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  const handleRetry = () => {
    try {
      window.location.reload();
    } catch (error) {
      console.error('Failed to reload page:', error);
      // Fallback: redirect to home
      window.location.href = '/';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className={`min-h-screen w-full ${backgroundClass} relative text-white`}>
      <div className="absolute inset-0 z-0 pointer-events-none opacity-95" />
      
      <div className="relative z-10 px-3 lg:px-4 py-4 lg:py-6">
        <div className="max-w-2xl mx-auto">
          {/* Skip to main content link for screen readers */}
          <a 
            href="#main-error-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
          >
            Skip to main content
          </a>

          {/* Navigation */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <Link 
              href="/"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent rounded"
              onKeyDown={(e) => handleKeyDown(e, () => window.location.href = '/')}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Back to Open Fiesta</span>
            </Link>
          </nav>

          {/* Error Content */}
          <main id="main-error-content" className="text-center space-y-6">
            {/* Error Icon with proper ARIA */}
            <div className="flex justify-center">
              <div 
                className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center"
                role="img"
                aria-label="Error icon"
              >
                <AlertCircle size={32} className="text-red-400" aria-hidden="true" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-3" role="alert" aria-live="assertive">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {errorInfo.title}
              </h1>
              <p className="text-white/70 text-lg">
                {errorInfo.description}
              </p>
              <p className="text-white/50">
                {errorInfo.suggestion}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
              <button
                onClick={handleRetry}
                onKeyDown={(e) => handleKeyDown(e, handleRetry)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
                aria-describedby="retry-description"
              >
                Try Again
              </button>

              
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
                onKeyDown={(e) => handleKeyDown(e, () => window.location.href = '/')}
                aria-describedby="home-description"
              >
                <Home size={16} aria-hidden="true" />
                <span>Go to Open Fiesta</span>
              </Link>
            </div>

            {/* Hidden descriptions for screen readers */}
            <span id="retry-description" className="sr-only">
              Reload the page to try loading the shared conversation again
            </span>
            <span id="home-description" className="sr-only">
              Navigate to the main Open Fiesta application
            </span>

            {/* Technical Details */}
            <details className="mt-8 text-left">
              <summary 
                className="cursor-pointer text-white/50 hover:text-white/70 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-expanded="false"
              >
                Technical Details
              </summary>
              <div className="mt-3 p-4 bg-black/20 rounded-lg border border-white/10">
                <code 
                  className="text-sm text-white/70 break-all"
                  aria-label={`Error details: ${error}`}
                >
                  Error: {error}
                </code>
              </div>
            </details>
          </main>
        </div>
      </div>
    </div>
  );
}