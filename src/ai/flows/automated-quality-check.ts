'use server';

/**
 * @fileOverview A flow for automatically analyzing and comparing AI model responses to highlight key disparities
 * and filter out repetitive or redundant content.
 *
 * - analyzeAndCompareResponses - A function that takes an array of AI responses and returns an analysis
 *   highlighting unique outputs and key differences.
 * - AnalyzeAndCompareResponsesInput - The input type for the analyzeAndCompareResponses function.
 * - AnalyzeAndCompareResponsesOutput - The return type for the analyzeAndCompareResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAndCompareResponsesInputSchema = z.array(
  z.object({
    modelName: z.string().describe('The name of the AI model.'),
    response: z.string().describe('The response from the AI model.'),
  })
).describe('An array of AI model responses to analyze and compare.');

export type AnalyzeAndCompareResponsesInput = z.infer<
  typeof AnalyzeAndCompareResponsesInputSchema
>;

const AnalyzeAndCompareResponsesOutputSchema = z.object({
  overallAnalysis: z
    .string()
    .describe('An overall analysis of the AI model responses.'),
  modelComparisons: z.array(
    z.object({
      modelName: z.string().describe('The name of the AI model.'),
      uniqueOutputs: z
        .string()
        .describe('The unique outputs from the AI model.'),
      keyDifferences: z
        .string()
        .describe('Key differences compared to other models.'),
      redundantContent: z.string().describe('Redundant content identified in this model.'),
    })
  ).describe('Detailed comparisons for each AI model response.'),
});

export type AnalyzeAndCompareResponsesOutput = z.infer<
  typeof AnalyzeAndCompareResponsesOutputSchema
>;

export async function analyzeAndCompareResponses(
  input: AnalyzeAndCompareResponsesInput
): Promise<AnalyzeAndCompareResponsesOutput> {
  return analyzeAndCompareResponsesFlow(input);
}

const analyzeResponsesPrompt = ai.definePrompt({
  name: 'analyzeResponsesPrompt',
  input: {
    schema: AnalyzeAndCompareResponsesInputSchema,
  },
  output: {
    schema: AnalyzeAndCompareResponsesOutputSchema,
  },
  prompt: `You are an AI expert tasked with analyzing and comparing responses from various AI models.

  Your goal is to identify key disparities, filter out repetitive or redundant content, and highlight the unique outputs from each model.

  Analyze the following AI model responses:

  {{#each this}}
  Model: {{this.modelName}}
  Response: {{this.response}}
  {{/each}}

  Provide an overall analysis and detailed comparisons for each AI model response.
  Identify redundant content from each model and key differences.
`,
});

const analyzeAndCompareResponsesFlow = ai.defineFlow(
  {
    name: 'analyzeAndCompareResponsesFlow',
    inputSchema: AnalyzeAndCompareResponsesInputSchema,
    outputSchema: AnalyzeAndCompareResponsesOutputSchema,
  },
  async input => {
    const {output} = await analyzeResponsesPrompt(input);
    return output!;
  }
);
