'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Paperclip, Send, Loader2, X, Mic, MicOff, Sparkles, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import Image from 'next/image'

interface Props {
  onSubmit?: (text: string) => void
  isDark?: boolean
  // When provided, replaces the Search toggle with a model selector button
  modelSelectorLabel?: string
  onOpenModelSelector?: () => void
  // For edit functionality
  initialValue?: string
  onClear?: () => void
}

const MIN_HEIGHT = 64
const MAX_HEIGHT = 200

export default function HomeAiInput({ onSubmit, isDark = true, modelSelectorLabel, onOpenModelSelector, initialValue, onClear }: Props) {
  const [value, setValue] = useState(initialValue || '')
  const [showSearch, setShowSearch] = useState(true)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Speech recognition
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition()

  useEffect(() => {
    if (transcript) {
      setValue(transcript)
      adjustHeight()
    }
  }, [transcript])

  // Update value when initialValue changes (for edit functionality)
  useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue)
      adjustHeight()
    }
  }, [initialValue])

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Your browser does not support speech recognition.')
      return
    }
    if (!isMicrophoneAvailable) {
      alert('Microphone access is required for speech recognition.')
      return
    }
    resetTranscript()
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' })
  }

  const stopListening = () => {
    SpeechRecognition.stopListening()
  }

  const adjustHeight = (reset?: boolean) => {
    const ta = textareaRef.current
    if (!ta) return
    if (reset) {
      ta.style.height = `${MIN_HEIGHT}px`
      return
    }
    ta.style.height = `${MIN_HEIGHT}px`
    const newH = Math.max(MIN_HEIGHT, Math.min(ta.scrollHeight, MAX_HEIGHT))
    ta.style.height = `${newH}px`
  }

  useEffect(() => {
    adjustHeight(true)
  }, [])

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  const handleRemoveAttachment = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setAttachedFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (!file) return

    // Allowed: images, txt, pdf, doc, docx
    const allowed = [
      /^image\//,
      /^text\/plain$/,
      /^application\/pdf$/,
      /^application\/msword$/,
      /^application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$/,
    ]
    const isAllowed = allowed.some((re) => re.test(file.type))
    if (!isAllowed) {
      setErrorMsg('Unsupported file. Allowed: Images, TXT, PDF, DOC, DOCX.')
      setTimeout(() => setErrorMsg(null), 4000)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setAttachedFile(file)
    if (file.type.startsWith('image/')) {
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(null)
    }
  }

  const handleSend = () => {
    const text = value.trim()
    if (!text) return
    if (listening) setTimeout(() => stopListening(), 100)
    // Debug: verify send triggers and onSubmit exists
    try {
 
      console.log('[HomeAiInput] handleSend invoked with:', text)
    } catch {}
    if (onSubmit) {
      onSubmit(text)
    } else {
      try {
     
        console.warn('[HomeAiInput] onSubmit prop is not provided')
      } catch {}
    }
    // Clear value but keep the height as-is and refocus to preserve layout/feel
    setValue('')
    setAttachedFile(null)
    setImagePreview(null)
    onClear?.() // Call clear callback if provided
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      // Do NOT reset height here so the bar stays expanded visually
      // adjustHeight(true)
    })
  }

  // Prompt Enhancer (calls /api/enhance-prompt)
  const enhancePrompt = async () => {
    const text = value.trim()
    if (!text || isEnhancing) return
    if (listening) setTimeout(() => stopListening(), 100)
    setIsEnhancing(true)
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })
      if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data?.enhancedPrompt) {
        setValue(data.enhancedPrompt)
        adjustHeight()
        requestAnimationFrame(() => textareaRef.current?.focus())
      }
    } catch (e) {
      console.error('Enhance failed', e)
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <motion.div className="w-full py-2" initial={{ y: 0, opacity: 1 }}>
      <div className={cn(
        "relative max-w-4xl rounded-[22px] p-0 w-full mx-auto chat-input-shell bg-transparent",
        isDark ? "border border-black/10 dark:border-white/10" : ""
      )}>
        <div
          className={cn(
            'relative rounded-[22px] overflow-hidden outline-none backdrop-blur-md',
            isDark ? 'bg-black/20 border border-white/10' : 'bg-gradient-to-br from-rose-50/90 to-pink-50/80 shadow-lg border border-rose-200/40'
          )}
        >
          {/* Error banner */}
          {errorMsg && (
            <div className="px-4 py-2 text-sm text-red-200 bg-red-900/40 border-b border-red-700/40">
              {errorMsg}
            </div>
          )}
          {/* Content area: conditional image layout or standard textarea */}
          {imagePreview ? (
            <div className="ai-grow-area" style={{ '--ai-input-max': `${MAX_HEIGHT}px` } as React.CSSProperties}>
              <div className="grid grid-cols-[96px_1fr] gap-3 p-3 pr-4">
                <div className="relative h-[96px] w-[96px] rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-sm">
                  <Image className="object-cover h-full w-full" src={imagePreview} height={240} width={240} alt="attached image" />
                  <button
                    onClick={handleRemoveAttachment}
                    className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-6 w-6 rounded-full bg-black/70 dark:bg-white/70 text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 border border-black/20 dark:border-white/20"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="relative rounded-xl border border-black/10 dark:border-white/10">
                  <Textarea
                    ref={textareaRef}
                    value={value}
                    placeholder=""
                    className={cn(
                      'w-full rounded-xl px-4 py-3 border-none resize-none ring-0 focus:outline-none focus-visible:outline-none leading-[1.5] text-[15px] md:text-base',
                      isDark
                        ? 'bg-transparent text-white placeholder:text-white/70'
                        : 'bg-white text-gray-900 placeholder:text-gray-500',
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    onChange={(e) => {
                      setValue(e.target.value)
                      adjustHeight()
                    }}
                  />
                  {!value && (
                    <div className={cn('absolute left-4 top-3', isDark ? 'text-white/70' : 'text-gray-500')}>
                      {showSearch ? 'Search the web...' : 'Type your message here...'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  adjustHeight()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={showSearch ? 'Search the web...' : 'Type your message here...'}
                className={cn(
                  'w-full rounded-2xl px-5 py-4 border-none resize-none ring-0 focus:outline-none focus-visible:outline-none leading-[1.5] text-[15px] md:text-base',
                  'placeholder:opacity-80 placeholder:text-[15px] md:placeholder:text-base',
                  isDark
                    ? 'bg-transparent text-white placeholder:text-white/70'
                    : 'bg-transparent text-gray-800 placeholder:text-gray-600',
                  `min-h-[${MIN_HEIGHT}px]`
                )}
              />
            </div>
          )}

          {/* Non-image file info */}
          {attachedFile && !imagePreview && (
            <div className="px-4 py-2 bg-transparent flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-black/80 dark:text-white/80" />
                <span className="truncate text-sm text-black/90 dark:text-white/90" title={attachedFile.name}>
                  {attachedFile.name}
                </span>
                <span className="text-xs text-black/60 dark:text-white/60 flex-shrink-0">
                  {Math.max(1, Math.round(attachedFile.size / 1024))} KB
                </span>
              </div>
              <button
                onClick={handleRemoveAttachment}
                className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-black/50 dark:bg-white/50 text-black/90 dark:text-white/90 hover:bg-black/60 dark:hover:bg-white/60 border border-black/10 dark:border-white/10"
                aria-label="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className={cn(
            "h-12 flex items-center justify-between px-3 ai-toolbar-bg",
            isDark ? "bg-inherit" : "bg-gradient-to-r from-rose-100/70 to-pink-100/60 border-t border-rose-200/50"
          )}>
            <div className="flex items-center gap-2">
              {/* Attach */}
              <label
                title="Attach file"
                className={cn(
                  'cursor-pointer relative rounded-full p-1.5 transition-all duration-200',
                  isDark ? 'bg-black/30 dark:bg-white/10' : 'bg-rose-200/40 hover:bg-rose-200/60 border border-rose-300/50',
                  attachedFile
                    ? 'bg-[var(--accent-interactive-primary)]/15 border border-[var(--accent-interactive-primary)] text-[var(--accent-interactive-primary)]'
                    : isDark ? 'text-white/60 hover:text-white' : 'text-rose-700 hover:text-rose-800',
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  aria-label="Attach file"
                />
                <Paperclip className="w-3.5 h-3.5" />
              </label>

              {/* Search toggle OR Model selector */}
              {modelSelectorLabel && onOpenModelSelector ? (
                <button
                  type="button"
                  onClick={onOpenModelSelector}
                  className={cn(
                    'rounded-full transition-all flex items-center gap-2 px-3 py-1.5 h-8',
                    isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-rose-200/40 text-rose-800 hover:bg-rose-200/60 border border-rose-300/50'
                  )}
                  aria-label="Choose model"
                  title="Choose model"
                >
                  <span className="text-xs truncate max-w-[160px]">{modelSelectorLabel}</span>
                  {/* simple chevron using an inline svg to avoid new imports mid-file */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSearch((s) => !s)}
                  className={cn(
                    'rounded-full transition-all flex items-center gap-2 px-3 py-1.5 h-8 search-toggle',
                    showSearch
                      ? 'bg-[var(--accent-interactive-primary)] text-white'
                      : isDark
                        ? 'bg-white/10 text-white/80'
                        : 'bg-rose-200/40 text-rose-700 border border-rose-300/50 hover:bg-rose-200/60'
                  )}
                  data-active={showSearch}
                  aria-pressed={showSearch ? 'true' : 'false'}
                >
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <Globe className={cn('w-3.5 h-3.5', showSearch ? 'text-white' : isDark ? 'text-white/70' : 'text-gray-700')} />
                  </div>
                  <AnimatePresence>
                    {showSearch && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs overflow-hidden whitespace-nowrap search-toggle-label"
                      >
                        Search
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mic (speech recognition) */}
              {browserSupportsSpeechRecognition && (
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  className={cn(
                    'rounded-full p-2 h-8 w-8 transition-all flex items-center justify-center relative',
                    listening
                      ? 'bg-red-500 text-white shadow-red-500/30'
                      : isDark ? 'bg-white/10 text-white/80 hover:bg-white/15' : 'bg-white/70 text-gray-700 hover:bg-white/80 border border-white/40'
                  )}
                  aria-label={listening ? 'Stop recording' : 'Start voice input'}
                  title={listening ? 'Stop recording' : 'Start voice input'}
                >
                  {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              {/* Prompt Enhancer */}
              {value.trim() && (
                <button
                  type="button"
                  onClick={enhancePrompt}
                  disabled={isEnhancing}
                  className={cn(
                    'rounded-full p-2 h-8 w-8 transition-all flex items-center justify-center',
                    isEnhancing
                      ? 'bg-[var(--accent-interactive-primary)]/20 text-[var(--accent-interactive-primary)] cursor-not-allowed'
                      : 'accent-action-fill'
                  )}
                  aria-label={isEnhancing ? 'Enhancing prompt...' : 'Enhance prompt'}
                  title={isEnhancing ? 'Enhancing prompt...' : 'Enhance prompt with AI'}
                >
                  {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </button>
              )}

              {/* Send */}
              <button
                type="button"
                onClick={handleSend}
                className={cn(
                  'rounded-full p-2 h-8 w-8 transition-all flex items-center justify-center',
                  value
                    ? 'bg-[var(--accent-interactive-primary)] text-white hover:bg-[var(--accent-interactive-hover)]'
                    : isDark ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white/50 text-gray-500 cursor-not-allowed border border-white/40',
                )}
                disabled={!value.trim()}
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
