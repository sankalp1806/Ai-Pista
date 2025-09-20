'use client';

import { useTheme } from '@/lib/themeContext';
import { cn } from '@/lib/utils';
import { isStandalone } from '@/lib/pwa-config';

interface LaunchScreenProps {
  backgroundClass?: string;
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  dismissed?: boolean;
  isPWA?: boolean;
}

/**
 * A themable, accessible launch screen UI with optional branding and PWA standalone adjustments.
 *
 * Renders a full-screen centered status card with optional logo, title, subtitle, and a subtle
 * progress sheen. Adapts colors for dark/light themes, supports hiding via `dismissed`, and when
 * running as a PWA (or when `isPWA` is true) applies safe-area padding and a `pwa-launch-screen`
 * class for standalone display.
 *
 * @param backgroundClass - Optional additional CSS classes applied to the outer container.
 * @param title - Main heading text shown on the card (defaults to "Ai Pista").
 * @param subtitle - Subheading text shown below the title (defaults to "Warming things up…").
 * @param logoSrc - URL for the brand/logo image; when falsy the logo block is omitted.
 * @param dismissed - When true, reduces opacity and disables pointer events to hide the screen.
 * @param isPWA - If provided, forces PWA standalone mode; otherwise standalone detection is used.
 * @returns A React element representing the launch screen.
 */
export default function LaunchScreen({
  backgroundClass = '',
  title = 'Ai Pista',
  subtitle = 'Warming things up…',
  logoSrc = '/brand.svg',
  dismissed = false,
  isPWA,
}: LaunchScreenProps) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const isStandaloneMode = isPWA ?? isStandalone();
  return (
    <div
      className={cn(
        "min-h-screen w-full relative transition-opacity duration-300 ease-out",
        backgroundClass,
        isDark ? "text-white" : "text-gray-800",
        dismissed ? 'opacity-0 pointer-events-none' : 'opacity-100',
        isStandaloneMode && "pwa-launch-screen"
      )}
      style={{
        paddingTop: isStandaloneMode ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: isStandaloneMode ? 'env(safe-area-inset-bottom)' : undefined,
      }}
    >
      <div
        className={`absolute inset-0 z-0 pointer-events-none opacity-95 transition-opacity duration-300 ease-out ${dismissed ? 'opacity-0' : 'opacity-95'}`}
      />
      <div className="relative z-10 px-3 lg:px-4 py-4 lg:py-6">
        <div className="flex gap-3 lg:gap-4">
          <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div
                role="status"
                aria-live="polite"
                className={cn(
                  "w-full max-w-sm rounded-2xl border backdrop-blur-md shadow-2xl p-7 sm:p-8 text-center relative overflow-hidden transition-opacity duration-300 ease-out",
                  isDark 
                    ? "border-white/10 bg-black/20" 
                    : "border-gray-300/30 bg-white/80",
                  dismissed ? 'opacity-0' : 'opacity-100'
                )}
              >
                {/* Ambient glow */}
                <div
                  className={cn(
                    "pointer-events-none absolute -inset-12 bg-gradient-radial via-transparent to-transparent blur-3xl transition-opacity duration-300 ease-out",
                    isDark ? "from-white/10" : "from-gray-400/15",
                    dismissed ? 'opacity-0' : 'opacity-100'
                  )}
                />

                {/* Card content */}
                <div className="relative">
                  {/* Logo with soft ring */}
                  {logoSrc && (
                    <div
                      className={cn(
                        "mx-auto inline-flex items-center justify-center rounded-2xl ring-1 shadow-md p-2",
                        isDark 
                          ? "ring-white/15 bg-black/30" 
                          : "ring-gray-300/30 bg-gray-100/50"
                      )}
                      style={{ boxShadow: '0 0 36px 2px var(--accent-primary)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoSrc} alt="Brand" className="h-16 w-16 rounded-xl" />
                    </div>
                  )}

                  {/* Title & subtitle */}
                  <h2 className={cn(
                    "mt-3 text-base font-semibold tracking-wide",
                    isDark ? "text-white/95" : "text-gray-800/95"
                  )}>
                    {title}
                  </h2>
                  <p className={cn(
                    "mt-1 text-sm",
                    isDark ? "text-white/70" : "text-gray-600/80"
                  )}>{subtitle}</p>

                  {/* Subtle accent progress with sheen */}
                  <div className={cn(
                    "mt-6 relative h-1.5 w-full overflow-hidden rounded-full",
                    isDark ? "bg-black/30" : "bg-gray-300/40"
                  )}>
                    {/* Base accent line */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                        opacity: 0.55,
                        boxShadow: '0 0 10px 0 var(--accent-primary)',
                      }}
                    />
                    {/* Sheen sweep */}
                    <div
                      className="absolute top-0 left-0 h-full w-1/3 motion-safe:animate-[sheen_1.4s_ease-in-out_infinite]"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
                        filter: 'blur(2px)',
                      }}
                    />
                  </div>

                  {/* Keyframes via inline style tag to avoid global CSS touch */}
                  <style jsx>{`
                    @keyframes sheen {
                      0% {
                        transform: translateX(-120%);
                      }
                      60% {
                        transform: translateX(60%);
                      }
                      100% {
                        transform: translateX(220%);
                      }
                    }
                  `}</style>

                  <span className="sr-only">Loading</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

