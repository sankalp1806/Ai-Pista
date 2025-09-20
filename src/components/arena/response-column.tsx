'use client';

import { Model } from '@/lib/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface ResponseColumnProps {
  model: Model;
  response?: string;
  isLoading: boolean;
  isBest: boolean;
  onSetBest: () => void;
}

export function ResponseColumn({
  model,
  response,
  isLoading,
  isBest,
  onSetBest,
}: ResponseColumnProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    toast({
      title: 'Copied to clipboard!',
      description: `Response from ${model.name} has been copied.`,
    });
  };

  return (
    <Card className={cn('flex flex-col transition-all duration-300', isBest && 'border-accent shadow-lg shadow-accent/20')}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <model.icon className="h-5 w-5" />
          {model.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          {response && (
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} aria-label={`Copy response from ${model.name}`}>
                <Copy className="h-4 w-4" />
            </Button>
          )}
          <Button variant={isBest ? "default" : "ghost"} size="icon" className={cn("h-8 w-8", isBest && 'bg-accent hover:bg-accent/90 text-accent-foreground')} onClick={onSetBest} aria-label={`Mark response from ${model.name} as best`}>
            <Star className={cn('h-4 w-4', isBest && 'fill-current')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {isLoading && !response && (
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        {response && (
          <div className="text-sm text-foreground/90 whitespace-pre-wrap pt-2">
            {response}
          </div>
        )}
         {!isLoading && !response && (
            <div className="text-sm text-muted-foreground pt-4 italic">
                Waiting for prompt...
            </div>
        )}
      </CardContent>
    </Card>
  );
}
