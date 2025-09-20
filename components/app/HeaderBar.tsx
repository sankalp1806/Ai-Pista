'use client';
import Image from 'next/image';
import Link from 'next/link';
import GithubStar from '@/components/app/GithubStar';
import ThemeToggle from '@/components/ThemeToggle';
import CustomModels from '@/components/modals/CustomModels';
import Settings from '@/components/app/Settings';
import { Layers, Home, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/lib/themeContext';
import { cn } from '@/lib/utils';
import SupportDropdown from '../support-dropdown';

type Props = {
  onOpenMenu: () => void;
  title?: string;
  githubOwner: string;
  githubRepo: string;
  className?: string;
  onOpenModelsModal?: () => void;
  showCompareButton?: boolean;
  hideHomeButton?: boolean;
};

export default function HeaderBar({
  onOpenMenu,
  title = 'Open Fiesta',
  githubOwner,
  githubRepo,
  className,
  onOpenModelsModal,
  showCompareButton = false,
  hideHomeButton = false,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <div className={['flex items-center mb-1 gap-2 w-full', className || ''].join(' ')}>
      {/* Left: menu + optional Compare button */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenMenu}
          className={cn(
            "lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-105 active:scale-95",
            isDark
              ? "bg-gradient-to-r from-white/12 to-white/8 border border-white/15 text-white hover:from-white/18 hover:to-white/12 hover:border-white/25"
              : "bg-white/70 border border-white/40 text-gray-700 hover:bg-white/80 hover:border-white/50"
          )}
          aria-label="Open menu"
          title="Menu"
        >
          <MenuIcon size={18} />
        </button>

        {showCompareButton && (
          <Link
            href="/compare"
            className={cn(
              "inline-block ml-1 font-medium overflow-hidden relative px-2.5 py-1.5 rounded-md outline-none duration-300 group text-xs",
              isDark
                ? "bg-red-950 text-red-400 border border-red-400 border-b-2 hover:brightness-150 hover:border-t-2 hover:border-b active:opacity-75"
                : "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 active:opacity-80"
            )}
          >
            {isDark && (
              <span className="bg-red-400 shadow-red-400 absolute -top-[150%] left-0 inline-flex w-48 h-[3px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            )}
            Compare Models
          </Link>
        )}
      </div>

      {/* Center: logo only (hidden on mobile). Scales with heading size */}
      <div className="flex-1 text-center hidden sm:block">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight select-none pointer-events-none inline-flex items-center justify-center">
          <Image
            src={isDark ? "/Web_logo.svg" : "/Web_logo_light.svg"}
            alt="Open Fiesta logo"
            width={100}
            height={100}
            className="h-6 md:h-8 lg:h-10 w-auto"
            priority
          />
        </h1>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2 z-10 ml-auto">
        {!hideHomeButton && (
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-1.5 text-xs h-9 w-9 justify-center rounded-xl shadow transition-all duration-200",
              isDark
                ? "border border-white/15 bg-white/5 hover:bg-white/10 text-white"
                : "border border-white/40 bg-white/70 hover:bg-white/80 text-gray-700"
            )}
            aria-label="Go to home"
            title="Home"
          >
            <Home size={18} />
          </Link>
        )}
        <button
          onClick={() => onOpenModelsModal && onOpenModelsModal()}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs h-9 w-9 justify-center rounded-xl shadow transition-all duration-200",
            isDark
              ? "border border-white/15 bg-white/5 hover:bg-white/10 text-white"
              : "border border-white/40 bg-white/70 hover:bg-white/80 text-gray-700"
          )}
          title="Change models"
          aria-label="Change models"
        >
          <Layers size={14} />
        </button>

        <CustomModels compact />
        <ThemeToggle compact />
        <Settings compact />
        <GithubStar owner={githubOwner} repo={githubRepo} />
        <div >
          <SupportDropdown inline theme={theme.mode === 'dark' ? 'dark' : 'light'} />
        </div>
      </div>
    </div>
  );
}
