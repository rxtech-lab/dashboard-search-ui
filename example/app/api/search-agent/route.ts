import { simulateReadableStream } from "ai";

const README_CONTENT = `# searching-ui

A React component library for building AI-powered search interfaces with streaming chat support.

## Features

- **SearchTrigger** - Customizable search trigger button
- **SearchCommand** - Command palette dialog with instant search results
- **SearchAgent** - AI-powered chat interface with streaming responses
- **useSearchAgent** - React hook for managing chat state

The library supports custom tool renderers, allowing you to display rich UI for tool results like file searches and document previews.`;

const MOCK_SEARCH_RESULTS = [
  {
    id: "1",
    title: "README.md",
    snippet: "A React component library for building AI-powered search interfaces",
    score: 0.95,
  },
  {
    id: "2",
    title: "package.json",
    snippet: "searching-ui library configuration and dependencies",
    score: 0.85,
  },
  {
    id: "3",
    title: "src/index.ts",
    snippet: "Main entry point exporting all components",
    score: 0.75,
  },
];

const MOCK_FILES = [
  {
    id: "1",
    title: "README.md",
    fileType: "document",
    mimeType: "text/markdown",
    folderName: "Root",
  },
  {
    id: "2",
    title: "SearchCommand.tsx",
    fileType: "code",
    mimeType: "text/typescript",
    folderName: "src/components/search",
  },
  {
    id: "3",
    title: "SearchAgent.tsx",
    fileType: "code",
    mimeType: "text/typescript",
    folderName: "src/components/search",
  },
];

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userMessage = messages?.[messages.length - 1]?.content || "search";

  // Generate unique IDs for this response
  const messageId = `msg-${Date.now()}`;
  const toolCallId1 = `call-search-${Date.now()}`;
  const toolCallId2 = `call-display-${Date.now()}`;

  // Split README content into chunks for streaming effect
  const textChunks = README_CONTENT.match(/.{1,50}/g) || [];

  const chunks: string[] = [
    // Start message
    `data: {"type":"start","messageId":"${messageId}"}\n\n`,

    // Tool call: search_files
    `data: {"type":"tool-call","toolCallId":"${toolCallId1}","toolName":"search_files","args":{"query":"${userMessage}"}}\n\n`,

    // Tool result: search_files
    `data: {"type":"tool-output-available","toolCallId":"${toolCallId1}","output":${JSON.stringify({
      query: userMessage,
      results: MOCK_SEARCH_RESULTS,
    })}}\n\n`,

    // Tool call: display_results
    `data: {"type":"tool-call","toolCallId":"${toolCallId2}","toolName":"display_results","args":{"fileIds":["1","2","3"]}}\n\n`,

    // Tool result: display_results
    `data: {"type":"tool-output-available","toolCallId":"${toolCallId2}","output":${JSON.stringify({
      files: MOCK_FILES,
    })}}\n\n`,

    // Text streaming
    `data: {"type":"text-start","id":"text-1"}\n\n`,
    ...textChunks.map(
      (chunk) =>
        `data: {"type":"text-delta","id":"text-1","delta":${JSON.stringify(chunk)}}\n\n`
    ),
    `data: {"type":"text-end","id":"text-1"}\n\n`,

    // Finish
    `data: {"type":"finish"}\n\n`,
    `data: [DONE]\n\n`,
  ];

  return new Response(
    simulateReadableStream({
      initialDelayInMs: 100,
      chunkDelayInMs: 30,
      chunks,
    }).pipeThrough(new TextEncoderStream()),
    {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    }
  );
}
