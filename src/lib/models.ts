import {
  AnthropicIcon,
  GoogleIcon,
  GroqIcon,
  OpenAIIcon,
  PerplexityIcon,
} from '@/components/icons';
import type { StaticImageData } from 'next/image';

export interface Model {
  id: string;
  name: string;
  provider: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const models: Model[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    icon: OpenAIIcon,
  },
  {
    id: 'anthropic/claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    icon: AnthropicIcon,
  },
  {
    id: 'google/gemini-1.5-pro-latest',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    icon: GoogleIcon,
  },
  {
    id: 'groq/llama3-70b-8192',
    name: 'Groq LLaMA 3 70b',
    provider: 'Groq',
    icon: GroqIcon,
  },
  {
    id: 'perplexity/llama-3-sonar-large-32k-online',
    name: 'Perplexity Sonar',
    provider: 'Perplexity',
    icon: PerplexityIcon,
  },
];
