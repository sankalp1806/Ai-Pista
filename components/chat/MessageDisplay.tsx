'use client'

import React from 'react'
import { Edit3 } from 'lucide-react'
import type { ChatMessage } from '@/lib/types'
import MarkdownLite from './MarkdownLite'

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  avatarUrl?: string
  avatarAlt?: string
}

interface MessageDisplayProps {
  message: ChatMessage
  isDark: boolean
  AssistantAvatar?: React.ComponentType<any>
  onEditMessage?: (messageId: string, newContent: string) => void
  onShareMessage?: (message: ChatMessage) => void
}

// Assistant messages now use MarkdownLite for unified audio/image rendering

export default function MessageDisplay({ 
  message, 
  isDark, 
  AssistantAvatar,
  onEditMessage,
  onShareMessage
}: MessageDisplayProps) {
  if (message.role === "assistant") {
    return (
      <div className="flex gap-4 justify-start">
        {AssistantAvatar && <AssistantAvatar url={(message as any).avatarUrl} alt={(message as any).avatarAlt} />}
        <div className={`assistant-message ${isDark ? 'dark' : 'light'}`}>
          <div className="message-content">
            <MarkdownLite text={String(message.content || '')} />
          </div>
          {/* No copy/share buttons as requested */}
        </div>
      </div>
    )
  }

  // User message
  return (
    <div className="flex items-start gap-2 justify-end">
      <div className={`user-message ${isDark ? 'dark' : 'light'}`}>
        <div className="message-content">{message.content}</div>
      </div>
      {/* Small edit icon outside the bubble */}
      <button
        onClick={() => onEditMessage?.('temp-id', message.content)}
        className="mt-1 h-6 w-6 shrink-0 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-orange-500/20 hover:border-orange-300/30 text-zinc-300 hover:text-orange-100 transition-colors"
        title="Edit message"
        aria-label="Edit message"
      >
        <Edit3 size={12} />
      </button>
    </div>
  )
}
