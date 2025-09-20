import type { ChatThread, AiModel, ChatMessage } from './types';

/**
 * Formats a chat thread for export
 */
export function formatChatForExport(thread: ChatThread, selectedModels: AiModel[]): string {
  const title = thread.title || 'Untitled Chat';
  const date = new Date(thread.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Group messages by conversation pairs
  const pairs: { user: ChatMessage; answers: ChatMessage[] }[] = [];
  let currentPair: { user: ChatMessage; answers: ChatMessage[] } | null = null;

  for (const msg of thread.messages) {
    if (msg.role === 'user') {
      if (currentPair) {
        pairs.push(currentPair);
      }
      currentPair = { user: msg, answers: [] };
    } else if (msg.role === 'assistant' && currentPair) {
      currentPair.answers.push(msg);
    }
  }

  if (currentPair) {
    pairs.push(currentPair);
  }

  // Build markdown content
  let markdown = `# ${title}\n\n`;
  markdown += `**Date:** ${date}\n\n`;

  if (selectedModels.length > 0) {
    markdown += `**Models Used:** ${selectedModels.map((m) => m.label).join(', ')}\n\n`;
  }

  markdown += `---\n\n`;

  pairs.forEach((pair, index) => {
    // User message
    markdown += `## Question ${index + 1}\n\n`;
    markdown += `${pair.user.content}\n\n`;

    // Assistant responses
    if (pair.answers.length > 0) {
      if (pair.answers.length === 1) {
        const answer = pair.answers[0];
        const model = selectedModels.find((m) => m.id === answer.modelId);
        const modelLabel = model ? model.label : answer.modelId || 'Assistant';
        markdown += `### ${modelLabel}\n\n`;
        markdown += `${answer.content}\n\n`;
      } else {
        markdown += `### Responses\n\n`;
        pair.answers.forEach((answer) => {
          const model = selectedModels.find((m) => m.id === answer.modelId);
          const modelLabel = model ? model.label : answer.modelId || 'Assistant';

          markdown += `#### ${modelLabel}\n\n`;
          markdown += `${answer.content}\n\n`;
        });
      }
    }

    if (index < pairs.length - 1) {
      markdown += `---\n\n`;
    }
  });

  return markdown;
}

/**
 * Download a text file
 */
export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert markdown to HTML for PDF generation
 */
function markdownToHtml(markdown: string): string {
  // Simple markdown to HTML conversion with improved formatting
  const html = markdown
    // Headers
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks with syntax highlighting preservation
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      '<pre class="code-block"><code class="language-$1">$2</code></pre>',
    )
    // Inline code
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Links (basic)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks - handle paragraphs properly
    .split('\n\n')
    .map((para) => para.trim())
    .filter((para) => para)
    .map((para) => {
      // Don't wrap headers, hrs, or pre blocks in p tags
      if (para.match(/^<(h[1-6]|hr|pre)/)) {
        return para;
      }
      return `<p>${para.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

/**
 * Generate and download PDF using browser's print functionality
 */
export function downloadAsPdf(thread: ChatThread, selectedModels: AiModel[]): void {
  const markdown = formatChatForExport(thread, selectedModels);
  const html = markdownToHtml(markdown);

  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup blocked. Please allow popups for this site to download PDF.');
    return;
  }

  const title = thread.title || 'Untitled Chat';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <style>
            * { box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 40px;
                color: #1f2937;
                max-width: 100%;
            }
            h1 { 
                color: #2563eb; 
                border-bottom: 3px solid #e5e7eb; 
                padding-bottom: 15px; 
                margin-bottom: 25px;
                font-size: 2rem;
            }
            h2 { 
                color: #1f2937; 
                margin-top: 40px; 
                margin-bottom: 20px;
                font-size: 1.5rem;
                border-left: 4px solid #2563eb;
                padding-left: 15px;
            }
            h3 { 
                color: #374151; 
                margin-top: 30px; 
                margin-bottom: 15px;
                font-size: 1.25rem;
            }
            h4 { 
                color: #4b5563; 
                margin-top: 25px; 
                margin-bottom: 12px;
                font-size: 1.125rem;
            }
            p { 
                margin: 0 0 16px 0; 
                text-align: justify;
            }
            .code-block { 
                background: #f8fafc; 
                padding: 20px; 
                border-radius: 8px; 
                overflow-x: auto;
                border: 1px solid #e2e8f0;
                margin: 20px 0;
                font-family: 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
                font-size: 0.875rem;
                line-height: 1.5;
            }
            .code-block code {
                background: none;
                padding: 0;
                border: none;
                font-size: inherit;
            }
            .inline-code { 
                background: #f1f5f9; 
                padding: 3px 6px; 
                border-radius: 4px; 
                font-family: 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
                font-size: 0.875em;
                color: #e11d48;
                border: 1px solid #e2e8f0;
            }
            hr { 
                border: none; 
                border-top: 2px solid #e5e7eb; 
                margin: 40px 0; 
                opacity: 0.6;
            }
            strong { 
                color: #1f2937; 
                font-weight: 600;
            }
            em {
                color: #374151;
                font-style: italic;
            }
            a {
                color: #2563eb;
                text-decoration: none;
                border-bottom: 1px dotted #2563eb;
            }
            a:hover {
                border-bottom-style: solid;
            }
            @media print {
                body { 
                    margin: 15mm; 
                    padding: 0;
                    font-size: 12pt;
                }
                @page { 
                    margin: 15mm; 
                    size: A4;
                }
                h1 { 
                    font-size: 18pt; 
                    page-break-after: avoid;
                }
                h2, h3, h4 { 
                    page-break-after: avoid; 
                    page-break-inside: avoid;
                }
                .code-block { 
                    page-break-inside: avoid; 
                    background: #fafafa !important;
                    border: 1px solid #ccc !important;
                }
                hr {
                    page-break-after: always;
                    visibility: hidden;
                    margin: 0;
                }
            }
        </style>
    </head>
    <body>
        ${html}
    </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
}

/**
 * Download chat thread as Markdown file
 */
export function downloadAsMarkdown(thread: ChatThread, selectedModels: AiModel[]): void {
  const markdown = formatChatForExport(thread, selectedModels);
  const title = thread.title || 'Untitled Chat';
  const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.md`;

  downloadTextFile(markdown, filename);
}
