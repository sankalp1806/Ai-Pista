export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  modelId?: string; // which model produced this assistant message
  ts?: number;
  // Optional metadata for provider responses
  code?: number; // HTTP-like status from backend (e.g., 503)
  provider?: string; // e.g., 'openrouter', 'gemini'
  usedKeyType?: 'user' | 'shared' | 'none';
  // Optional token usage metadata (when provided by backend)
  tokens?: {
    by?: 'prompt' | 'messages';
    total: number;
    model?: string;
    perMessage?: Array<{
      index: number;
      role: string;
      chars: number;
      tokens: number;
    }>;
  };
};

export type AiModel = {
  id: string; // unique key in UI
  label: string; // display name
  provider: 'gemini' | 'openrouter' | 'open-provider' | 'unstable' | 'mistral' | 'ollama';
  model: string; // provider-specific model id
  free?: boolean;
  good?: boolean; // highlight as recommended
  category?: 'text' | 'image' | 'audio'; // model capability category
  tags?: string[]; // tags for categorization (e.g., 'finance', 'tech', 'health', 'new')
};

export type ApiKeys = {
  gemini?: string;
  openrouter?: string;
  'open-provider'?: string; // Optional API key for open-provider (currently free)
  'unstable'?: string; // API key for unstable provider (inference.quran.lat)
  'mistral'?: string; // API key for Mistral AI (api.mistral.ai)
  'ollama'?: string; // Base URL for Ollama API
  'ollamaModel'?: string; // Model name for Ollama
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  // When set, this chat belongs to a specific project. If undefined, it's a general chat.
  projectId?: string;
  // Track which page type this thread was created on
  pageType?: 'home' | 'compare';
};

export type Contributor = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: "User" | "Bot";
  site_admin: boolean;
  contributions: number;
};
