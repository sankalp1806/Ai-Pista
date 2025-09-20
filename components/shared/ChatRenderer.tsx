"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import type { ChatMessage } from '@/lib/types';
import MarkdownLite from '@/components/chat/MarkdownLite';
import { User, Bot, ArrowLeft, ExternalLink, Info } from 'lucide-react';

interface ChatRendererProps {
  messages: ChatMessage[];
  title?: string;
  createdAt?: number;
  readOnly?: boolean;
  truncated?: boolean;
  originalUserMessageCount?: number;
  projectContext?: {
    name: string;
  };
}

export default function ChatRenderer({
  messages,
  title,
  createdAt,
  readOnly = false,
  truncated = false,
  originalUserMessageCount,
  projectContext
}: ChatRendererProps) {
  // Group messages by conversation turns (user message followed by assistant responses)
  const conversationTurns = useMemo(() => {
    const turns: { user: ChatMessage; assistants: ChatMessage[] }[] = [];
    let currentUser: ChatMessage | null = null;

    for (const message of messages) {
      if (message.role === 'user') {
        currentUser = message;
        turns.push({ user: message, assistants: [] });
      } else if (message.role === 'assistant' && currentUser) {
        const lastTurn = turns[turns.length - 1];
        if (lastTurn) {
          lastTurn.assistants.push(message);
        }
      }
    }

    return turns;
  }, [messages]);

  const formatTimestamp = (ts?: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-white/50">
        <p>No messages in this conversation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="chat-renderer">
      {/* Skip to main content link for screen readers */}
      {readOnly && (
        <a
          href="#chat-messages"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        >
          Skip to conversation
        </a>
      )}

      {/* Header Section - only show in read-only mode when title/createdAt provided */}
      {readOnly && (title || createdAt) && (
        <header className="mb-6 space-y-4">
          {/* Navigation */}
          <nav className="flex items-center justify-between" aria-label="Page navigation">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent rounded"
              aria-label="Return to Open Fiesta main application"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Back to Open Fiesta</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent rounded"
              aria-label="Open this conversation in the main application"
            >
              <span>Open in App</span>
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
          </nav>

          {/* Chat Info */}
          {(title || createdAt) && (
            <div className="space-y-2">
              {title && (
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {title}
                </h1>
              )}

              {createdAt && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <time dateTime={new Date(createdAt).toISOString()}>
                    Created {formatDate(createdAt)}
                  </time>

                  {projectContext && (
                    <span className="flex items-center gap-1">
                      <span aria-hidden="true">•</span>
                      <span>Project: {projectContext.name}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Truncation Notice */}
              {truncated && (
                <div
                  className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                  role="alert"
                  aria-live="polite"
                >
                  <Info size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium">Conversation Truncated</p>
                    <p className="text-yellow-200/80">
                      This shared link contains the last {conversationTurns.length} messages from a conversation
                      {originalUserMessageCount && ` that originally had ${originalUserMessageCount} messages`}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </header>
      )}

      {/* Messages */}
      <section id="chat-messages" className="space-y-6" role={readOnly ? "main" : undefined} aria-label="Conversation messages">
        {conversationTurns.map((turn, turnIndex) => (
          <article key={turnIndex} className="space-y-4" aria-labelledby={`turn-${turnIndex}`}>
            {/* User Message */}
            <div className="flex gap-3" role="group" aria-labelledby={`user-message-${turnIndex}`}>
              <div
                className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center"
                role="img"
                aria-label="User avatar"
              >
                <User size={16} className="text-blue-400" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span id={`user-message-${turnIndex}`} className="font-medium text-white">You</span>
                  {turn.user.ts && (
                    <time
                      className="text-xs text-white/50"
                      dateTime={new Date(turn.user.ts).toISOString()}
                      title={new Date(turn.user.ts).toLocaleString()}
                    >
                      {formatTimestamp(turn.user.ts)}
                    </time>
                  )}
                </div>
                <div className="prose prose-invert max-w-none" role="region" aria-label={`User message ${turnIndex + 1} content`}>
                  <MarkdownLite text={turn.user.content} />
                </div>
              </div>
            </div>

            {/* Assistant Messages */}
            {turn.assistants.length > 0 && (
              <div className="space-y-4">
                {turn.assistants.length > 1 ? (
                  // Grid layout for multiple models (like original chat)
                  <div
                    className="grid gap-3 items-stretch"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(turn.assistants.length, 3)}, minmax(280px, 1fr))`
                    }}
                  >
                    {turn.assistants.map((assistant, assistantIndex) => (
                      <div key={assistantIndex} className="h-full">
                        <div className="group relative rounded-lg p-3 h-full min-h-[140px] flex overflow-hidden ring-1 transition-shadow bg-gradient-to-b from-black/40 to-black/20 ring-white/10 backdrop-blur-[2px] hover:ring-white/20">
                          <div className="text-sm leading-relaxed w-full space-y-2 max-h-[40vh] md:max-h-[400px] overflow-y-auto">
                            {/* Model header */}
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                              <div
                                className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center"
                                role="img"
                                aria-label="Assistant avatar"
                              >
                                <Bot size={12} className="text-green-400" aria-hidden="true" />
                              </div>
                              <span className="font-medium text-white text-sm">
                                {assistant.modelId || 'Assistant'}
                              </span>
                              {assistant.ts && (
                                <time
                                  className="text-xs text-white/50 ml-auto"
                                  dateTime={new Date(assistant.ts).toISOString()}
                                  title={new Date(assistant.ts).toLocaleString()}
                                >
                                  {formatTimestamp(assistant.ts)}
                                </time>
                              )}
                            </div>

                            {/* Content */}
                            <div className="prose prose-invert max-w-none prose-sm" role="region" aria-label={`${assistant.modelId || 'Assistant'} response`}>
                              <MarkdownLite text={assistant.content} />
                            </div>

                            {/* Error indicator if message has error code */}
                            {assistant.code && assistant.code >= 400 && (
                              <div className="mt-2 text-xs text-red-400" role="alert" aria-live="polite">
                                Error {assistant.code}: Failed to get response
                              </div>
                            )}

                            {/* Provider info */}
                            {assistant.provider && (
                              <div className="text-xs text-white/40 mt-2 pt-2 border-t border-white/5">
                                via {assistant.provider}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Single column layout for single model
                  turn.assistants.map((assistant, assistantIndex) => (
                    <div key={assistantIndex} className="flex gap-3" role="group" aria-labelledby={`assistant-message-${turnIndex}-${assistantIndex}`}>
                      <div
                        className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center"
                        role="img"
                        aria-label="Assistant avatar"
                      >
                        <Bot size={16} className="text-green-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span id={`assistant-message-${turnIndex}-${assistantIndex}`} className="font-medium text-white">
                            {assistant.modelId || 'Assistant'}
                          </span>
                          {assistant.ts && (
                            <time
                              className="text-xs text-white/50"
                              dateTime={new Date(assistant.ts).toISOString()}
                              title={new Date(assistant.ts).toLocaleString()}
                            >
                              {formatTimestamp(assistant.ts)}
                            </time>
                          )}
                          {assistant.provider && (
                            <span className="text-xs text-white/40 capitalize">
                              via {assistant.provider}
                            </span>
                          )}
                        </div>
                        <div className="prose prose-invert max-w-none" role="region" aria-label={`Assistant message ${turnIndex + 1}-${assistantIndex + 1} content`}>
                          <MarkdownLite text={assistant.content} />
                        </div>

                        {/* Error indicator if message has error code */}
                        {assistant.code && assistant.code >= 400 && (
                          <div className="mt-2 text-xs text-red-400" role="alert" aria-live="polite">
                            Error {assistant.code}: Failed to get response
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </article>
        ))}
      </section>

      {readOnly && (
        <footer className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm">
            This is a read-only view of a shared conversation.
          </p>
        </footer>
      )}
    </div>
  );
}