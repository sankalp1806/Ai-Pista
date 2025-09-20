'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { models, Model } from '@/lib/models';
import { SlidersHorizontal } from 'lucide-react';

interface ModelSelectorProps {
  selectedModels: Model[];
  onModelSelect: (model: Model) => void;
}

export function ModelSelector({
  selectedModels,
  onModelSelect,
}: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Select Models ({selectedModels.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>Choose AI Models</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {models.map(model => (
          <DropdownMenuCheckboxItem
            key={model.id}
            checked={selectedModels.some(m => m.id === model.id)}
            onSelect={e => e.preventDefault()}
            onClick={() => onModelSelect(model)}
            className="flex items-center gap-2"
          >
            <model.icon className="h-4 w-4" />
            <span>{model.name}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
