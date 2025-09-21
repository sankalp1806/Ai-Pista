import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, baseUrl, models } = await req.json();
    // For Ollama, we get the base URL from the request body (user settings) or environment or default to localhost
    const ollamaUrl = baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434';

    if (process.env.DEBUG_OLLAMA === '1') console.log(`Calling Ollama model: ${model} at ${ollamaUrl}`);

    // Support both single model and array of models
    const modelList = Array.isArray(models) ? models : model ? [model] : [];

    if (modelList.length === 0) {
      // Fallback to single model if models array not provided
      modelList.push(model);
    }

    // For each model, create a separate request with its own timeout/controller
    const results = await Promise.allSettled(
      modelList.map(async (mdl: string) => {
        const ollamaMessages = messages.map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: msg.content
        }));

        const requestBody = {
          model: mdl,
          messages: ollamaMessages,
          stream: false
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama request timeout triggered for model ${mdl}`);
          controller.abort();
        }, 180000); // 3 minutes per request

        try {
          const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });

          if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama response status for ${mdl}: ${response.status}`);

          if (!response.ok) {
            const errorText = await response.text();
            if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama error response for ${mdl}:`, errorText);
            return {
              model: mdl,
              error: `Ollama API error: ${response.status} ${response.statusText}`,
              details: errorText,
              provider: 'ollama',
              code: response.status
            };
          }

          const data = await response.json();
          if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama response data for ${mdl}:`, JSON.stringify(data, null, 2));

          // Extract the response text
          let text = '';
          if (data.message && data.message.content) {
            text = data.message.content;
          } else if (data.response) {
            text = data.response;
          } else {
            text = 'No response from Ollama';
          }

          return { model: mdl, text, raw: data };
        } catch (e: unknown) {
          const err = e as Error;
          if (err?.name === 'AbortError') {
            if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama request timed out for ${mdl}`);
            return { model: mdl, error: 'Ollama request timed out', provider: 'ollama', code: 504 };
          }
          const message = err?.message || 'Unknown error';
          if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama error for ${mdl}:`, message);
          return { model: mdl, error: message, provider: 'ollama' };
        } finally {
          clearTimeout(timeoutId);
        }
      })
    );

    // Format results: if only one model, return as before; else, return array
    const formatted = modelList.length === 1
      ? results[0].status === 'fulfilled' ? results[0].value : { error: 'Failed', ...results[0].reason }
      : results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Failed', ...r.reason });

    return Response.json(formatted);
  } catch (e: unknown) {
    const err = e as Error;
    if (err?.name === 'AbortError') {
      if (process.env.DEBUG_OLLAMA === '1') console.log('Ollama request timed out');
      return new Response(JSON.stringify({ error: 'Ollama request timed out', provider: 'ollama', code: 504 }), { status: 504 });
    }
    const message = err?.message || 'Unknown error';
    if (process.env.DEBUG_OLLAMA === '1') console.log(`Ollama error:`, message);
    return new Response(JSON.stringify({ error: message, provider: 'ollama' }), { status: 500 });
  }
}
