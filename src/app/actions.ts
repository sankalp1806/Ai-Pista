'use server';

import { analyzeAndCompareResponses, AnalyzeAndCompareResponsesInput } from '@/ai/flows/automated-quality-check';

// This is a map of model IDs to dummy responses. In a real application,
// you would make API calls to OpenRouter or other model providers.
const dummyResponses: Record<string, string[]> = {
  'openai/gpt-4o': [
    "To build a high-performance team, focus on establishing clear goals and roles. This ensures everyone is aligned and understands their responsibilities. Fostering open communication and psychological safety is also crucial, as it encourages team members to share ideas and feedback without fear of negative repercussions. Finally, recognizing and celebrating achievements boosts morale and reinforces positive behaviors.",
    "First, you need a shared vision. Then, it's all about trust and respect. Make sure you have the right people in the right seats. Regular feedback is key."
  ],
  'anthropic/claude-3-sonnet-20240229': [
    "A high-performance team thrives on a foundation of trust and mutual respect. It's essential to define a compelling and shared purpose that motivates everyone. Encourage autonomy and ownership of tasks, while also promoting a collaborative environment where team members support each other. Continuous learning and adaptation are also vital for long-term success.",
    "Trust is paramount. A shared goal is also very important. Without these two, you can't have a high-performance team. Also, hire good people."
  ],
  'google/gemini-1.5-pro-latest': [
    "Creating a high-performance team involves several key ingredients. You must start with a clear and ambitious vision that the entire team can rally behind. Secondly, role clarity is non-negotiable; each member must know what is expected of them. Thirdly, a culture of open feedback, where constructive criticism is welcomed, is vital for growth. Lastly, empower your team with the resources and authority they need to excel.",
    "Vision, roles, feedback, empowerment. These are the four pillars of a high-performance team. Get them right, and you're golden."
  ],
  'groq/llama3-70b-8192': [
    "The recipe for a high-performance team includes: 1) A unified vision and clear objectives. 2) Complementary skill sets and well-defined roles. 3) A culture of accountability and high standards. 4) Open lines of communication and a willingness to engage in constructive conflict. 5) Strong leadership that provides support and removes obstacles.",
    "It boils down to vision, skills, accountability, communication, and leadership. Simple as that."
  ],
  'perplexity/llama-3-sonar-large-32k-online': [
    "Building a team that performs at a high level requires a strategic approach. Start by selecting members not just for their skills, but also for their fit with the team's culture. Establish a clear, shared purpose and set of goals. Promote an environment of psychological safety where innovation and risk-taking are encouraged. Finally, implement systems for regular feedback and performance measurement.",
    "Team composition is key. After that, it's about having a purpose, a safe environment to work in, and a way to track progress. It's not rocket science."
  ],
};

// This function simulates fetching responses from multiple AI models.
// In a real application, you would replace this with actual API calls to OpenRouter.
export async function getAIResponses(
  prompt: string,
  modelIds: string[]
): Promise<Record<string, string>> {
  console.log(`Getting responses for prompt: "${prompt}" from models: ${modelIds.join(', ')}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const responses: Record<string, string> = {};
  for (const modelId of modelIds) {
    const possibleResponses = dummyResponses[modelId] || ["Sorry, I don't have a response for that."];
    // Pick a random response to simulate variability
    responses[modelId] = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
  }

  return responses;
}

export async function runQualityCheck(input: AnalyzeAndCompareResponsesInput) {
    try {
        const result = await analyzeAndCompareResponses(input);
        return result;
    } catch (error) {
        console.error('Error running quality check:', error);
        return {
            error: 'Failed to analyze responses. Please try again later.'
        };
    }
}
