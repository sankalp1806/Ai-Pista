import { NextRequest } from 'next/server';
import { ENHANCEMENT_SYSTEM_PROMPT } from '@/lib/prompts/enhancers';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Enhancing prompt with GPT-4.1 Nano (fallback: Llama4 Scout):', prompt.substring(0, 100) + '...');

    // Prepare messages for enhancement
    const messages = [
      { role: 'system', content: ENHANCEMENT_SYSTEM_PROMPT },
      { role: 'user', content: `Please enhance this prompt: "${prompt}"` }
    ];

    // Use the same API structure as the existing open-provider route
    const apiKey = process.env.OPEN_PROVIDER_API_KEY || 'EKfz9oU-FsP-Kz4w';

    // Try with primary model (GPT-4.1 Nano) first
    let response;
    try {
      const baseUrl = 'https://text.pollinations.ai/openai';
      const textUrl = `${baseUrl}?token=${encodeURIComponent(apiKey)}`;

      const requestBody = {
        messages,
        model: 'openai',
        stream: false,
        max_tokens: 1000
      };

      response = await fetch(textUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Open-Fiesta/1.0'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Primary model failed');
      }
    } catch {
      // Fallback to Llama4 Scout model
      console.log('Falling back to Llama4 Scout model');
      const baseUrl = 'https://text.pollinations.ai/openai';
      const textUrl = `${baseUrl}?token=${encodeURIComponent(apiKey)}`;

      const requestBody = {
        messages,
        model: 'llamascout',
        stream: false,
        max_tokens: 1000
      };

      response = await fetch(textUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Open-Fiesta/1.0'
        },
        body: JSON.stringify(requestBody)
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('API Error:', response.status, response.statusText, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('API Response:', responseText.substring(0, 200) + '...');
    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      // If not JSON, treat as plain text response
      data = { text: responseText };
    }

    if (data.error) {
      throw new Error(data.error);
    }

    // Extract the enhanced prompt from the response using the same logic as open-provider
    let enhancedPrompt = '';

    if (typeof data === 'string') {
      enhancedPrompt = data;
    } else if (data && typeof data.text === 'string') {
      enhancedPrompt = data.text;
    } else if (data && typeof data.content === 'string') {
      enhancedPrompt = data.content;
    } else if (data && Array.isArray(data.choices)) {
      const choices = data.choices;
      const all = choices
        .map((c: { message?: { content?: string } }) => (typeof c?.message?.content === 'string' ? c.message.content : ''))
        .filter(Boolean);
      enhancedPrompt = all.join('\n\n') || '';
    }

    if (!enhancedPrompt || enhancedPrompt.trim() === '') {
      throw new Error('No enhanced prompt received');
    }

    return new Response(JSON.stringify({ 
      enhancedPrompt: enhancedPrompt.trim() 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Prompt enhancement error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to enhance prompt. Please try again.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
