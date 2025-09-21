# AI Pista
  <a <img src="./public/aipista.png" alt="AI Pista preview"/> </a>
  Your browser does not support the video tag.

<!-- Fallback link for renderers that don't support <video> -->

![AI Pista](public/aipista.png)

An open-source, multi-model AI chat playground built with Next.js App Router. Switch between providers and models, compare outputs side-by-side, and use optional web search and image attachments.

## Features

- **Multiple providers**: Gemini, OpenRouter (DeepSeek R1, Llama 3.3, Qwen, Mistral, Moonshot, Reka, Sarvam, etc.)
- **Selectable model catalog**: choose up to 5 models to run
- **Web search toggle** per message
- **Image attachment** support (Gemini)
- **Conversation sharing**: Share conversations with shareable links
- **Clean UI**: keyboard submit, streaming-friendly API normalization

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- API routes for provider calls

## Quick Start

1. Install deps

```bash
npm i
```

2. Configure environment
   Copy the example environment file:

```bash
cp env.example .env
```

Then set the environment variables you plan to use. You can also enter keys at runtime in the app's Settings.

```bash
# OpenRouter (wide catalog of community models)
OPENROUTER_API_KEY=your_openrouter_key

# Google Gemini (Gemini 2.5 Flash/Pro)
GEMINI_API_KEY=your_gemini_key
```

3. Run dev server

```bash
npm run dev
# open http://localhost:3000
```

## Environment Variables

Set only those you need; others can be provided per-request from the UI:

- `OPENROUTER_API_KEY` — required for OpenRouter models.
- `GEMINI_API_KEY` — required for Gemini models with images/web.
- `OLLAMA_URL` — base URL for Ollama API (e.g., http://localhost:11434 or http://host.docker.internal:11434)

## Ollama Support

AI Pista supports local Ollama models. To use Ollama:

1. **Configure Ollama**:
   - Ensure Ollama is running and accessible: `ollama serve`
   - Make sure Ollama is configured to accept external connections by setting:
     ```bash
     export OLLAMA_HOST=0.0.0.0:11434
     ```

2. **Add Ollama Models**:
   - Go to the "Custom Models" section in the app (wrench icon)
   - Add Ollama models by entering the model name (e.g., "llama3", "mistral", "gemma")
   - The system will validate that the model exists in your Ollama instance

3. **Select and Use**:
   - Select your Ollama models in the model picker
   - Start chatting with your locally running models

## Project Structure

- `app/` – UI and API routes
  - `api/openrouter/route.ts` – normalizes responses across OpenRouter models; strips reasoning, cleans up DeepSeek R1 to plain text
  - `api/gemini/route.ts`, `api/gemini-pro/route.ts`
  - `shared/[encodedData]/` – shared conversation viewer
- `components/` – UI components (chat box, model selector, etc.)
  - `shared/` – components for shared conversation display
- `lib/` – model catalog and client helpers
  - `sharing/` – conversation sharing utilities

## Notes on DeepSeek R1

AI Pista post-processes DeepSeek R1 outputs to remove reasoning tags and convert Markdown to plain text for readability while preserving content.

## Contributing

We welcome contributions of all kinds: bug fixes, features, docs, and examples.

- **Set up**
  - Fork this repo and clone your fork.
  - Start the dev server with `npm run dev`.

- **Branching**
  - Create a feature branch from `main`: `feat/<short-name>` or `fix/<short-name>`.

- **Coding standards**
  - TypeScript, Next.js App Router.
  - Run linters and build locally:
    - `npm run lint`
    - `npm run build`
  - Keep changes focused and small. Prefer clear names and minimal dependencies.

- **UI/UX**
  - Reuse components in `components/` where possible.
  - Keep props typed and avoid unnecessary state.

- **APIs & models**
  - OpenRouter logic lives in `app/api/openrouter/`.
  - Gemini logic lives in `app/api/gemini/` and `app/api/gemini-pro/`.
  - If adding models/providers, update `lib/models.ts` or `lib/customModels.ts` and ensure the UI reflects new options.

- **Commit & PR**
  - Write descriptive commits (imperative mood): `fix: …`, `feat: …`, `docs: …`.
  - Open a PR to `main` with:
    - What/why, screenshots if UI changes, and testing notes.
    - Checklist confirming `npm run lint` and `npm run build` pass.
    - Test both traditional and Docker setups if applicable.
  - Link related issues if any.

- **Issue reporting**

Thank you for helping improve Ai Pista!

## Acknowledgements

- Model access via OpenRouter and Google

