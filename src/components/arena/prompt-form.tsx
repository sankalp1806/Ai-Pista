'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const [prompt, setPrompt] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt);
    setPrompt('');
  };

  return (
    <div className="relative">
      <Textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your message here... (Enter to send, Shift+Enter for new line)"
        className="w-full pr-20 resize-none"
        rows={1}
        disabled={isLoading}
        aria-label="Prompt input for AI models"
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
         <p className="text-xs text-muted-foreground flex items-center gap-1">
          <CornerDownLeft size={14}/> Send
        </p>
        <Button
          type="submit"
          size="icon"
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          aria-label="Send prompt"
        >
          <Send className={cn('h-4 w-4', isLoading && 'animate-pulse')} />
        </Button>
      </div>
    </div>
  );
}
