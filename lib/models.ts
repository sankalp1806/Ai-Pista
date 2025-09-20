import { AiModel } from './types';

// Base catalog; user can toggle/select up to 5
export const MODEL_CATALOG: AiModel[] = [
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    good: true,
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
  },
  {
    id: 'deepcoder-14b-preview',
    label: 'DeepCoder 14B Preview',
    provider: 'openrouter',
    model: 'agentica-org/deepcoder-14b-preview:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'deepseek-r1',
    label: 'DeepSeek R1',
    provider: 'openrouter',
    model: 'deepseek/deepseek-r1:free',
    good: true,
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'deepseek-chat-v3-0324-free',
    label: 'DeepSeek Chat v3 0324',
    provider: 'openrouter',
    model: 'deepseek/deepseek-chat-v3-0324:free',
    good: true,
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B Instruct',
    provider: 'openrouter',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    good: true,
    // OpenRouter models require API key (BYOK)
  },
  // Additional OpenRouter models requested
  {
    id: 'mistral-small-24b-instruct-2501',
    label: 'Mistral Small 24B Instruct 2501',
    provider: 'openrouter',
    model: 'mistralai/mistral-small-24b-instruct-2501:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'qwen-2.5-72b-instruct',
    label: 'Qwen 2.5 72B Instruct (free)',
    provider: 'openrouter',
    model: 'qwen/qwen-2.5-72b-instruct:free',
    good: true,
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'moonshot-kimi-k2',
    label: 'Moonshot Kimi K2 (free)',
    provider: 'openrouter',
    model: 'moonshotai/kimi-k2:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'reka-flash-3',
    label: 'Reka Flash 3',
    provider: 'openrouter',
    model: 'reka/reka-flash-3:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'glm-4.5-air',
    label: 'GLM 4.5 Air (free)',
    provider: 'openrouter',
    model: 'z-ai/glm-4.5-air:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'glm-4.5-air-paid',
    label: 'GLM 4.5 Air (paid)',
    provider: 'openrouter',
    model: 'z-ai/glm-4.5-air',
  },
  {
    id: 'hunyuan-a13b-instruct',
    label: 'Tencent Hunyuan A13B Instruct',
    provider: 'openrouter',
    model: 'tencent/hunyuan-a13b-instruct:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'gemma-3n-e2b-it',
    label: 'Google Gemma 3n e2B IT',
    provider: 'openrouter',
    model: 'google/gemma-3n-e2b-it:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'gemma-3-27b-it',
    label: 'Google Gemma 3 27B IT',
    provider: 'openrouter',
    model: 'google/gemma-3-27b-it:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'dolphin3-mistral-24b',
    label: 'Dolphin 3.0 Mistral 24B',
    provider: 'openrouter',
    model: 'cognitivecomputations/dolphin3.0-mistral-24b:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'gemma-2-9b-it',
    label: 'Google Gemma 2 9B IT',
    provider: 'openrouter',
    model: 'google/gemma-2-9b-it:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'shisa-v2-llama33-70b',
    label: 'Shisa v2 Llama 3.3 70B',
    provider: 'openrouter',
    model: 'shisa-ai/shisa-v2-llama3.3-70b:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'deepseek-r1t-chimera',
    label: 'DeepSeek R1T Chimera',
    provider: 'openrouter',
    model: 'tngtech/deepseek-r1t-chimera:free',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'microsoft-mai-ds-r1',
    label: 'Microsoft MAI DS-R1',
    provider: 'openrouter',
    model: 'microsoft/mai-ds-r1:free',
    // OpenRouter models require API key (BYOK)
  },
  // Newly requested models
  {
    id: 'baidu-ernie-4.5-21b-a3b',
    label: 'Baidu ERNIE 4.5 21B A3B',
    provider: 'openrouter',
    model: 'baidu/ernie-4.5-21b-a3b',
  },
  {
    id: 'openai-gpt-oss-20b',
    label: 'OpenAI GPT-OSS 20B',
    provider: 'openrouter',
    model: 'openai/gpt-oss-20b',
    tags: ['health', 'new'],
    category: 'text',
  },
  {
    id: 'openai-gpt-oss-120b',
    label: 'OpenAI GPT-OSS 120B',
    provider: 'openrouter',
    model: 'openai/gpt-oss-120b',
    good: true,
    tags: ['finance', 'tech', 'new'],
    category: 'text',
  },
  {
    id: 'openai-gpt-5-mini',
    label: 'OpenAI GPT-5 Mini',
    provider: 'openrouter',
    model: 'openai/gpt-5-mini',
    good: true,
    tags: ['new', 'finance', 'coding'],
    category: 'text',
  },
  {
    id: 'openai-codex-mini',
    label: 'OpenAI Codex Mini',
    provider: 'openrouter',
    model: 'openai/codex-mini',
    tags: ['new', 'coding'],
    category: 'text',
  },
  {
    id: 'openai-gpt-5-nano',
    label: 'OpenAI GPT-5 Nano',
    provider: 'openrouter',
    model: 'openai/gpt-5-nano',
    good: true,
    tags: ['new', 'multimodal', 'vision'],
    category: 'image',
    // OpenRouter models require API key (BYOK)
  },
  {
    id: 'xai-grok-3-mini',
    label: 'xAI Grok 3 Mini',
    provider: 'openrouter',
    model: 'x-ai/grok-3-mini',
  },
  {
    id: 'xai-grok-beta',
    label: 'xAI Grok Beta',
    provider: 'openrouter',
    model: 'x-ai/grok-beta',
    good: true,
    tags: ['new', 'coding'],
    category: 'text',
  },
  {
    id: 'nousresearch-hermes-4-70b',
    label: 'Nous Hermes 4 70B',
    provider: 'openrouter',
    model: 'nousresearch/hermes-4-70b',
    category: 'text',
  },
  {
    id: 'gemini-2.5-flash-image-preview',
    label: 'Gemini 2.5 Flash Image Preview (free)',
    provider: 'openrouter',
    model: 'google/gemini-2.5-flash-image-preview:free',
    good: true,
    category: 'image',
    // OpenRouter models require API key (BYOK)
  },

  // Open Provider Text Models - Official Models
  {
    id: 'open-deepseek-reasoning',
    label: 'DeepSeek R1 Reasoning',
    provider: 'open-provider',
    model: 'deepseek-reasoning',
    free: true,
    good: true,
    category: 'text',
  },
  {
    id: 'open-gemini',
    label: 'Gemini 2.5 Flash Lite',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    free: true,
    category: 'text',
  },
  {
    id: 'open-gpt-5-nano',
    label: 'GPT-5 Nano',
    provider: 'open-provider',
    model: 'gpt-5-nano',
    free: true,
    good: true,
    category: 'text',
  },
  {
    id: 'open-llama-fast-roblox',
    label: 'Llama 3.2 1B',
    provider: 'open-provider',
    model: 'llama-fast-roblox',
    free: true,
    category: 'text',
  },
  {
    id: 'open-llama-roblox',
    label: 'Llama 3.1 8B Instruct',
    provider: 'open-provider',
    model: 'llama-roblox',
    free: true,
    category: 'text',
  },
  {
    id: 'open-llamascout',
    label: 'Llama 4 Scout 17B',
    provider: 'open-provider',
    model: 'llamascout',
    free: true,
    good: true,
    category: 'text',
  },
  {
    id: 'open-mistral',
    label: 'Mistral Small 3.1 24B',
    provider: 'open-provider',
    model: 'mistral',
    free: true,
    category: 'text',
  },
  {
    id: 'open-mistral-nemo-roblox',
    label: 'Mistral Nemo Instruct 2407',
    provider: 'open-provider',
    model: 'mistral-nemo-roblox',
    free: true,
    category: 'text',
  },
  {
    id: 'open-mistral-roblox',
    label: 'Mistral Small 3.1 24B',
    provider: 'open-provider',
    model: 'mistral-roblox',
    free: true,
    category: 'text',
  },
  {
    id: 'open-nova-fast',
    label: 'Amazon Nova Micro',
    provider: 'open-provider',
    model: 'nova-fast',
    free: true,
    category: 'text',
  },
  {
    id: 'open-openai',
    label: 'GPT-4.1 Nano',
    provider: 'open-provider',
    model: 'openai',
    free: true,
    good: true,
    category: 'text',
  },
  {
    id: 'open-openai-fast',
    label: 'GPT-4.1 Nano Fast',
    provider: 'open-provider',
    model: 'openai-fast',
    free: true,
    category: 'text',
  },
  {
    id: 'open-openai-large',
    label: 'GPT-4.1 Large',
    provider: 'open-provider',
    model: 'openai-large',
    free: true,
    good: true,
    category: 'text',
  },

  {
    id: 'open-openai-roblox',
    label: 'GPT-4.1 Nano Roblox',
    provider: 'open-provider',
    model: 'openai-roblox',
    free: true,
    category: 'text',
  },
  {
    id: 'open-qwen-coder',
    label: 'Qwen 2.5 Coder 32B',
    provider: 'open-provider',
    model: 'qwen-coder',
    free: true,
    category: 'text',
  },
  {
    id: 'open-roblox-rp',
    label: 'Roblox RP Multi-Model',
    provider: 'open-provider',
    model: 'roblox-rp',
    free: true,
    category: 'text',
  },

  // Open Provider Community Models
  {
    id: 'open-bidara',
    label: 'BIDARA NASA Biomimetic Designer',
    provider: 'open-provider',
    model: 'bidara',
    free: true,
    category: 'text',
  },
  {
    id: 'open-elixposearch',
    label: 'Elixpo Search',
    provider: 'open-provider',
    model: 'elixposearch',
    free: true,
    category: 'text',
  },
  {
    id: 'open-evil',
    label: 'Evil Uncensored',
    provider: 'open-provider',
    model: 'evil',
    free: true,
    category: 'text',
  },
  {
    id: 'open-midijourney',
    label: 'MIDIjourney',
    provider: 'open-provider',
    model: 'midijourney',
    free: true,
    category: 'text',
  },
  {
    id: 'open-mirexa',
    label: 'Mirexa AI Companion',
    provider: 'open-provider',
    model: 'mirexa',
    free: true,
    category: 'text',
  },
  {
    id: 'open-rtist',
    label: 'Rtist',
    provider: 'open-provider',
    model: 'rtist',
    free: true,
    category: 'text',
  },
  {
    id: 'open-sur',
    label: 'Sur AI Assistant',
    provider: 'open-provider',
    model: 'sur',
    free: true,
    category: 'text',
  },
  {
    id: 'open-unity',
    label: 'Unity Unrestricted Agent Uncensored',
    provider: 'open-provider',
    model: 'unity',
    free: true,
    category: 'text',
  },

  // Open Provider Audio Models
  {
    id: 'open-openai-audio',
    label: 'GPT-4o Mini Audio Voice',
    provider: 'open-provider',
    model: 'openai-audio',
    free: true,
    good: true,
    category: 'audio',
  },

  // Open Provider Image Models
  {
    id: 'open-flux',
    label: 'FLUX Image Generator',
    provider: 'open-provider',
    model: 'flux',
    free: true,
    good: true,
    category: 'image',
  },
  {
    id: 'open-kontext',
    label: 'Kontext Image Generator',
    provider: 'open-provider',
    model: 'kontext',
    free: true,
    category: 'image',
  },
  {
    id: 'open-turbo',
    label: 'Turbo Image Generator',
    provider: 'open-provider',
    model: 'turbo',
    free: true,
    category: 'image',
  },

  // Unstable Provider Models - GPT Series
  {
    id: 'unstable-gpt-5-high',
    label: 'GPT-5 High',
    provider: 'unstable',
    model: 'gpt-5-high',
    good: true,
    category: 'text',
  },
  {
    id: 'unstable-gpt-5-chat',
    label: 'GPT-5 Chat',
    provider: 'unstable',
    model: 'gpt-5-chat',
    good: true,
    category: 'text',
  },

  {
    id: 'unstable-gpt-5-mini-high',
    label: 'GPT-5 Mini High',
    provider: 'unstable',
    model: 'gpt-5-mini-high',
    category: 'text',
  },
  {
    id: 'unstable-gpt-5-nano-high',
    label: 'GPT-5 Nano High',
    provider: 'unstable',
    model: 'gpt-5-nano-high',
    category: 'text',
  },
  {
    id: 'unstable-gpt-4o',
    label: 'GPT-4o',
    provider: 'unstable',
    model: 'gpt-4o',
    good: true,
    category: 'text',
  },
  {
    id: 'unstable-gpt-4-1',
    label: 'GPT-4.1',
    provider: 'unstable',
    model: 'gpt-4.1',
    category: 'text',
  },
  {
    id: 'unstable-gpt-4-1-mini',
    label: 'GPT-4.1 Mini',
    provider: 'unstable',
    model: 'gpt-4.1-mini',
    category: 'text',
  },
  {
    id: 'unstable-o3',
    label: 'O3',
    provider: 'unstable',
    model: 'o3',
    good: true,
    category: 'text',
  },
  {
    id: 'unstable-o3-mini',
    label: 'O3 Mini',
    provider: 'unstable',
    model: 'o3-mini',
    category: 'text',
  },

  {
    id: 'unstable-o4-mini',
    label: 'O4 Mini',
    provider: 'unstable',
    model: 'o4-mini',
    category: 'text',
  },

  // Unstable Provider Models - Gemini Series
  {
    id: 'unstable-gemini-2-5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'unstable',
    model: 'gemini-2.5-pro',
    good: true,
    category: 'text',
  },
  {
    id: 'unstable-gemini-2-5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'unstable',
    model: 'gemini-2.5-flash',
    category: 'text',
  },

  // Unstable Provider Models - Claude Series
  {
    id: 'unstable-claude-opus-4-1',
    label: 'Claude Opus 4.1',
    provider: 'unstable',
    model: 'claude-opus-4-1',
    good: true,
    category: 'text',
  },
  {
    id: 'unstable-claude-opus-4-1-thinking',
    label: 'Claude Opus 4.1 Thinking',
    provider: 'unstable',
    model: 'claude-opus-4-1-thinking',
    good: true,
    category: 'text',
  },

  {
    id: 'unstable-claude-opus-4',
    label: 'Claude Opus 4',
    provider: 'unstable',
    model: 'claude-opus-4',
    good: true,
    category: 'text',
  },

  {
    id: 'unstable-claude-sonnet-4',
    label: 'Claude Sonnet 4',
    provider: 'unstable',
    model: 'claude-sonnet-4',
    good: true,
    category: 'text',
  },
  {
    id: 'unstable-claude-sonnet-4-thinking',
    label: 'Claude Sonnet 4 Thinking',
    provider: 'unstable',
    model: 'claude-sonnet-4-thinking',
    good: true,
    category: 'text',
  },

  // Unstable Provider Models - Grok Series
  {
    id: 'unstable-grok-4',
    label: 'Grok 4',
    provider: 'unstable',
    model: 'grok-4',
    good: true,
    category: 'text',
  },

  {
    id: 'unstable-grok-3-mini-high',
    label: 'Grok 3 Mini High',
    provider: 'unstable',
    model: 'grok-3-mini-high',
    category: 'text',
  },

  // Mistral Provider Models - Core Text Models
  {
    id: 'mistral-large-latest',
    label: 'Mistral Large 2.1',
    provider: 'mistral',
    model: 'mistral-large-latest',
    good: true,
    category: 'text',
  },
  {
    id: 'mistral-medium-latest',
    label: 'Mistral Medium 3.1',
    provider: 'mistral',
    model: 'mistral-medium-latest',
    good: true,
    category: 'text',
  },
  {
    id: 'mistral-small-latest',
    label: 'Mistral Small 3.2',
    provider: 'mistral',
    model: 'mistral-small-latest',
    category: 'text',
  },
  {
    id: 'magistral-medium-latest',
    label: 'Magistral Medium 1.1 Reasoning',
    provider: 'mistral',
    model: 'magistral-medium-latest',
    good: true,
    category: 'text',
  },
  {
    id: 'magistral-small-latest',
    label: 'Magistral Small 1.1 Reasoning',
    provider: 'mistral',
    model: 'magistral-small-latest',
    category: 'text',
  },

  // Mistral Provider Models - Coding Specialists
  {
    id: 'codestral-latest',
    label: 'Codestral 2508 Coding',
    provider: 'mistral',
    model: 'codestral-latest',
    good: true,
    category: 'text',
  },
  {
    id: 'devstral-medium-latest',
    label: 'Devstral Medium Enterprise Coding',
    provider: 'mistral',
    model: 'devstral-medium-latest',
    category: 'text',
  },
  {
    id: 'devstral-small-latest',
    label: 'Devstral Small Open Source Coding',
    provider: 'mistral',
    model: 'devstral-small-latest',
    free: true,
    category: 'text',
  },

  // Mistral Provider Models - Multimodal
  {
    id: 'pixtral-large-latest',
    label: 'Pixtral Large Vision',
    provider: 'mistral',
    model: 'pixtral-large-latest',
    good: true,
    category: 'image',
  },
  {
    id: 'pixtral-12b',
    label: 'Pixtral 12B Open Vision',
    provider: 'mistral',
    model: 'pixtral-12b',
    free: true,
    category: 'image',
  },

  // Mistral Provider Models - Edge Models
  {
    id: 'ministral-8b-latest',
    label: 'Ministral 8B Edge',
    provider: 'mistral',
    model: 'ministral-8b-latest',
    category: 'text',
  },
  {
    id: 'ministral-3b-latest',
    label: 'Ministral 3B Efficient Edge',
    provider: 'mistral',
    model: 'ministral-3b-latest',
    category: 'text',
  },

  // Mistral Provider Models - Audio
  {
    id: 'voxtral-small-latest',
    label: 'Voxtral Small Audio Input',
    provider: 'mistral',
    model: 'voxtral-small-latest',
    free: true,
    category: 'audio',
  },
  {
    id: 'voxtral-mini-latest',
    label: 'Voxtral Mini Audio Input',
    provider: 'mistral',
    model: 'voxtral-mini-latest',
    free: true,
    category: 'audio',
  },

  // Mistral Provider Models - Specialized
  {
    id: 'open-mistral-nemo',
    label: 'Mistral Nemo 12B Multilingual',
    provider: 'mistral',
    model: 'open-mistral-nemo',
    free: true,
    category: 'text',
  },
];
