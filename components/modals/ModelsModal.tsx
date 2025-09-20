'use client';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { X, Star, StarOff, Search, Eye, Brain, MessageSquare, Mic, Image as ImageIcon, Heart } from 'lucide-react';
import type { AiModel } from '@/lib/types';
import { MODEL_CATALOG } from '@/lib/models';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { mergeModels } from '@/lib/customModels';
import type { CustomModel } from '@/lib/customModels';
import { useTheme } from '@/lib/themeContext';
import { cn } from '@/lib/utils';

export type ModelsModalProps = {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  selectedModels: AiModel[];
  customModels: CustomModel[];
  onToggle: (id: string) => void;
};

export default function ModelsModal({
  open,
  onClose,
  selectedIds,
  selectedModels,
  customModels,
  onToggle,
}: ModelsModalProps) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>('ai-fiesta:favorite-models', [
    'unstable-gpt-5-chat',
    'unstable-claude-sonnet-4',
    'gemini-2.5-pro',
    'unstable-grok-4',
    'open-evil',
  ]);

  // Lock background scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [open]);

  if (!open) return null;

  const showImageLimitToast = () => {
    toast.info('Only one image generation model can be active at a time.', {
      className: 'glass-toast',
      progressClassName: 'glass-toast-progress',
      position: 'top-right',
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };
  const showAudioLimitToast = () => {
    toast.info('Only one audio model can be active at a time.', {
      className: 'glass-toast',
      progressClassName: 'glass-toast-progress',
      position: 'top-right',
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const handleToggle = (m: AiModel) => {
    const alreadySelected = selectedIds.includes(m.id);
    // Enforce only one selected per generation category: image and audio
    if (!alreadySelected && (m.category === 'image' || m.category === 'audio')) {
      const hasOtherSameCategory = selectedModels.some(
        (x) => x.category === m.category && x.id !== m.id,
      );
      if (hasOtherSameCategory) {
        if (m.category === 'image') showImageLimitToast();
        else showAudioLimitToast();
        return;
      }
    }
    onToggle(m.id);
  };

  // Enhanced categorization with thinking models
  const isThinkingModel = (m: AiModel) => {
    const id = m.id.toLowerCase();
    const model = m.model.toLowerCase();
    const label = m.label.toLowerCase();
    return model.includes('thinking') || model.includes('o3') || model.includes('o4') || 
           label.includes('thinking') || id.includes('thinking');
  };

  const isVisionModel = (m: AiModel) => {
    const label = m.label.toLowerCase();
    return label.includes('vision') || label.includes('flash') || label.includes('imagen');
  };

  const buckets: Record<string, AiModel[]> = {
    Favorites: [],
    'Thinking Models': [],
    'Vision Models': [],
    'Text Models': [],
    'Image Generation': [],
    'Audio Models': [],
    Others: [],
  };
  const seen = new Set<string>();
  const isFree = (m: AiModel) => {
    // Only Open Provider models are truly free
    return m.provider === 'open-provider' && m.free;
  };
  const isUnc = (m: AiModel) =>
    /uncensored/i.test(m.label) ||
    /venice/i.test(m.model) ||
    m.model === 'evil' ||
    m.model === 'unity';
  const isFav = (m: AiModel) => favoriteIds.includes(m.id);

  // Brand classifier for text models
  const getBrand = (
    m: AiModel,
  ): 'OpenAI' | 'Google' | 'Anthropic' | 'Grok' | 'Open Source Models' => {
    const id = m.id.toLowerCase();
    const model = m.model.toLowerCase();
    const label = m.label.toLowerCase();
    // OpenAI family: gpt-*, o3*, o4*, any explicit openai
    if (
      model.startsWith('gpt-') ||
      model.startsWith('o3') ||
      model.startsWith('o4') ||
      model.includes('openai') ||
      /gpt\b/.test(label)
    )
      return 'OpenAI';
    // Google family: gemini*, gemma*
    if (model.includes('gemini') || model.includes('gemma') || id.includes('gemini'))
      return 'Google';
    // Anthropic family: claude*
    if (model.includes('claude') || id.includes('claude')) return 'Anthropic';
    // Grok family
    if (model.includes('grok') || id.includes('grok')) return 'Grok';
    // Everything else
    return 'Open Source Models';
  };

  // External SVG icons for brand headings (theme-aware)
  const BRAND_ICONS: Record<string, { darkUrl: string; lightUrl: string; alt: string }> = {
    OpenAI: { 
      darkUrl: 'https://cdn.simpleicons.org/openai/ffffff', 
      lightUrl: 'https://cdn.simpleicons.org/openai/000000',
      alt: 'OpenAI / ChatGPT' 
    },
    Google: { 
      darkUrl: 'https://cdn.simpleicons.org/googlegemini/ffffff', 
      lightUrl: 'https://cdn.simpleicons.org/googlegemini/000000',
      alt: 'Google Gemini' 
    },
    Anthropic: { 
      darkUrl: 'https://cdn.simpleicons.org/anthropic/ffffff', 
      lightUrl: 'https://cdn.simpleicons.org/anthropic/000000',
      alt: 'Anthropic / Claude' 
    },
    Grok: { 
      darkUrl: 'https://cdn.simpleicons.org/xai/ffffff', 
      lightUrl: 'https://cdn.simpleicons.org/xai/000000',
      alt: 'xAI Grok' 
    },
  };

  const toggleFavorite = (modelId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId],
    );
  };
  // Display name overrides for providers
  const providerLabel = (p: string) => (p === 'unstable' ? 'Quran.lat' : p.replace('-', ' '));
  const pick = (m: AiModel) => {
    if (isFav(m)) return 'Favorites';
    if (isThinkingModel(m)) return 'Thinking Models';
    if (isVisionModel(m)) return 'Vision Models';
    if (m.category === 'image') return 'Image Generation';
    if (m.category === 'audio') return 'Audio Models';
    if (m.category === 'text' || m.provider === 'open-provider') return 'Text Models';
    return 'Others';
  };

  // Filter models by search query
  const filteredModels = MODEL_CATALOG.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.label.toLowerCase().includes(query) ||
      m.model.toLowerCase().includes(query) ||
      m.provider.toLowerCase().includes(query) ||
      providerLabel(m.provider).toLowerCase().includes(query)
    );
  });

  filteredModels.forEach((m) => {
    const key = pick(m as AiModel);
    if (!seen.has(m.id)) {
      buckets[key].push(m as AiModel);
      seen.add(m.id);
    }
  });

  const getCategoryIcon = (title: string) => {
    switch (title) {
      case 'Thinking Models': return <Brain className="h-4 w-4" />;
      case 'Vision Models': return <Eye className="h-4 w-4" />;
      case 'Text Models': return <MessageSquare className="h-4 w-4" />;
      case 'Image Generation': return <ImageIcon className="h-4 w-4" />;
      case 'Audio Models': return <Mic className="h-4 w-4" />;
      case 'Favorites': return <Star className="h-4 w-4" />;
      default: return null;
    }
  };

  const Section = ({
    title,
    models,
    showBadges = true,
    iconUrl,
    iconAlt,
  }: {
    title: string;
    models: AiModel[];
    showBadges?: boolean;
    iconUrl?: string;
    iconAlt?: string;
  }) => (
    <div className="space-y-3">
      <div className={cn(
        "text-base font-semibold flex items-center gap-3 pb-2 border-b",
        isDark ? "text-white border-zinc-700/50" : "text-gray-800 border-gray-300/50"
      )}>
        <div className={cn(
          "p-2 rounded-lg border",
          isDark ? "bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700/50" : "bg-gradient-to-br from-white/80 to-gray-50/80 border-gray-300/50"
        )}>
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={iconAlt || title}
              className={cn(
                "h-5 w-5 object-contain",
                isDark ? "opacity-90" : "opacity-80"
              )}
              data-ignore-errors="true"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={cn(
              isDark ? "text-zinc-300" : "text-gray-600"
            )}>
              {getCategoryIcon(title)}
            </div>
          )}
        </div>
        <span className={cn(
          "text-lg",
          isDark ? "text-white" : "text-gray-800"
        )}>{title}</span>
        <span className={cn(
          "text-sm ml-auto px-2 py-0.5 rounded-full",
          isDark ? "text-zinc-400 bg-zinc-800/50" : "text-gray-600 bg-gray-200/80"
        )}>
          {models.length}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {models.map((m) => {
          const free = isFree(m);
          const selected = selectedIds.includes(m.id);
          const disabled = !selected && selectedModels.length >= 5;
          const isThinking = isThinkingModel(m);
          const isVision = isVisionModel(m);
          
          return (
            <div
              key={m.id}
              onClick={() => !disabled && handleToggle(m)}
              className={cn(
                "relative group cursor-pointer rounded-2xl border backdrop-blur-sm transition-all duration-300 overflow-hidden",
                disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl',
                selected
                  ? isDark 
                    ? 'border-red-400/50 bg-gradient-to-br from-red-950/40 via-zinc-900/90 to-black/70 shadow-2xl shadow-red-500/20 ring-1 ring-red-500/20'
                    : 'border-red-400/60 bg-gradient-to-br from-red-50/80 via-white/90 to-red-50/60 shadow-2xl shadow-red-500/10 ring-1 ring-red-400/30'
                  : isDark
                    ? 'border-zinc-700/60 bg-gradient-to-br from-zinc-800/50 via-zinc-900/70 to-black/50 hover:border-zinc-600/70 hover:from-zinc-800/70 hover:via-zinc-900/90 hover:to-black/70 hover:ring-1 hover:ring-zinc-500/20'
                    : 'border-gray-300/60 bg-gradient-to-br from-white/80 via-gray-50/70 to-white/50 hover:border-gray-400/70 hover:from-white/90 hover:via-gray-50/90 hover:to-white/70 hover:ring-1 hover:ring-gray-400/20'
              )}
            >
              {/* Enhanced gradient overlays */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t pointer-events-none",
                isDark ? "from-black/30 via-black/5 to-transparent" : "from-gray-100/30 via-gray-50/5 to-transparent"
              )} />
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br pointer-events-none",
                isDark ? "from-white/[0.02] via-transparent to-black/10" : "from-white/20 via-transparent to-gray-100/10"
              )} />
              
              {/* Selection glow effect */}
              {selected && (
                <>
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br pointer-events-none",
                    isDark ? "from-red-500/15 via-red-500/5 to-red-500/10" : "from-red-400/10 via-red-300/3 to-red-400/8"
                  )} />
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t pointer-events-none",
                    isDark ? "from-red-900/20 via-transparent to-transparent" : "from-red-100/15 via-transparent to-transparent"
                  )} />
                </>
              )}
              
              {/* Model card content */}
              <div className="relative p-4 flex flex-col h-full min-h-[120px]">
                {/* Header with badges */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-2">
                    {m.good && (
                      <motion.span 
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-lg",
                          isDark
                            ? "bg-gradient-to-r from-yellow-500/25 to-amber-500/25 text-yellow-200 border-yellow-500/30 shadow-yellow-500/10"
                            : "bg-gradient-to-r from-yellow-400/80 to-amber-400/80 text-yellow-900 border-yellow-600/40 shadow-yellow-400/20"
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Star size={12} className={cn(isDark ? "text-yellow-400" : "text-yellow-700")} fill="currentColor" />
                        Pro
                      </motion.span>
                    )}
                    {free && (
                      <motion.span 
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-lg",
                          isDark
                            ? "bg-gradient-to-r from-green-500/25 to-emerald-500/25 text-green-200 border-green-500/30 shadow-green-500/10"
                            : "bg-gradient-to-r from-green-400/80 to-emerald-400/80 text-green-900 border-green-600/40 shadow-green-400/20"
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        Free
                      </motion.span>
                    )}
                    {isThinking && (
                      <motion.span 
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-lg",
                          isDark
                            ? "bg-gradient-to-r from-purple-500/25 to-violet-500/25 text-purple-200 border-purple-500/30 shadow-purple-500/10"
                            : "bg-gradient-to-r from-purple-400/80 to-violet-400/80 text-purple-900 border-purple-600/40 shadow-purple-400/20"
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Brain size={12} className={cn(isDark ? "text-purple-400" : "text-purple-700")} />
                        Thinking
                      </motion.span>
                    )}
                    {isVision && (
                      <motion.span 
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-lg",
                          isDark
                            ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-cyan-200 border-cyan-500/30 shadow-cyan-500/10"
                            : "bg-gradient-to-r from-cyan-400/80 to-teal-400/80 text-cyan-900 border-cyan-600/40 shadow-cyan-400/20"
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Eye size={12} className={cn(isDark ? "text-cyan-400" : "text-cyan-700")} />
                        Vision
                      </motion.span>
                    )}
                    {isUnc(m) && (
                      <motion.span 
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-lg",
                          isDark
                            ? "bg-gradient-to-r from-red-500/25 to-rose-500/25 text-red-200 border-red-500/30 shadow-red-500/10"
                            : "bg-gradient-to-r from-red-400/80 to-rose-400/80 text-red-900 border-red-600/40 shadow-red-400/20"
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className={cn(
                          "w-2.5 h-2.5 rounded-full animate-pulse",
                          isDark ? "bg-red-400" : "bg-red-700"
                        )} />
                        Uncensored
                      </motion.span>
                    )}
                    {m.category === 'image' && (
                      <motion.span 
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-lg",
                          isDark
                            ? "bg-gradient-to-r from-pink-500/25 to-rose-500/25 text-pink-200 border-pink-500/30 shadow-pink-500/10"
                            : "bg-gradient-to-r from-pink-400/80 to-rose-400/80 text-pink-900 border-pink-600/40 shadow-pink-400/20"
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        <ImageIcon size={12} className={cn(isDark ? "text-pink-400" : "text-pink-700")} />
                        Image
                      </motion.span>
                    )}
                    {m.category === 'audio' && (
                      <motion.span 
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-lg",
                          isDark
                            ? "bg-gradient-to-r from-orange-500/25 to-red-500/25 text-orange-200 border-orange-500/30 shadow-orange-500/10"
                            : "bg-gradient-to-r from-orange-400/80 to-red-400/80 text-orange-900 border-orange-600/40 shadow-orange-400/20"
                        )}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Mic size={12} className={cn(isDark ? "text-orange-400" : "text-orange-700")} />
                        Audio
                      </motion.span>
                    )}
                    {/* Special NEW badge styled like Pro/Free, different color */}
                    {Array.isArray(m.tags) && m.tags.includes('new') && (
                      <motion.span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-lg",
                          isDark
                            ? "bg-gradient-to-r from-sky-500/25 to-cyan-500/25 text-sky-200 border-sky-500/30 shadow-sky-500/10"
                            : "bg-gradient-to-r from-sky-400/80 to-cyan-400/80 text-sky-900 border-sky-600/40 shadow-sky-400/20"
                        )}
                        whileHover={{ scale: 1.05 }}
                        title="New"
                      >
                        New
                      </motion.span>
                    )}
                    {Array.isArray(m.tags) && m.tags.filter((t) => t !== 'new').length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {m.tags.filter((tag) => tag !== 'new').map((tag) => (
                          <span
                            key={`${m.id}-tag-${tag}`}
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
                              isDark ? "bg-white/5 border-white/10 text-white/80" : "bg-black/5 border-black/10 text-gray-700/90"
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(m.id);
                    }}
                    className={cn(
                      "p-1.5 rounded-lg transition-all duration-200",
                      isFav(m)
                        ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20'
                        : isDark
                          ? 'text-zinc-400 hover:text-zinc-300 hover:bg-white/10 border border-transparent hover:border-white/10'
                          : 'text-gray-500 hover:text-gray-400 hover:bg-gray-200/50 border border-transparent hover:border-gray-300/50'
                    )}
                  >
                    {isFav(m) ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                  </button>
                </div>
                
                {/* Model name */}
                <h4 className={cn(
                  "font-semibold text-[15px] mb-1.5 line-clamp-2 leading-tight",
                  isDark ? "text-white" : "text-gray-800"
                )}>
                  {m.label}
                </h4>
                
                {/* Provider */}
                <p className={cn(
                  "text-[12px] mb-3 capitalize font-medium",
                  isDark ? "text-zinc-400" : "text-gray-600"
                )}>
                  {providerLabel(m.provider)}
                </p>
                
                {/* Enhanced selection indicator */}
                <div className="mt-auto">
                  <div className={cn(
                    "w-full h-1 rounded-full transition-all duration-300",
                    selected 
                      ? 'bg-gradient-to-r from-red-600 via-red-400 to-red-600 shadow-lg shadow-red-500/40' 
                      : isDark
                        ? 'bg-gradient-to-r from-zinc-700/80 via-zinc-600/60 to-zinc-700/80'
                        : 'bg-gradient-to-r from-gray-300/80 via-gray-400/60 to-gray-300/80'
                  )} />
                  {selected && (
                    <div className={cn(
                      "text-xs font-semibold mt-1.5 text-center tracking-wide",
                      isDark ? "text-red-300" : "text-red-600"
                    )}>
                      ✓ SELECTED
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );

  const order: Array<keyof typeof buckets> = [
    'Favorites',
    'Thinking Models',
    'Vision Models', 
    'Text Models',
    'Image Generation',
    'Audio Models',
    'Others',
  ];
  // Build sections; for Text Models, group into branded subsections
  const builtInSections = order
    .filter((k) => buckets[k].length > 0)
    .flatMap((k) => {
      if (k !== 'Text Models') return <Section key={k} title={k} models={buckets[k]} />;
      const textModels = buckets[k].filter(
        (m) => m.category === 'text' || m.provider === 'open-provider',
      );
      const grouped: Record<string, AiModel[]> = {
        OpenAI: [],
        Google: [],
        Anthropic: [],
        Grok: [],
        'Open Source Models': [],
      };
      textModels.forEach((m) => {
        grouped[getBrand(m)].push(m);
      });
      const brandOrder = ['OpenAI', 'Google', 'Anthropic', 'Grok', 'Open Source Models'] as const;
      return brandOrder
        .filter((name) => grouped[name].length > 0)
        .map((name) => (
          <Section
            key={name}
            title={name}
            models={grouped[name]}
            iconUrl={isDark ? (BRAND_ICONS[name]?.darkUrl ?? '/brand.svg') : (BRAND_ICONS[name]?.lightUrl ?? '/brand.svg')}
            iconAlt={BRAND_ICONS[name]?.alt ?? 'Open Fiesta'}
          />
        ));
    });

  const customSection = (
    <Section key="Custom models" title="Custom models" models={customModels} showBadges={false} />
  );

  // Use merged models for tab counts
  const allModels = mergeModels(customModels);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={cn(
        "absolute inset-0 backdrop-blur-sm",
        isDark ? "bg-black/70" : "bg-white/70"
      )} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full sm:w-full max-w-none sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-3 sm:mx-auto rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6 lg:p-6 shadow-2xl h-[90vh] sm:max-h-[90vh] overflow-hidden flex flex-col min-h-0",
          isDark ? "border-white/10 bg-zinc-900/90" : "border-gray-300/50 bg-white/95"
        )}
      >
        <div className={cn(
          "px-4 sm:-mx-6 md:-mx-7 lg:-mx-8 sm:px-6 md:px-7 lg:px-8 pt-1 pb-2 mb-2 flex items-center justify-between backdrop-blur border-b",
          isDark ? "bg-zinc-900/95 border-white/10" : "bg-white/95 border-gray-300/50"
        )}>
          <h3 className={cn(
            "text-base md:text-lg lg:text-xl font-semibold tracking-wide",
            isDark ? "text-white" : "text-gray-800"
          )}>
            Select up to 5 models
          </h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className={cn(
              "h-8 w-8 md:h-8 md:w-8 inline-flex items-center justify-center rounded-md transition-colors",
              isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-200/80 hover:bg-gray-300/80 text-gray-700"
            )}
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "text-sm",
            isDark ? "text-zinc-300" : "text-gray-600"
          )}>
            Selected: <span className={cn(
              "font-medium",
              isDark ? "text-white" : "text-gray-800"
            )}>{selectedModels.length}/5</span>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <Search className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
              isDark ? "text-zinc-400" : "text-gray-500"
            )} />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:outline-none w-56 transition-colors",
                isDark 
                  ? "bg-black/30 border-white/20 text-white placeholder-zinc-400 focus:border-red-500/50 focus:bg-black/40 focus:ring-2 focus:ring-red-500/30 shadow-lg"
                  : "bg-gray-100/80 border-gray-300/50 text-gray-800 placeholder-gray-500 focus:border-gray-400/70 focus:bg-gray-200/80"
              )}
            />
          </div>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1 scroll-touch safe-inset">
          {customSection}
          {builtInSections}
        </div>
      </div>
    </div>
  );
}
