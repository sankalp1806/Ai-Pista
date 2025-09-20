import { useLocalStorage } from '@/lib/useLocalStorage';
import { MODEL_CATALOG } from '@/lib/models';
import type { AiModel } from '@/lib/types';

export type CustomModel = AiModel & { custom: true };

const STORAGE_KEY = 'ai-fiesta:custom-models';

export function useCustomModels() {
  const [models, setModels] = useLocalStorage<CustomModel[]>(STORAGE_KEY, []);
  return [models, setModels] as const;
}

export function mergeModels(customs: CustomModel[]): AiModel[] {
  return [...MODEL_CATALOG, ...customs];
}

export function makeCustomModel(label: string, slug: string): CustomModel {
  const cleanedLabel = label.trim();
  const cleanedSlug = slug.trim();
  // Use the model slug as a stable id to avoid collisions
  const id = cleanedSlug

  // Determine provider based on the slug format
  // If it contains a slash, it's OpenRouter; otherwise, it's Ollama
  const provider = cleanedSlug.includes('/') ? 'openrouter' : 'ollama'

  return {
    id,
    label: cleanedLabel || cleanedSlug,
    provider,
    model: cleanedSlug,
    custom: true,
  };
}
