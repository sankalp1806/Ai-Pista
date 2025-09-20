/**
 * Theme System Configuration
 * Defines all theme options, types, and constants for the AI Pista application
 */

// Theme Mode Types
export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'crimson'; // Simplified to a single accent
export type FontFamily = 'geist' | 'inter' | 'mono' | 'poppins';
export type BackgroundStyle = 'gradient' | 'minimal';
export type ChatInputStyle = 'default' | 'frosty';

// New: Badge Pairing Types
export type BadgePair = 'red-gold' | 'purple-blue' | 'orange-yellow' | 'gold-green' | 'white-white'; // new black/white minimal pair
export type BadgeType = 'pro' | 'free';

// New: Accent System Types
export type AccentTarget = 'interactive' | 'highlight' | 'status' | 'glow';

// Complete Theme Configuration Interface
export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentColor;
  font: FontFamily;
  background: BackgroundStyle;
  badgePair: BadgePair;
  chatInputStyle?: ChatInputStyle; // optional for backward compatibility
}

// Accent Color Definitions
export interface AccentDefinition {
  id: AccentColor;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  tertiary: string;
  background: {
    primary: string;
    secondary: string;
  };
  gradient: {
    light: string;
    dark: string;
  };
}

// Font Family Definitions
export interface FontDefinition {
  id: FontFamily;
  name: string;
  description: string;
  primary: string;
  secondary?: string;
  googleFont?: string;
  fallback: string;
}

// Background Style Definitions
export interface BackgroundDefinition {
  id: BackgroundStyle;
  name: string;
  description: string;
  className: string;
}


// Accent Color Configurations
export const ACCENT_COLORS: Record<AccentColor, AccentDefinition> = {
  crimson: {
    id: 'crimson',
    name: 'Crimson',
    description: 'Muted deep red',
    primary: '#9d1c2b',
    secondary: '#821624',
    tertiary: '#66111b',
    background: {
      primary: 'rgba(157, 28, 43, 0.12)',
      secondary: 'rgba(157, 28, 43, 0.045)',
    },
    gradient: {
      light:
        'linear-gradient(135deg, #d7b4b8 0%, #b94c58 22%, #8f2f3d 48%, #66111b 76%, #3c0b12 100%)',
      dark: 'linear-gradient(0deg, rgba(0,0,0,0.7), rgba(0,0,0,0.7)), radial-gradient(68% 58% at 50% 50%, #821624 0%, #66111b 22%, #4a0d14 42%, #320a0f 58%, #21080b 72%, #140507 86%, #090304 100%)',
    },
  },
};

// Font Family Configurations
export const FONT_FAMILIES: Record<FontFamily, FontDefinition> = {
  geist: {
    id: 'geist',
    name: 'Geist',
    description: 'Modern and clean (current)',
    primary: 'var(--font-geist-sans)',
    secondary: 'var(--font-geist-mono)',
    fallback: 'system-ui, -apple-system, sans-serif',
  },
  inter: {
    id: 'inter',
    name: 'Inter',
    description: 'Professional and readable',
    primary: 'var(--font-inter)',
    secondary: 'var(--font-inter)',
    googleFont: 'Inter:wght@300;400;500;600;700',
    fallback: 'system-ui, -apple-system, sans-serif',
  },
  mono: {
    id: 'mono',
    name: 'JetBrains Mono',
    description: 'Developer-focused monospace',
    primary: 'var(--font-jetbrains)',
    secondary: 'var(--font-jetbrains)',
    googleFont: 'JetBrains+Mono:wght@300;400;500;600;700',
    fallback: 'monospace',
  },
  poppins: {
    id: 'poppins',
    name: 'Poppins',
    description: 'Friendly and rounded',
    primary: 'var(--font-poppins)',
    secondary: 'var(--font-poppins)',
    googleFont: 'Poppins:wght@300;400;500;600;700',
    fallback: 'system-ui, -apple-system, sans-serif',
  },
};

// Background Style Configurations - Consolidated to 2 per accent
export const BACKGROUND_STYLES: Record<BackgroundStyle, BackgroundDefinition> = {
  gradient: {
    id: 'gradient',
    name: 'Gradient',
    description: 'Complex radial gradients (current)',
    className: 'bg-gradient-theme',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean solid with subtle patterns',
    className: 'bg-minimal-theme',
  },
};

// Default Theme Configuration
export const DEFAULT_THEME: ThemeConfig = {
  mode: 'dark',
  accent: 'crimson',
  font: 'geist',
  background: 'gradient',
  badgePair: 'gold-green',
  chatInputStyle: 'default',
};

// Theme Validation Helpers
export const isValidThemeMode = (mode: string): mode is ThemeMode =>
  ['light', 'dark'].includes(mode);

export const isValidAccentColor = (accent: string): accent is AccentColor =>
  Object.keys(ACCENT_COLORS).includes(accent);

export const isValidFontFamily = (font: string): font is FontFamily =>
  Object.keys(FONT_FAMILIES).includes(font);

export const isValidBackgroundStyle = (background: string): background is BackgroundStyle =>
  Object.keys(BACKGROUND_STYLES).includes(background);

export const isValidBadgePair = (badgePair: string): badgePair is BadgePair =>
  Object.keys(BADGE_PAIRS).includes(badgePair);

// Theme Configuration Validator
export const validateThemeConfig = (config: Partial<ThemeConfig>): ThemeConfig => {
  return {
    mode: isValidThemeMode(config.mode || '') ? config.mode! : DEFAULT_THEME.mode,
    accent: isValidAccentColor(config.accent || '') ? config.accent! : DEFAULT_THEME.accent,
    font: isValidFontFamily(config.font || '') ? config.font! : DEFAULT_THEME.font,
    background: isValidBackgroundStyle(config.background || '')
      ? config.background!
      : DEFAULT_THEME.background,
    badgePair: isValidBadgePair(config.badgePair || '')
      ? config.badgePair!
      : DEFAULT_THEME.badgePair,
    chatInputStyle: (config.chatInputStyle as ChatInputStyle) || DEFAULT_THEME.chatInputStyle,
  };
};

// CSS Class Name Generators
export const generateThemeClasses = (config: ThemeConfig): string[] => {
  return [
    config.mode,
    `accent-${config.accent}`,
    `font-${config.font}`,
    BACKGROUND_STYLES[config.background].className,
    config.chatInputStyle ? `chatinput-${config.chatInputStyle}` : 'chatinput-default',
  ];
};

// CSS Variable Names
export const CSS_VARIABLES = {
  // Accent Colors
  ACCENT_PRIMARY: '--accent-primary',
  ACCENT_SECONDARY: '--accent-secondary',
  ACCENT_TERTIARY: '--accent-tertiary',
  ACCENT_BG_PRIMARY: '--accent-bg-primary',
  ACCENT_BG_SECONDARY: '--accent-bg-secondary',

  // New: Interactive Accent Colors
  ACCENT_INTERACTIVE_PRIMARY: '--accent-interactive-primary',
  ACCENT_INTERACTIVE_HOVER: '--accent-interactive-hover',
  ACCENT_INTERACTIVE_ACTIVE: '--accent-interactive-active',

  // New: Highlight Accent Colors
  ACCENT_HIGHLIGHT_PRIMARY: '--accent-highlight-primary',
  ACCENT_HIGHLIGHT_SECONDARY: '--accent-highlight-secondary',

  // New: Status Accent Colors
  ACCENT_SUCCESS: '--accent-success',
  ACCENT_WARNING: '--accent-warning',
  ACCENT_ERROR: '--accent-error',
  ACCENT_INFO: '--accent-info',

  // New: Glow Effects
  ACCENT_GLOW_SOFT: '--accent-glow-soft',
  ACCENT_GLOW_MEDIUM: '--accent-glow-medium',
  ACCENT_GLOW_STRONG: '--accent-glow-strong',

  // Fonts
  FONT_PRIMARY: '--font-primary',
  FONT_SECONDARY: '--font-secondary',

  // Background
  BACKGROUND_PATTERN: '--background-pattern',
} as const;

// New: Badge System Definitions
export interface BadgeDefinition {
  id: BadgePair;
  name: string;
  description: string;
  pro: {
    background: string;
    text: string;
    border: string;
  };
  free: {
    background: string;
    text: string;
    border: string;
  };
}

export const BADGE_PAIRS: Record<BadgePair, BadgeDefinition> = {
  'white-white': {
    id: 'white-white',
    name: 'White & White',
    description: 'Monochrome minimal badges',
    pro: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 60%, #eaeaea 100%)',
      text: '#111111',
      border: 'rgba(255,255,255,0.65)',
    },
    free: {
      background: 'linear-gradient(135deg, #fcfcfc 0%, #f2f2f2 65%, #e6e6e6 100%)',
      text: '#161616',
      border: 'rgba(255,255,255,0.5)',
    },
  },
  'red-gold': {
    id: 'red-gold',
    name: 'Red & Gold',
    description: 'Current Pro/Free styling',
    pro: {
      background: 'linear-gradient(45deg, #e42a42, #cf243a)',
      text: '#ffffff',
      border: 'rgba(228, 42, 66, 0.3)',
    },
    free: {
      background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
      text: '#000000',
      border: 'rgba(251, 191, 36, 0.3)',
    },
  },
  'purple-blue': {
    id: 'purple-blue',
    name: 'Purple & Blue',
    description: 'Modern gradient pairing',
    pro: {
      background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
      text: '#ffffff',
      border: 'rgba(139, 92, 246, 0.3)',
    },
    free: {
      background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
      text: '#ffffff',
      border: 'rgba(59, 130, 246, 0.3)',
    },
  },
  'gold-green': {
    id: 'gold-green',
    name: 'Gold & Green',
    description: 'Owner original theme',
    pro: {
      background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
      text: '#000000',
      border: 'rgba(251, 191, 36, 0.35)',
    },
    free: {
      background: 'linear-gradient(45deg, #10b981, #059669)',
      text: '#ffffff',
      border: 'rgba(16, 185, 129, 0.35)',
    },
  },
  'orange-yellow': {
    id: 'orange-yellow',
    name: 'Orange & Yellow',
    description: 'Warm energy pairing',
    pro: {
      background: 'linear-gradient(45deg, #f97316, #ea580c)',
      text: '#ffffff',
      border: 'rgba(249, 115, 22, 0.3)',
    },
    free: {
      background: 'linear-gradient(45deg, #eab308, #ca8a04)',
      text: '#000000',
      border: 'rgba(234, 179, 8, 0.3)',
    },
  },
};
