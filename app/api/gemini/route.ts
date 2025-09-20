import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey: apiKeyFromBody, imageDataUrl } = await req.json();
    const apiKey = apiKeyFromBody || process.env.GEMINI_API_KEY;
    const usedKeyType = apiKeyFromBody ? 'user' : process.env.GEMINI_API_KEY ? 'shared' : 'none';
    if (!apiKey)
      return new Response(JSON.stringify({ error: 'Missing Gemini API key' }), { status: 400 });
    const allowed = new Set(['gemini-2.5-flash', 'gemini-2.5-pro']);
    const requested = typeof model === 'string' ? model : 'gemini-2.5-flash';
    const geminiModel = allowed.has(requested) ? requested : 'gemini-2.5-flash';

    // Convert OpenAI-style messages to Gemini contents
    // Gemini expects: { contents: [{ role, parts: [{ text }] }, ...] }
    type InMsg = { role?: unknown; content?: unknown };
    type GeminiPart = { text?: string; inline_data?: { mime_type: string; data: string } };
    type GeminiContent = { role: 'user' | 'model' | 'system'; parts: GeminiPart[] };

    const toRole = (r: unknown): 'user' | 'model' | 'system' => {
      const role = typeof r === 'string' ? r : '';
      if (role === 'assistant') return 'model';
      if (role === 'user' || role === 'system') return role;
      return 'user';
    };

    let contents: GeminiContent[] = (Array.isArray(messages) ? (messages as InMsg[]) : []).map(
      (m) => ({
        role: toRole(m.role),
        parts: [{ text: typeof m?.content === 'string' ? m.content : String(m?.content ?? '') }],
      }),
    );

    // Extract a system prompt (from project custom prompt) into systemInstruction
    const systemParts: GeminiPart[] = [];
    contents = contents.filter((c) => {
      if (c.role === 'system') {
        for (const p of c.parts) {
          if (typeof p?.text === 'string' && p.text.trim()) {
            systemParts.push({ text: p.text });
          }
        }
        return false; // remove from contents
      }
      return true;
    });

    // If a data URL is provided, attach it to the last user message ONLY if it's an image.
    // For unsupported types (e.g., docx/pdf), add a small text note and omit binary data.
    if (imageDataUrl && contents.length > 0) {
      for (let i = contents.length - 1; i >= 0; i--) {
        if (contents[i].role === 'user') {
          try {
            const [meta, base64] = String(imageDataUrl).split(',');
            const mt = /data:(.*?);base64/.exec(meta || '')?.[1] || '';
            if (/^image\//i.test(mt)) {
              contents[i].parts.push({
                inline_data: { mime_type: mt || 'image/png', data: base64 },
              });
            } else {
              contents[i].parts.push({
                text: `(Attachment omitted: ${mt || 'unknown type'} unsupported by Gemini)`,
              });
            }
          } catch {}
          break;
        }
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        // Ensure there is at least one user message; Gemini requires user/model roles in contents
        contents:
          contents.length > 0
            ? contents
            : [{ role: 'user', parts: [{ text: 'Please respond to the instruction.' }] }],
        ...(systemParts.length > 0 ? { systemInstruction: { parts: systemParts } } : {}),
        generationConfig: {
          response_mime_type: 'text/plain',
          // Encourage non-empty responses
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      }),
    });

    const data: unknown = await resp.json();
    if (!resp.ok) {
      const errStr = (() => {
        const d = data as
          | { error?: { message?: unknown } }
          | Record<string, unknown>
          | string
          | null
          | undefined;
        if (typeof d === 'string') return d;
        if (d && typeof d === 'object') {
          if ('error' in d && d.error && typeof (d as { error?: unknown }).error === 'object') {
            const maybe = (d as { error?: { message?: unknown } }).error;
            const m =
              maybe && typeof maybe === 'object' && 'message' in maybe
                ? (maybe as { message?: unknown }).message
                : undefined;
            return typeof m === 'string' ? m : JSON.stringify(m);
          }
          try {
            return JSON.stringify(d);
          } catch {
            return 'Unknown error';
          }
        }
        return 'Unknown error';
      })();
      const errObj = errStr;
      if (resp.status === 429) {
        const text =
          usedKeyType === 'user'
            ? 'Your Gemini API key hit a rate limit. Please retry after a moment or upgrade your plan/limits.'
            : 'This model hit a shared rate limit. Add your own Gemini API key for FREE in Settings for higher limits and reliability.';
        return Response.json({ text, error: errObj, code: 429, provider: 'gemini', usedKeyType });
      }
      return new Response(JSON.stringify({ error: errObj, raw: data }), { status: resp.status });
    }

    // Extract text
    const extractText = (d: unknown): string => {
      const candidates = (d as { candidates?: unknown[] } | null)?.candidates;
      if (!Array.isArray(candidates) || candidates.length === 0) return '';
      const cand = candidates[0] as { content?: { parts?: unknown[] } } | undefined;
      const parts = cand?.content?.parts;
      if (!Array.isArray(parts)) return '';
      const texts = parts
        .map((p) =>
          typeof (p as { text?: unknown })?.text === 'string'
            ? String((p as { text?: unknown }).text)
            : '',
        )
        .filter(Boolean);
      return texts.join('\n');
    };
    let text = extractText(data) ?? '';
    if (!text) {
      const cand = (data as { candidates?: unknown[] } | null)?.candidates?.[0] as
        | { content?: { parts?: unknown[] }; finishReason?: unknown; safetyRatings?: unknown[] }
        | undefined;
      const parts = (cand?.content as { parts?: unknown[] } | undefined)?.parts ?? [];
      if (Array.isArray(parts) && parts.length) {
        const collected = parts
          .map((p) =>
            typeof (p as { text?: unknown })?.text === 'string'
              ? String((p as { text?: unknown }).text)
              : '',
          )
          .filter(Boolean);
        text = collected.join('\n');
      }
    }
    if (!text) {
      const cand = (data as { candidates?: unknown[] } | null)?.candidates?.[0] as
        | { finishReason?: unknown; safetyRatings?: unknown[] }
        | undefined;
      const finish =
        (cand as { finishReason?: unknown } | undefined)?.finishReason ||
        (data as { finishReason?: unknown } | undefined)?.finishReason;
      const blockReason =
        (data as { promptFeedback?: { blockReason?: unknown } } | undefined)?.promptFeedback
          ?.blockReason ||
        (Array.isArray(
          (cand as { safetyRatings?: Array<{ category?: unknown }> } | undefined)?.safetyRatings,
        )
          ? (cand as { safetyRatings?: Array<{ category?: unknown }> }).safetyRatings?.[0]?.category
          : undefined);
      const blocked = finish && String(finish).toLowerCase().includes('safety');
      if (blocked || blockReason) {
        text = `Gemini blocked the content due to safety settings${blockReason ? ` (reason: ${blockReason})` : ''}. Try rephrasing your prompt.`;
      }
    }
    if (!text) {
      const hint =
        'Gemini returned an empty message. This can happen on shared quota. Try again, rephrase, or add your own Gemini API key in Settings.';
      text = hint;
    }
    // Token estimation similar to open-provider: ~4 chars per token
    const estimateTokens = (s: string) => {
      const t = (s || '').replace(/\s+/g, ' ').trim();
      return t.length > 0 ? Math.ceil(t.length / 4) : 0;
    };
    // messages may contain non-strings; coerce and sum
    const inputArray = Array.isArray(messages)
      ? (messages as Array<{ role?: unknown; content?: unknown }>)
      : [];
    const perMessage = inputArray.map((m, idx) => ({
      index: idx,
      role: typeof m?.role === 'string' ? String(m.role) : 'user',
      chars:
        typeof m?.content === 'string'
          ? (m.content as string).length
          : String(m?.content ?? '').length,
      tokens: estimateTokens(
        typeof m?.content === 'string' ? (m.content as string) : String(m?.content ?? ''),
      ),
    }));
    const total = perMessage.reduce((sum, x) => sum + x.tokens, 0);

    return Response.json({
      text,
      raw: data,
      provider: 'gemini',
      usedKeyType,
      tokens: {
        by: 'messages',
        total,
        perMessage,
        model: geminiModel,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
