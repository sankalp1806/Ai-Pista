/**
 * PWA-specific CSS utilities and styles
 */

export const PWA_CSS_VARIABLES = `
  :root {
    --pwa-safe-area-inset-top: env(safe-area-inset-top, 0px);
    --pwa-safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
    --pwa-safe-area-inset-left: env(safe-area-inset-left, 0px);
    --pwa-safe-area-inset-right: env(safe-area-inset-right, 0px);
    
    --pwa-viewport-height: 100vh;
    --pwa-viewport-width: 100vw;
  }
  
  @supports (height: 100dvh) {
    :root {
      --pwa-viewport-height: 100dvh;
      --pwa-viewport-width: 100dvw;
    }
  }
`;

export const PWA_BASE_STYLES = `
  /* PWA Standalone Mode Styles */
  .pwa-standalone {
    /* Prevent overscroll bounce */
    overscroll-behavior: none;
    
    /* Handle safe areas */
    padding-top: var(--pwa-safe-area-inset-top);
    padding-bottom: var(--pwa-safe-area-inset-bottom);
    padding-left: var(--pwa-safe-area-inset-left);
    padding-right: var(--pwa-safe-area-inset-right);
  }
  
  /* Display mode specific styles */
  .pwa-display-standalone {
    /* Full app experience */
  }
  
  .pwa-display-fullscreen {
    /* Immersive experience */
  }
  
  .pwa-display-minimal-ui {
    /* Minimal browser UI */
  }
  
  .pwa-display-browser {
    /* Standard browser experience */
  }
  
  /* Orientation specific styles */
  .pwa-orientation-portrait {
    /* Portrait optimizations */
  }
  
  .pwa-orientation-landscape {
    /* Landscape optimizations */
  }
  
  /* Device specific styles */
  .pwa-has-notch {
    /* Devices with notch/dynamic island */
  }
  
  /* PWA App Shell */
  .pwa-app-shell {
    min-height: var(--pwa-viewport-height);
    display: flex;
    flex-direction: column;
  }
  
  .pwa-app-shell-header {
    flex-shrink: 0;
  }
  
  .pwa-app-shell-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .pwa-app-shell-footer {
    flex-shrink: 0;
  }
  
  /* PWA Launch Screen */
  .pwa-launch-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* PWA Install Prompt */
  .pwa-install-prompt {
    position: fixed;
    z-index: 1000;
  }
  
  .pwa-install-banner {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 1000;
  }
  
  /* PWA Animations */
  @keyframes pwa-slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes pwa-slide-down {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes pwa-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes pwa-scale-in {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  /* PWA Utility Classes */
  .pwa-animate-slide-up {
    animation: pwa-slide-up 0.3s ease-out;
  }
  
  .pwa-animate-slide-down {
    animation: pwa-slide-down 0.3s ease-out;
  }
  
  .pwa-animate-fade-in {
    animation: pwa-fade-in 0.3s ease-out;
  }
  
  .pwa-animate-scale-in {
    animation: pwa-scale-in 0.3s ease-out;
  }
  
  /* PWA Safe Area Utilities */
  .pwa-safe-top {
    padding-top: var(--pwa-safe-area-inset-top);
  }
  
  .pwa-safe-bottom {
    padding-bottom: var(--pwa-safe-area-inset-bottom);
  }
  
  .pwa-safe-left {
    padding-left: var(--pwa-safe-area-inset-left);
  }
  
  .pwa-safe-right {
    padding-right: var(--pwa-safe-area-inset-right);
  }
  
  .pwa-safe-x {
    padding-left: var(--pwa-safe-area-inset-left);
    padding-right: var(--pwa-safe-area-inset-right);
  }
  
  .pwa-safe-y {
    padding-top: var(--pwa-safe-area-inset-top);
    padding-bottom: var(--pwa-safe-area-inset-bottom);
  }
  
  .pwa-safe-all {
    padding-top: var(--pwa-safe-area-inset-top);
    padding-bottom: var(--pwa-safe-area-inset-bottom);
    padding-left: var(--pwa-safe-area-inset-left);
    padding-right: var(--pwa-safe-area-inset-right);
  }
  
  /* PWA Viewport Utilities */
  .pwa-h-screen {
    height: var(--pwa-viewport-height);
  }
  
  .pwa-min-h-screen {
    min-height: var(--pwa-viewport-height);
  }
  
  .pwa-max-h-screen {
    max-height: var(--pwa-viewport-height);
  }
  
  .pwa-w-screen {
    width: var(--pwa-viewport-width);
  }
  
  /* PWA Touch Optimizations */
  .pwa-touch-manipulation {
    touch-action: manipulation;
  }
  
  .pwa-no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  .pwa-no-tap-highlight {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* PWA Performance Optimizations */
  .pwa-will-change-transform {
    will-change: transform;
  }
  
  .pwa-will-change-opacity {
    will-change: opacity;
  }
  
  .pwa-gpu-accelerated {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }
`;

/**
 * Inject PWA styles into the document
 */
export const injectPWAStyles = (): void => {
  if (typeof document === 'undefined') return;
  
  const existingStyle = document.getElementById('pwa-styles');
  if (existingStyle) return;
  
  const style = document.createElement('style');
  style.id = 'pwa-styles';
  style.textContent = PWA_CSS_VARIABLES + PWA_BASE_STYLES;
  document.head.appendChild(style);
};

/**
 * PWA CSS class utilities
 */
export const pwaClasses = {
  standalone: 'pwa-standalone',
  appShell: 'pwa-app-shell',
  appShellHeader: 'pwa-app-shell-header',
  appShellMain: 'pwa-app-shell-main',
  appShellFooter: 'pwa-app-shell-footer',
  launchScreen: 'pwa-launch-screen',
  installPrompt: 'pwa-install-prompt',
  installBanner: 'pwa-install-banner',
  safeTop: 'pwa-safe-top',
  safeBottom: 'pwa-safe-bottom',
  safeLeft: 'pwa-safe-left',
  safeRight: 'pwa-safe-right',
  safeX: 'pwa-safe-x',
  safeY: 'pwa-safe-y',
  safeAll: 'pwa-safe-all',
  hScreen: 'pwa-h-screen',
  minHScreen: 'pwa-min-h-screen',
  maxHScreen: 'pwa-max-h-screen',
  wScreen: 'pwa-w-screen',
  animateSlideUp: 'pwa-animate-slide-up',
  animateSlideDown: 'pwa-animate-slide-down',
  animateFadeIn: 'pwa-animate-fade-in',
  animateScaleIn: 'pwa-animate-scale-in',
  touchManipulation: 'pwa-touch-manipulation',
  noSelect: 'pwa-no-select',
  noTapHighlight: 'pwa-no-tap-highlight',
  willChangeTransform: 'pwa-will-change-transform',
  willChangeOpacity: 'pwa-will-change-opacity',
  gpuAccelerated: 'pwa-gpu-accelerated',
} as const;

export default {
  PWA_CSS_VARIABLES,
  PWA_BASE_STYLES,
  injectPWAStyles,
  pwaClasses,
};