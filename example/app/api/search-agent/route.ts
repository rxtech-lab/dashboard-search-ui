import { streamText, simulateReadableStream, tool } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { z } from "zod";

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
    snippet:
      "A React component library for building AI-powered search interfaces",
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

  // Split README content into chunks for streaming effect
  const textChunks = README_CONTENT.match(/.{1,50}/g) || [];

  const searchFilesInput = JSON.stringify({ query: userMessage });
  const displayResultsInput = JSON.stringify({ fileIds: ["1", "2", "3"] });

  const result = streamText({
    model: new MockLanguageModelV3({
      doStream: async () => ({
        stream: simulateReadableStream({
          initialDelayInMs: 2000,
          chunkDelayInMs: 30,
          chunks: [
            // Tool call 1: search_files
            {
              type: "tool-input-start",
              id: "call-1",
              toolName: "search_files",
            },
            { type: "tool-input-delta", id: "call-1", delta: searchFilesInput },
            { type: "tool-input-end", id: "call-1" },
            {
              type: "tool-call",
              toolCallId: "call-1",
              toolName: "search_files",
              input: searchFilesInput,
            },

            // Tool call 2: display_results
            {
              type: "tool-input-start",
              id: "call-2",
              toolName: "display_results",
            },
            {
              type: "tool-input-delta",
              id: "call-2",
              delta: displayResultsInput,
            },
            { type: "tool-input-end", id: "call-2" },
            {
              type: "tool-call",
              toolCallId: "call-2",
              toolName: "display_results",
              input: displayResultsInput,
            },

            // Text streaming (README content in chunks)
            { type: "text-start", id: "text-1" },
            ...textChunks.map((chunk) => ({
              type: "text-delta" as const,
              id: "text-1",
              delta: chunk,
            })),
            { type: "text-end", id: "text-1" },

            // Finish
            {
              type: "finish",
              finishReason: { unified: "stop" as const, raw: undefined },
              logprobs: undefined,
              usage: {
                inputTokens: {
                  total: 10,
                  noCache: 10,
                  cacheRead: undefined,
                  cacheWrite: undefined,
                },
                outputTokens: {
                  total: 50,
                  text: 50,
                  reasoning: undefined,
                },
              },
            },
          ],
        }),
      }),
    }),
    tools: {
      search_files: tool({
        description: "Search for files",
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => ({
          query,
          results: MOCK_SEARCH_RESULTS,
        }),
      }),
      display_results: tool({
        description: "Display file results",
        inputSchema: z.object({ fileIds: z.array(z.string()) }),
        execute: async () => ({
          files: MOCK_FILES,
        }),
      }),
    },
    prompt: userMessage,
  });

  return result.toUIMessageStreamResponse();
}
