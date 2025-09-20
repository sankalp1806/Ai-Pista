'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PWAErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('PWA Error Boundary caught an error:', error, errorInfo);
    
    // Track error in analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_error', {
        event_category: 'PWA',
        event_label: error.message,
        custom_parameter_1: errorInfo.componentStack,
      });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium">PWA Feature Unavailable</h3>
          <p className="text-red-600 text-sm mt-1">
            A PWA feature encountered an error. The app will continue to work normally.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-red-600 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PWAErrorBoundary;