import { jest } from '@jest/globals';
import { injectPWAStyles, pwaClasses, PWA_CSS_VARIABLES, PWA_BASE_STYLES } from '@/lib/pwa-styles';

// Mock document
const mockAppendChild = jest.fn();
const mockGetElementById = jest.fn();
const mockCreateElement = jest.fn(() => ({
  id: '',
  textContent: '',
}));

Object.defineProperty(document, 'head', {
  value: {
    appendChild: mockAppendChild,
  },
  writable: true,
});

Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true,
});

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

describe('PWA Styles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('injectPWAStyles', () => {
    it('should inject PWA styles into document head', () => {
      mockGetElementById.mockReturnValue(null);
      
      const mockStyleElement = {
        id: '',
        textContent: '',
      };
      mockCreateElement.mockReturnValue(mockStyleElement);

      injectPWAStyles();

      expect(mockCreateElement).toHaveBeenCalledWith('style');
      expect(mockStyleElement.id).toBe('pwa-styles');
      expect(mockStyleElement.textContent).toBe(PWA_CSS_VARIABLES + PWA_BASE_STYLES);
      expect(mockAppendChild).toHaveBeenCalledWith(mockStyleElement);
    });

    it('should not inject styles if they already exist', () => {
      const existingStyle = { id: 'pwa-styles' };
      mockGetElementById.mockReturnValue(existingStyle);

      injectPWAStyles();

      expect(mockCreateElement).not.toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
    });

    it('should handle server-side rendering gracefully', () => {
      // Mock document as undefined (SSR environment)
      const originalDocument = global.document;
      (global as any).document = undefined;

      expect(() => {
        injectPWAStyles();
      }).not.toThrow();

      // Restore document
      (global as any).document = originalDocument;
    });
  });

  describe('PWA_CSS_VARIABLES', () => {
    it('should contain safe area inset variables', () => {
      expect(PWA_CSS_VARIABLES).toContain('--pwa-safe-area-inset-top');
      expect(PWA_CSS_VARIABLES).toContain('--pwa-safe-area-inset-bottom');
      expect(PWA_CSS_VARIABLES).toContain('--pwa-safe-area-inset-left');
      expect(PWA_CSS_VARIABLES).toContain('--pwa-safe-area-inset-right');
    });

    it('should contain viewport variables', () => {
      expect(PWA_CSS_VARIABLES).toContain('--pwa-viewport-height');
      expect(PWA_CSS_VARIABLES).toContain('--pwa-viewport-width');
    });

    it('should support dynamic viewport units', () => {
      expect(PWA_CSS_VARIABLES).toContain('100dvh');
      expect(PWA_CSS_VARIABLES).toContain('100dvw');
    });
  });

  describe('PWA_BASE_STYLES', () => {
    it('should contain standalone mode styles', () => {
      expect(PWA_BASE_STYLES).toContain('.pwa-standalone');
      expect(PWA_BASE_STYLES).toContain('overscroll-behavior: none');
    });

    it('should contain display mode styles', () => {
      expect(PWA_BASE_STYLES).toContain('.pwa-display-standalone');
      expect(PWA_BASE_STYLES).toContain('.pwa-display-fullscreen');
      expect(PWA_BASE_STYLES).toContain('.pwa-display-minimal-ui');
      expect(PWA_BASE_STYLES).toContain('.pwa-display-browser');
    });

    it('should contain orientation styles', () => {
      expect(PWA_BASE_STYLES).toContain('.pwa-orientation-portrait');
      expect(PWA_BASE_STYLES).toContain('.pwa-orientation-landscape');
    });

    it('should contain app shell styles', () => {
      expect(PWA_BASE_STYLES).toContain('.pwa-app-shell');
      expect(PWA_BASE_STYLES).toContain('.pwa-app-shell-header');
      expect(PWA_BASE_STYLES).toContain('.pwa-app-shell-main');
      expect(PWA_BASE_STYLES).toContain('.pwa-app-shell-footer');
    });

    it('should contain animation keyframes', () => {
      expect(PWA_BASE_STYLES).toContain('@keyframes pwa-slide-up');
      expect(PWA_BASE_STYLES).toContain('@keyframes pwa-slide-down');
      expect(PWA_BASE_STYLES).toContain('@keyframes pwa-fade-in');
      expect(PWA_BASE_STYLES).toContain('@keyframes pwa-scale-in');
    });

    it('should contain safe area utilities', () => {
      expect(PWA_BASE_STYLES).toContain('.pwa-safe-top');
      expect(PWA_BASE_STYLES).toContain('.pwa-safe-bottom');
      expect(PWA_BASE_STYLES).toContain('.pwa-safe-left');
      expect(PWA_BASE_STYLES).toContain('.pwa-safe-right');
      expect(PWA_BASE_STYLES).toContain('.pwa-safe-x');
      expect(PWA_BASE_STYLES).toContain('.pwa-safe-y');
      expect(PWA_BASE_STYLES).toContain('.pwa-safe-all');
    });

    it('should contain viewport utilities', () => {
      expect(PWA_BASE_STYLES).toContain('.pwa-h-screen');
      expect(PWA_BASE_STYLES).toContain('.pwa-min-h-screen');
      expect(PWA_BASE_STYLES).toContain('.pwa-max-h-screen');
      expect(PWA_BASE_STYLES).toContain('.pwa-w-screen');
    });

    it('should contain touch optimizations', () => {
      expect(PWA_BASE_STYLES).toContain('.pwa-touch-manipulation');
      expect(PWA_BASE_STYLES).toContain('.pwa-no-select');
      expect(PWA_BASE_STYLES).toContain('.pwa-no-tap-highlight');
    });

    it('should contain performance optimizations', () => {
      expect(PWA_BASE_STYLES).toContain('.pwa-will-change-transform');
      expect(PWA_BASE_STYLES).toContain('.pwa-will-change-opacity');
      expect(PWA_BASE_STYLES).toContain('.pwa-gpu-accelerated');
    });
  });

  describe('pwaClasses', () => {
    it('should export all PWA class names', () => {
      expect(pwaClasses.standalone).toBe('pwa-standalone');
      expect(pwaClasses.appShell).toBe('pwa-app-shell');
      expect(pwaClasses.launchScreen).toBe('pwa-launch-screen');
      expect(pwaClasses.installPrompt).toBe('pwa-install-prompt');
      expect(pwaClasses.installBanner).toBe('pwa-install-banner');
    });

    it('should export safe area class names', () => {
      expect(pwaClasses.safeTop).toBe('pwa-safe-top');
      expect(pwaClasses.safeBottom).toBe('pwa-safe-bottom');
      expect(pwaClasses.safeLeft).toBe('pwa-safe-left');
      expect(pwaClasses.safeRight).toBe('pwa-safe-right');
      expect(pwaClasses.safeX).toBe('pwa-safe-x');
      expect(pwaClasses.safeY).toBe('pwa-safe-y');
      expect(pwaClasses.safeAll).toBe('pwa-safe-all');
    });

    it('should export viewport class names', () => {
      expect(pwaClasses.hScreen).toBe('pwa-h-screen');
      expect(pwaClasses.minHScreen).toBe('pwa-min-h-screen');
      expect(pwaClasses.maxHScreen).toBe('pwa-max-h-screen');
      expect(pwaClasses.wScreen).toBe('pwa-w-screen');
    });

    it('should export animation class names', () => {
      expect(pwaClasses.animateSlideUp).toBe('pwa-animate-slide-up');
      expect(pwaClasses.animateSlideDown).toBe('pwa-animate-slide-down');
      expect(pwaClasses.animateFadeIn).toBe('pwa-animate-fade-in');
      expect(pwaClasses.animateScaleIn).toBe('pwa-animate-scale-in');
    });

    it('should export touch optimization class names', () => {
      expect(pwaClasses.touchManipulation).toBe('pwa-touch-manipulation');
      expect(pwaClasses.noSelect).toBe('pwa-no-select');
      expect(pwaClasses.noTapHighlight).toBe('pwa-no-tap-highlight');
    });

    it('should export performance optimization class names', () => {
      expect(pwaClasses.willChangeTransform).toBe('pwa-will-change-transform');
      expect(pwaClasses.willChangeOpacity).toBe('pwa-will-change-opacity');
      expect(pwaClasses.gpuAccelerated).toBe('pwa-gpu-accelerated');
    });
  });

  describe('CSS content validation', () => {
    it('should have valid CSS syntax in variables', () => {
      // Basic validation - should not contain syntax errors
      expect(PWA_CSS_VARIABLES).not.toContain(';;');
      expect(PWA_CSS_VARIABLES).toMatch(/:root\s*{/);
      expect(PWA_CSS_VARIABLES).toContain('}');
    });

    it('should have valid CSS syntax in base styles', () => {
      // Basic validation - should not contain syntax errors
      expect(PWA_BASE_STYLES).not.toContain(';;');
      expect(PWA_BASE_STYLES).toMatch(/\.[a-zA-Z-]+\s*{/);
      expect(PWA_BASE_STYLES).toContain('}');
    });

    it('should use CSS custom properties correctly', () => {
      expect(PWA_CSS_VARIABLES).toMatch(/--[a-zA-Z-]+:/);
      expect(PWA_BASE_STYLES).toMatch(/var\(--[a-zA-Z-]+\)/);
    });

    it('should use proper CSS selectors', () => {
      expect(PWA_BASE_STYLES).toMatch(/\.[a-zA-Z-]+/); // Class selectors
      expect(PWA_BASE_STYLES).toMatch(/@keyframes [a-zA-Z-]+/); // Keyframe selectors
      // Note: @supports is in CSS_VARIABLES, not BASE_STYLES
      expect(PWA_CSS_VARIABLES).toMatch(/@supports/); // Feature queries
    });
  });
});