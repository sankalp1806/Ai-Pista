import { NextRequest } from 'next/server';

// Token estimation helper (simplified)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey: apiKeyFromBody, imageDataUrl } = await req.json();

    // Use the provided API key or fallback to environment variable
    const apiKey = apiKeyFromBody || process.env.MISTRAL_API_KEY;
    const usedKeyType = apiKeyFromBody ? 'user' : process.env.MISTRAL_API_KEY ? 'shared' : 'none';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing Mistral API key' }), { status: 400 });
    }

    if (!model) {
      return new Response(JSON.stringify({ error: 'Missing model id' }), { status: 400 });
    }

    // Sanitize and validate messages
    type InMsg = { role?: unknown; content?: unknown };
    type OutMsg = { role: 'user' | 'assistant' | 'system'; content: string };

    const sanitize = (msgs: unknown[]): OutMsg[] => {
      return msgs
        .filter((m): m is InMsg => typeof m === 'object' && m !== null)
        .map((m): OutMsg | null => {
          const role =
            typeof m.role === 'string' && ['user', 'assistant', 'system'].includes(m.role)
              ? (m.role as 'user' | 'assistant' | 'system')
              : 'user';
          const content = typeof m.content === 'string' ? m.content : '';
          return content ? { role, content } : null;
        })
        .filter((m): m is OutMsg => m !== null);
    };

    const sanitizedMessages = sanitize((messages as unknown[]) || []);

    // Keep last 10 messages to avoid overly long histories
    const trimmedMessages =
      sanitizedMessages.length > 10 ? sanitizedMessages.slice(-10) : sanitizedMessages;

    // Ensure we have at least one message
    if (trimmedMessages.length === 0) {
      trimmedMessages.push({ role: 'user', content: 'Hello' });
    }

    // Handle image attachment if provided (for multimodal models like Pixtral)
    const processedMessages = trimmedMessages;
    if (imageDataUrl && trimmedMessages.length > 0) {
      const lastMessage = trimmedMessages[trimmedMessages.length - 1];
      if (lastMessage.role === 'user') {
        // For Pixtral models that support vision
        if (model.includes('pixtral')) {
          // Mistral uses a different format for images - we'll include it in content for now
          lastMessage.content += '\n\n[Image attached - supported by Pixtral models]';
        } else {
          lastMessage.content +=
            '\n\n[Image attached - processing capabilities depend on the selected model]';
        }
      }
    }

    // Calculate token estimates
    const totalTokensEstimate = processedMessages.reduce(
      (sum, msg) => sum + estimateTokens(msg.content),
      0,
    );

    // Prepare the request body for the Mistral API
    const requestBody = {
      model: model,
      messages: processedMessages,
      max_tokens: 2048,
      temperature: 0.7,
      stream: false,
    };

    console.log(`Making request to Mistral API for model: ${model}`, {
      endpoint: 'https://api.mistral.ai/v1/chat/completions',
      messageCount: processedMessages.length,
      tokensEstimate: totalTokensEstimate,
    });

    // Make the API call to the Mistral endpoint
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'Open-Fiesta/1.0',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mistral API error (${response.status}):`, errorText);

      return new Response(
        JSON.stringify({
          error: `Mistral API error: ${response.status} ${response.statusText}`,
          details: errorText,
          code: response.status,
        }),
        { status: response.status },
      );
    }

    const data = await response.json();

    // Extract the response text from Mistral's response format
    let text = '';
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      text = data.choices[0].message.content || '';
    } else if (data.message) {
      text = data.message;
    } else if (data.text) {
      text = data.text;
    } else if (typeof data === 'string') {
      text = data;
    }

    // Ensure we have some response
    if (!text || text.trim() === '') {
      text = 'No response generated. Please try again with a different prompt.';
    }

    // Token reporting for response
    const tokensPayload = {
      by: 'messages' as const,
      total: totalTokensEstimate,
      model: model,
    };

    return Response.json({
      text: text.trim(),
      raw: data,
      provider: 'mistral',
      usedKeyType,
      tokens: tokensPayload,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Mistral provider error:', error);

    return new Response(
      JSON.stringify({
        error: `Mistral provider error: ${message}`,
        provider: 'mistral',
      }),
      { status: 500 },
    );
  }
}
