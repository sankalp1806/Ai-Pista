# Open-Fiesta Gemini Assistant Context

## Project Overview

Open-Fiesta is a web-based AI chat playground built with Next.js and TypeScript. It allows users to interact with and compare various large language models (LLMs) from different providers side-by-side. The application features a flexible interface where users can select up to five models to chat with simultaneously.

### Key Features:

*   **Multi-Provider Support:** Integrates with major AI providers like Google (Gemini), OpenRouter, and Ollama, which provide access to a wide range of open-source and proprietary models.
*   **Model Comparison View:** The core feature is the ability to send a single prompt to multiple selected models and view their responses in a clean, organized grid layout.
*   **Persistent Chat Threads:** Chat history is saved locally in the browser, allowing users to resume previous conversations.
*   **Customizable Experience:** Users can manage their API keys, select their preferred models, and customize the user interface.
*   **Web Search and Image Attachments:** Supports web search capabilities and image attachments for certain models like Gemini.
*   **Dockerized Environment:** Comes with pre-configured Docker setups for both development and production, simplifying deployment.

### Architecture and Tech Stack:

*   **Framework:** Next.js 14 (with App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **API Handling:** Next.js API routes are used to proxy requests to the different AI provider APIs. This allows for secure handling of API keys and normalization of responses.
*   **State Management:** Primarily uses React hooks (`useState`, `useMemo`) and `useLocalStorage` for persistent state.
*   **Deployment:** Configured for standalone Next.js output, suitable for containerized deployments.

## Building and Running the Project

### Prerequisites:

*   Node.js and npm
*   Docker (optional, for containerized workflows)

### Development Mode:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    Copy the example environment file and add your API keys:
    ```bash
    cp .env.example .env
    ```
    Edit `.env` to add your `GEMINI_API_KEY` and/or `OPENROUTER_API_KEY`.

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Production Mode:

*   **Build the Application:**
    ```bash
    npm run build
    ```

*   **Start the Production Server:**
    ```bash
    npm run start
    ```

### Docker Workflows:

*   **Build Production Image:**
    ```bash
    npm run docker:build
    ```

*   **Run Production Container:**
    ```bash
    npm run docker:run
    ```

*   **Run in Development Mode with Docker Compose:**
    ```bash
    npm run docker:dev
    ```

## Development Conventions

*   **Linting:** The project uses ESLint for code quality. Run the linter with:
    ```bash
    npm run lint
    ```
*   **Component-Based Architecture:** The UI is built with reusable React components located in the `components/` directory.
*   **API Routes:** Server-side logic for communicating with AI providers is handled in the `app/api/` directory. Each provider has its own route for handling requests and normalizing responses.
*   **Model Definitions:** The available AI models are defined in `lib/models.ts`. To add a new model, this file should be updated.
*   **Styling:** Utility-first CSS with Tailwind CSS is the standard. Custom styles are defined in `app/globals.css`.
*   **State Management:** For client-side state, prefer React hooks. For state that needs to persist across sessions, use the `useLocalStorage` hook found in `lib/useLocalStorage.ts`.
*   **Types:** TypeScript types are used throughout the project. Global or shared types are defined in `lib/types.ts`.
