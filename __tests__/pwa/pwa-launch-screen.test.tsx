import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';

// Create a mock theme context
const mockThemeContext = {
  theme: {
    mode: 'dark' as const,
    accent: 'crimson' as const,
    font: 'geist' as const,
    background: 'gradient' as const,
    badgePair: 'gold-green' as const,
    chatInputStyle: 'default' as const,
  },
  setMode: jest.fn(),
  setAccent: jest.fn(),
  setFont: jest.fn(),
  setBackground: jest.fn(),
  setBadgePair: jest.fn(),
  toggleMode: jest.fn(),
  resetTheme: jest.fn(),
  updateTheme: jest.fn(),
  isLoading: false,
  isInitialized: true,
};

// Mock the entire theme context module
jest.mock('@/lib/themeContext', () => {
  const React = require('react');
  const ThemeContext = React.createContext(null);
  
  return {
    useTheme: () => mockThemeContext,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => 
      React.createElement(ThemeContext.Provider, { value: mockThemeContext }, children),
  };
});

// Mock PWA config
jest.mock('@/lib/pwa-config', () => ({
  isStandalone: jest.fn(() => true),
}));

// Import the actual component after mocking dependencies
import PWALaunchScreen from '@/components/pwa/PWALaunchScreen';

describe('PWALaunchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render launch screen with default props', () => {
    render(<PWALaunchScreen />);

    expect(screen.getByText('Open Fiesta')).toBeInTheDocument();
    expect(screen.getByText('AI Chat Platform')).toBeInTheDocument();
  });

  it('should render with custom title and subtitle', () => {
    render(
      <PWALaunchScreen 
        title="Custom App" 
        subtitle="Custom Subtitle" 
      />
    );

    expect(screen.getByText('Custom App')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
  });

  it('should animate progress bar', async () => {
    render(<PWALaunchScreen duration={1000} />);

    // Initially should show "Initializing..."
    expect(screen.getByText('Initializing...')).toBeInTheDocument();

    // Advance time to show different loading states
    jest.advanceTimersByTime(300);
    await waitFor(() => {
      expect(screen.getByText('Loading components...')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(300);
    await waitFor(() => {
      expect(screen.getByText('Almost ready...')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(400);
    await waitFor(() => {
      expect(screen.getByText('Welcome!')).toBeInTheDocument();
    });
  });

  it('should call onComplete after duration', async () => {
    const onComplete = jest.fn();
    render(<PWALaunchScreen duration={1000} onComplete={onComplete} />);

    // Fast-forward past the duration + fade out time
    jest.advanceTimersByTime(1300);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should not render when not in standalone mode', () => {
    const { isStandalone } = require('@/lib/pwa-config');
    isStandalone.mockReturnValue(false);

    const { container } = render(<PWALaunchScreen />);
    expect(container.firstChild).toBeNull();
  });

  it('should fade out after duration', async () => {
    render(<PWALaunchScreen duration={1000} />);

    const launchScreen = screen.getByText('Open Fiesta').closest('div');
    expect(launchScreen).toHaveClass('opacity-100');

    // Fast-forward to when it should start fading
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(launchScreen).toHaveClass('opacity-0');
    });
  });

  it('should render logo when logoSrc is provided', () => {
    render(<PWALaunchScreen logoSrc="/test-logo.svg" />);

    const logo = screen.getByAltText('Open Fiesta');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/test-logo.svg');
  });

  it('should apply custom className', () => {
    render(<PWALaunchScreen className="custom-launch-screen" />);

    const launchScreen = screen.getByText('Open Fiesta').closest('div');
    expect(launchScreen).toHaveClass('custom-launch-screen');
  });

  it('should handle light theme', () => {
    // Temporarily override the theme for this test
    mockThemeContext.theme.mode = 'light';

    render(<PWALaunchScreen />);

    // Should render without errors in light mode
    expect(screen.getByText('Open Fiesta')).toBeInTheDocument();
    
    // Reset to dark mode for other tests
    mockThemeContext.theme.mode = 'dark';
  });
});