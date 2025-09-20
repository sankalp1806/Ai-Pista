"use client";

import { useTheme } from '@/lib/themeContext';
import { BACKGROUND_STYLES } from '@/lib/themes';
import { Loader2 } from 'lucide-react';

export default function SharedChatLoading() {
  const { theme } = useTheme();
  const backgroundClass = BACKGROUND_STYLES[theme.background].className;

  return (
    <div className={`min-h-screen w-full ${backgroundClass} relative text-white`}>
      <div className="absolute inset-0 z-0 pointer-events-none opacity-95" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 size={32} className="animate-spin text-white/70 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Loading Shared Chat</h2>
            <p className="text-white/70">Decoding conversation data...</p>
          </div>
        </div>
      </div>
    </div>
  );
}