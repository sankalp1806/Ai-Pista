'use client';

import { useState, useTransition } from 'react';
import { models, Model } from '@/lib/models';
import { getAIResponses, runQualityCheck } from '@/app/actions';
import { ArenaHeader } from './header';
import { PromptForm } from './prompt-form';
import { ResponseColumn } from './response-column';
import { Button } from '../ui/button';
import { Sparkles } from 'lucide-react';
import { QualityCheckDialog } from './quality-check-dialog';
import type { AnalyzeAndCompareResponsesOutput } from '@/ai/flows/automated-quality-check';

type Message = {
  prompt: string;
  responses: Record<string, string>;
};

export function AIArenaPage() {
  const [selectedModels, setSelectedModels] = useState<Model[]>([models[0], models[1], models[2]]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bestResponse, setBestResponse] = useState<string | null>(null);

  const [isQualityCheckPending, startQualityCheckTransition] = useTransition();
  const [qualityCheckResult, setQualityCheckResult] = useState<AnalyzeAndCompareResponsesOutput | null>(null);
  const [isQualityCheckOpen, setIsQualityCheckOpen] = useState(false);

  const handleModelSelection = (model: Model) => {
    setSelectedModels(prev =>
      prev.some(m => m.id === model.id)
        ? prev.filter(m => m.id !== model.id)
        : [...prev, model]
    );
  };

  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt || selectedModels.length === 0) return;

    setIsLoading(true);
    setBestResponse(null);

    const newConversationEntry: Message = {
      prompt,
      responses: {},
    };
    setConversation(prev => [...prev, newConversationEntry]);

    const modelIds = selectedModels.map(m => m.id);
    const responses = await getAIResponses(prompt, modelIds);

    setConversation(prev => {
      const updatedConversation = [...prev];
      const lastEntry = updatedConversation[updatedConversation.length - 1];
      if (lastEntry) {
        lastEntry.responses = responses;
      }
      return updatedConversation;
    });

    setIsLoading(false);
  };
  
  const handleRunQualityCheck = () => {
    const lastMessage = conversation[conversation.length - 1];
    if (!lastMessage || Object.keys(lastMessage.responses).length === 0) return;
  
    setIsQualityCheckOpen(true);
    startQualityCheckTransition(async () => {
      const input = Object.entries(lastMessage.responses).map(([modelId, response]) => ({
        modelName: models.find(m => m.id === modelId)?.name || 'Unknown Model',
        response: response,
      }));

      const result = await runQualityCheck(input);
      if (result && !('error' in result)) {
        setQualityCheckResult(result);
      } else {
        // Handle error case, maybe show a toast
        console.error(result?.error);
        setQualityCheckResult(null);
      }
    });
  };

  const latestMessage = conversation[conversation.length - 1];
  const canRunQualityCheck = latestMessage && Object.values(latestMessage.responses).length > 0 && !isLoading;

  return (
    <div className="flex flex-col h-screen bg-background">
      <ArenaHeader
        selectedModels={selectedModels}
        onModelSelect={handleModelSelection}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {selectedModels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-lg">Please select at least one AI model to begin.</p>
          </div>
        ) : (
          <div className={`grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(selectedModels.length, 4)}`}>
            {selectedModels.map(model => (
              <ResponseColumn
                key={model.id}
                model={model}
                response={latestMessage?.responses?.[model.id]}
                isLoading={isLoading}
                isBest={bestResponse === model.id}
                onSetBest={() => setBestResponse(model.id)}
              />
            ))}
          </div>
        )}
      </main>
      
      {canRunQualityCheck && (
         <div className="flex justify-center p-2">
            <Button onClick={handleRunQualityCheck} disabled={isQualityCheckPending}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isQualityCheckPending ? 'Analyzing...' : 'Run Quality Check'}
            </Button>
         </div>
      )}

      <div className="p-4 bg-background border-t">
        <PromptForm onSubmit={handlePromptSubmit} isLoading={isLoading} />
      </div>

      <QualityCheckDialog
        isOpen={isQualityCheckOpen}
        setIsOpen={setIsQualityCheckOpen}
        result={qualityCheckResult}
        isLoading={isQualityCheckPending}
      />
    </div>
  );
}
