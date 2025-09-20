"use client";

import { useTheme } from '@/lib/themeContext';
import { BACKGROUND_STYLES } from '@/lib/themes';
import type { SharedChatData } from '@/lib/sharing/types';
import ChatRenderer from './ChatRenderer';

interface SharedChatPageProps {
  chatData: SharedChatData;
}

export default function SharedChatPage({ chatData }: SharedChatPageProps) {
  const { theme } = useTheme();
  const backgroundClass = BACKGROUND_STYLES[theme.background].className;

  // Generate page title for better SEO and accessibility
  const pageTitle = chatData.title ? `Shared Chat: ${chatData.title}` : 'Shared Conversation';
  
  return (
    <div className={`min-h-screen w-full ${backgroundClass} relative text-white`}>
      {/* Set page title for screen readers and browser tab */}
      <title>{pageTitle}</title>
      
      <div className="absolute inset-0 z-0 pointer-events-none opacity-95" />
      
      <div className="relative z-10 px-3 lg:px-4 py-4 lg:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Screen reader announcement */}
          <div className="sr-only" aria-live="polite" role="status">
            Shared conversation loaded. {chatData.messages?.length || 0} messages available.
            {chatData.truncated && ` This is a truncated view showing the last 20 messages.`}
          </div>
          
          <ChatRenderer 
            messages={chatData.messages}
            title={chatData.title}
            createdAt={chatData.createdAt}
            readOnly={true}
            truncated={chatData.truncated}
            originalUserMessageCount={chatData.originalUserMessageCount}
            projectContext={chatData.projectContext}
          />
        </div>
      </div>
    </div>
  );
}