'use client';
import { useState } from 'react';
import { Volume2 } from 'lucide-react';

export type VoiceOption = {
  id: string;
  name: string;
  description: string;
  gender: string;
};

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice', gender: 'Neutral' },
  { id: 'echo', name: 'Echo', description: 'Clear, expressive voice', gender: 'Male' },
  { id: 'fable', name: 'Fable', description: 'Warm, engaging voice', gender: 'Female' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice', gender: 'Male' },
  { id: 'nova', name: 'Nova', description: 'Bright, energetic voice', gender: 'Female' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle voice', gender: 'Female' },
];

type Props = {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  className?: string;
};

export default function VoiceSelector({ selectedVoice, onVoiceChange, className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedVoiceOption = VOICE_OPTIONS.find((v) => v.id === selectedVoice) || VOICE_OPTIONS[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded-lg border border-black/20 dark:border-white/20 text-sm transition-colors"
      >
        <Volume2 size={16} />
        <span>{selectedVoiceOption.name}</span>
        <span className="text-xs opacity-60">({selectedVoiceOption.gender})</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-black/10 dark:border-white/10">
              <h3 className="text-sm font-medium text-black dark:text-white">Select Voice</h3>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {VOICE_OPTIONS.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => {
                    onVoiceChange(voice.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                    voice.id === selectedVoice ? 'bg-black/15 dark:bg-white/15' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-black dark:text-white">{voice.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {voice.description}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">{voice.gender}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
