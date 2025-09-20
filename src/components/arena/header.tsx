'use client';

import { Model } from '@/lib/models';
import { ModelSelector } from './model-selector';

interface ArenaHeaderProps {
  selectedModels: Model[];
  onModelSelect: (model: Model) => void;
}

export function ArenaHeader({ selectedModels, onModelSelect }: ArenaHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <h1 className="text-2xl font-bold text-primary">AI Arena</h1>
      <ModelSelector
        selectedModels={selectedModels}
        onModelSelect={onModelSelect}
      />
    </header>
  );
}
