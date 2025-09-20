'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '../ui/skeleton';
import type { AnalyzeAndCompareResponsesOutput } from '@/ai/flows/automated-quality-check';
import { Badge } from '../ui/badge';

interface QualityCheckDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  result: AnalyzeAndCompareResponsesOutput | null;
  isLoading: boolean;
}

export function QualityCheckDialog({
  isOpen,
  setIsOpen,
  result,
  isLoading,
}: QualityCheckDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>AI Quality Analysis</DialogTitle>
          <DialogDescription>
            An AI-powered analysis of the responses to highlight unique outputs and key differences.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
          {isLoading ? (
            <LoadingState />
          ) : result ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overall Analysis</h3>
                <p className="text-sm text-muted-foreground">{result.overallAnalysis}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Model Breakdown</h3>
                <Accordion type="single" collapsible className="w-full">
                  {result.modelComparisons.map((comparison, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>{comparison.modelName}</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-1">Unique Outputs</h4>
                          <p className="text-sm text-muted-foreground">{comparison.uniqueOutputs}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Key Differences</h4>
                          <p className="text-sm text-muted-foreground">{comparison.keyDifferences}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Redundant Content</h4>
                          <p className="text-sm text-muted-foreground">{comparison.redundantContent}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ) : (
             <div className="text-center py-8">
                <p className="text-muted-foreground">Analysis could not be generated. Please try again.</p>
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5 mt-2" />
      </div>
      <div>
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
