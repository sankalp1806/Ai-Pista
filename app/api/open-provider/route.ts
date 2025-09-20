import { NextRequest } from 'next/server';
import { Buffer } from 'node:buffer';

// Simple token estimator (approximate): ~4 characters per token
function estimateTokens(text: string): number {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > 0 ? Math.ceil(t.length / 4) : 0;
}

// Function to get natural TTS prefix based on content type
function getTTSPrefix(text: string): string {
  const lowerText = text.toLowerCase().trim();

  // For questions
  if (
    lowerText.includes('?') ||
    lowerText.startsWith('what') ||
    lowerText.startsWith('how') ||
    lowerText.startsWith('why') ||
    lowerText.startsWith('when') ||
    lowerText.startsWith('where') ||
    lowerText.startsWith('who') ||
    lowerText.startsWith('which') ||
    lowerText.startsWith('can you')
  ) {
    return "Here's what you asked:";
  }

  // For greetings
  if (
    lowerText.includes('hello') ||
    lowerText.includes('hi ') ||
    lowerText.includes('hey') ||
    lowerText.startsWith('good morning') ||
    lowerText.startsWith('good afternoon') ||
    lowerText.startsWith('good evening')
  ) {
    return 'You said:';
  }

  // For commands or requests
  if (
    lowerText.startsWith('please') ||
    lowerText.startsWith('can you') ||
    lowerText.startsWith('could you') ||
    lowerText.startsWith('tell me') ||
    lowerText.startsWith('explain') ||
    lowerText.startsWith('describe')
  ) {
    return 'Your request was:';
  }

  // For statements or stories
  if (lowerText.length > 50) {
    return "Here's your text:";
  }

  // Default for short phrases
  return 'Repeating:';
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey: apiKeyFromBody, imageDataUrl, voice } = await req.json();
    // Use the provided token or fallback to environment variables or default token
    const apiKey =
      apiKeyFromBody ||
      process.env.OPEN_PROVIDER_API_KEY ||
      process.env.OPEN_PROVIDER_API_KEY_BACKUP ||
      'EKfz9oU-FsP-Kz4w';
    const usedKeyType = apiKeyFromBody
      ? 'user'
      : process.env.OPEN_PROVIDER_API_KEY
        ? 'shared-primary'
        : process.env.OPEN_PROVIDER_API_KEY_BACKUP
          ? 'shared-backup'
          : 'default';

    if (!model) return new Response(JSON.stringify({ error: 'Missing model id' }), { status: 400 });

    // Sanitize and validate messages
    type InMsg = { role?: unknown; content?: unknown };
    type OutMsg = { role: 'user' | 'assistant' | 'system'; content: string };

    const isRole = (r: unknown): r is OutMsg['role'] =>
      r === 'user' || r === 'assistant' || r === 'system';
    const sanitize = (msgs: unknown[]): OutMsg[] =>
      (Array.isArray(msgs) ? (msgs as InMsg[]) : [])
        .map((m) => {
          const role = isRole(m?.role) ? m.role : 'user';
          const content = typeof m?.content === 'string' ? m.content : String(m?.content ?? '');
          return { role, content };
        })
        .filter((m) => isRole(m.role));

    const sanitizedMessages = sanitize((messages as unknown[]) || []);

    // Keep last 8 messages to avoid overly long histories
    const trimmedMessages =
      sanitizedMessages.length > 8 ? sanitizedMessages.slice(-8) : sanitizedMessages;

    // Extract the last user message as the prompt for image generation
    const lastUserMessage = trimmedMessages.filter((msg) => msg.role === 'user').pop();
    let prompt = lastUserMessage ? lastUserMessage.content : 'A beautiful image';

    // Handle different model categories
    const isImageModel = ['flux', 'kontext', 'turbo'].includes(model);
    const isAudioModel = model === 'openai-audio';
    const isReasoningModel = ['deepseek-reasoning'].includes(model);

    const isGpt5Nano = model === 'gpt-5-nano';

    // For audio models, add natural TTS prefix to make it feel more conversational
    if (isAudioModel && prompt) {
      const ttsPrefix = getTTSPrefix(prompt);
      prompt = `${ttsPrefix} ${prompt}`;
      console.log(`Audio TTS input length: ${prompt.length} characters`);
    }

    if (isImageModel) {
      // For image models, use the image generation endpoint with token authentication
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=${encodeURIComponent(model)}&nologo=true&enhance=true&token=${encodeURIComponent(apiKey)}`;

      // Return the image URL directly without markdown text to avoid showing text before image loads
      const text = `![Generated Image](${imageUrl})`;
      const promptTokensEstimate = estimateTokens(prompt);
      return Response.json({
        text,
        imageUrl,
        provider: 'open-provider',
        usedKeyType,
        isImageGeneration: true, // Flag to indicate this is image generation
        tokens: {
          by: 'prompt',
          total: promptTokensEstimate,
          model,
        },
      });
    }

    // For audio models, use GET format with chunking for long text
    // For text models, use POST format
    let textUrl;
    let useChunking = false;

    if (isAudioModel) {
      // Check if text is too long for URL (conservative limit: 800 chars for reliable audio)
      if (prompt.length > 800) {
        // For very long text, truncate with a note
        const truncatedPrompt =
          prompt.substring(0, 750) + '... [Audio truncated due to length limit]';
        const encodedPrompt = encodeURIComponent(truncatedPrompt);
        const selectedVoice = voice || 'alloy';
        textUrl = `https://text.pollinations.ai/${encodedPrompt}?model=openai-audio&voice=${selectedVoice}&token=${encodeURIComponent(apiKey)}`;
        useChunking = true;
      } else {
        // For shorter text, use full content
        const encodedPrompt = encodeURIComponent(prompt);
        const selectedVoice = voice || 'alloy';
        textUrl = `https://text.pollinations.ai/${encodedPrompt}?model=openai-audio&voice=${selectedVoice}&token=${encodeURIComponent(apiKey)}`;
      }
    } else {
      // Use OpenAI-compatible endpoint for text models
      const baseUrl = 'https://text.pollinations.ai/openai';
      textUrl = `${baseUrl}?token=${encodeURIComponent(apiKey)}`;
    }

    // Prepare the request body in OpenAI format for Pollinations API
    // Compute token estimates
    const messageTokenDetails = trimmedMessages.map((m, idx) => ({
      index: idx,
      role: m.role,
      chars: m.content.length,
      tokens: estimateTokens(m.content),
    }));
    const totalTokensEstimate = messageTokenDetails.reduce((sum, x) => sum + x.tokens, 0);
    const requestBody = isAudioModel
      ? null
      : {
          // For text models, use chat format
          messages: trimmedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          model: model,
          stream: false,
          // Add defaults and reasoning parameters
          // Note: Omit `temperature` entirely to satisfy Azure models that only accept the default (1)
          ...(isReasoningModel ? { max_tokens: 4000 } : { max_tokens: 2048 }),
        };

    // Longer timeout for reasoning models as they take more time
    const timeoutMs = isReasoningModel ? 180000 : 120000; // 180s for reasoning, 120s for others
    const aborter = new AbortController();
    const timeoutId = setTimeout(() => aborter.abort(), timeoutMs);

    try {
      const messageCount =
        !isAudioModel && (requestBody as { messages?: unknown[] })?.messages
          ? (requestBody as { messages: unknown[] }).messages.length || 0
          : 0;
      console.log(`Making request to Pollinations API for model: ${model}`, {
        url: textUrl,
        bodyPreview: isAudioModel
          ? {
              method: 'GET',
              model: 'openai-audio',
              voice: voice || 'alloy',
              isAudio: true,
              originalLength: prompt?.length || 0,
              truncated: prompt.length > 800,
              finalLength: prompt.length > 800 ? 750 : prompt.length,
            }
          : {
              model: requestBody?.model || model,
              messageCount:
                requestBody && 'messages' in requestBody ? requestBody.messages?.length || 0 : 0,
              isReasoning: isReasoningModel,
              endpoint: 'openai-compatible',
              tokensEstimate: totalTokensEstimate,
            },
      });

      // For reasoning models, try both token methods
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Open-Fiesta/1.0',
        Authorization: `Bearer ${apiKey}`,
      };

      // Add additional headers for reasoning models
      if (isReasoningModel) {
        headers['X-API-Key'] = apiKey;
        headers['X-Model-Type'] = 'reasoning';
      }

      const resp = await fetch(textUrl, {
        method: isAudioModel ? 'GET' : 'POST',
        headers: isAudioModel
          ? {
              'User-Agent': 'Open-Fiesta/1.0',
              Authorization: `Bearer ${apiKey}`,
            }
          : headers,
        ...(isAudioModel ? {} : { body: JSON.stringify(requestBody) }),
        signal: aborter.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errorText = await resp.text().catch(() => 'Unknown error');
        console.error(`Pollinations API Error for model ${model}:`, {
          status: resp.status,
          statusText: resp.statusText,
          errorText,
          headers: Object.fromEntries(resp.headers.entries()),
        });

        const friendlyError = (() => {
          if (resp.status === 401) {
            return 'Authentication failed. The model may require higher tier access.';
          }
          if (resp.status === 403) {
            return 'Access denied. This model may require special permissions.';
          }
          if (resp.status === 429) {
            return 'Rate limit exceeded. Please try again in a moment.';
          }
          if (resp.status === 503) {
            return 'Service temporarily unavailable. Please try again later.';
          }
          if (resp.status >= 500) {
            return 'Server error occurred. Please try again later.';
          }
          return `Provider returned error [status ${resp.status}]: ${errorText}`;
        })();

        if (resp.status === 429) {
          return Response.json({
            text: friendlyError,
            error: errorText,
            code: 429,
            provider: 'open-provider',
            usedKeyType,
          });
        }

        return Response.json(
          {
            text: friendlyError,
            error: errorText,
            code: resp.status,
            provider: 'open-provider',
            usedKeyType,
          },
          { status: resp.status },
        );
      }

      // Handle different response types based on model
      let data;
      let audioUrl = null;
      const contentType = resp.headers.get('content-type');

      if (isAudioModel) {
        // For audio models, handle binary audio response
        console.log('Audio response content-type:', contentType);

        if (contentType?.includes('audio/') || contentType?.includes('application/octet-stream')) {
          // Binary audio response - convert to base64 for client-side blob creation
          const audioBuffer = await resp.arrayBuffer();
          const audioBase64 = Buffer.from(audioBuffer).toString('base64');
          const mimeType = contentType || 'audio/mpeg';
          audioUrl = `data:${mimeType};base64,${audioBase64}`;
          data = { audio_url: audioUrl };
          console.log('Created data URL for audio, size:', audioBuffer.byteLength, 'bytes');
        } else {
          // Try to parse as JSON first, then as text
          const responseText = await resp.text();
          console.log('Audio response text:', responseText.substring(0, 200));

          try {
            data = JSON.parse(responseText);
            // 1) Direct fields
            if (data.audio_url || data.url) {
              audioUrl = data.audio_url || data.url;
              console.log('Found audio URL in JSON:', audioUrl);
            }
            // 2) OpenAI Responses API style: { output: [ { content: [ { type: 'output_audio', audio: { data, format } } ] } ] }
            if (!audioUrl && Array.isArray((data as { output: unknown[] }).output)) {
              const items = (data as { output: unknown[] }).output as unknown[];
              for (const item of items) {
                const contents = item?.content;
                if (Array.isArray(contents)) {
                  for (const c of contents) {
                    const audioObj = c?.audio || c?.output_audio || c?.data?.audio;
                    const type = c?.type;
                    if (
                      (type === 'output_audio' || type === 'audio' || audioObj) &&
                      (audioObj?.data || c?.data)
                    ) {
                      const b64 = audioObj?.data || c?.data;
                      const fmt = (audioObj?.format || 'mp3').toLowerCase();
                      const mime =
                        fmt === 'wav' ? 'audio/wav' : fmt === 'm4a' ? 'audio/mp4' : 'audio/mpeg';
                      audioUrl = `data:${mime};base64,${b64}`;
                      console.log('Constructed data URL from Responses payload');
                      break;
                    }
                  }
                }
                if (audioUrl) break;
              }
            }
            // 3) Choices-style: choices[0].message.audio or .content with audio
            if (!audioUrl && Array.isArray((data as { choices: unknown[] }).choices)) {
              const ch0 = (data as { choices: unknown[] }).choices[0];
              const msg = ch0?.message || {};
              const audioNode =
                msg?.audio ||
                msg?.content?.find?.((x: { type: string }) => x?.type === 'audio' || x?.type === 'output_audio')
                  ?.audio;
              const b64 = audioNode?.data;
              const fmt = (audioNode?.format || 'mp3').toLowerCase();
              if (b64) {
                const mime =
                  fmt === 'wav' ? 'audio/wav' : fmt === 'm4a' ? 'audio/mp4' : 'audio/mpeg';
                audioUrl = `data:${mime};base64,${b64}`;
                console.log('Constructed data URL from choices.message.audio');
              }
            }
          } catch {
            // If response looks like a URL, use it as audio URL
            const responseText = await resp.text();
            if (
              responseText.startsWith('http') &&
              (responseText.includes('.mp3') ||
                responseText.includes('.wav') ||
                responseText.includes('.m4a'))
            ) {
              audioUrl = responseText.trim();
              data = { audio_url: audioUrl };
              console.log('Using response text as audio URL:', audioUrl);
            } else {
              // If not JSON or URL, treat as plain text response
              data = { text: responseText };
            }
          }
        }
      } else {
        // For text models, handle as before
        const responseText = await resp.text();
        try {
          data = JSON.parse(responseText);
        } catch {
          // If not JSON, treat as plain text response
          data = { text: responseText };
        }
      }

      // Extract text from response
      let text = '';
      // audioUrl is already declared above

      if (isAudioModel) {
        // For audio models, prioritize audio URL
        if (audioUrl) {
          text = `[AUDIO:${audioUrl}]`; // Special format for audio
        } else if (data && data.audio_url) {
          audioUrl = data.audio_url;
          text = `[AUDIO:${audioUrl}]`;
        } else if (typeof data === 'string') {
          text = data;
        } else if (data && typeof data.text === 'string') {
          text = data.text;
        } else {
          text = 'Audio generation failed. Please try again.';
        }
      } else {
        // For text models, extract text and aggregate all choices if present
        if (typeof data === 'string') {
          text = data;
        } else if (data && typeof (data as { text: unknown }).text === 'string') {
          text = (data as { text: unknown }).text;
        } else if (data && typeof (data as { content: unknown }).content === 'string') {
          text = (data as { content: unknown }).content;
        } else if (data && Array.isArray((data as { choices: unknown[] }).choices)) {
          const choices = (data as { choices: unknown[] }).choices as Array<{
            message?: { content?: string } | { role?: string; content?: string };
          }>;
          const all = choices
            .map((c) => (typeof c?.message?.content === 'string' ? c.message!.content : ''))
            .filter(Boolean);
          text = all.join('\n\n') || '';
        } else {
          text = 'No response generated. Please try again with a different prompt.';
        }
      }

      // Ensure we have some response
      if (!text || text.trim() === '') {
        text = 'No response generated. Please try again with a different prompt.';
      }

      // Token reporting for response
      const tokensPayload = isAudioModel
        ? { by: 'prompt', total: estimateTokens(prompt), model }
        : { by: 'messages', total: totalTokensEstimate, perMessage: messageTokenDetails, model };

      return Response.json({
        text: text.trim(),
        audioUrl,
        raw: data,
        provider: 'open-provider',
        usedKeyType,
        tokens: tokensPayload,
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        return Response.json(
          {
            text: 'Request timed out. Please try again with a shorter prompt.',
            error: 'Timeout',
            code: 408,
            provider: 'open-provider',
            usedKeyType,
          },
          { status: 408 },
        );
      }

      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return Response.json(
        {
          text: 'Failed to generate response. Please try again.',
          error: errorMsg,
          code: 500,
          provider: 'open-provider',
          usedKeyType,
        },
        { status: 500 },
      );
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        error: message,
        provider: 'open-provider',
      }),
      { status: 500 },
    );
  }
}
