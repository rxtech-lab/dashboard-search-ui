"use client";

import { useState, useEffect } from "react";
import {
  SearchTrigger,
  SearchCommand,
  type BaseSearchResult,
} from "@rx-lab/dashboard-searching-ui";
import { toolRenderers } from "./components/tool-renderers";
import { Brain } from "lucide-react";

interface SearchResult extends BaseSearchResult {
  metadata?: {
    fileType: string;
    path: string;
  };
}

export default function Dashboard() {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = async ({
    query,
    limit,
  }: {
    query: string;
    limit?: number;
  }): Promise<SearchResult[]> => {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}&limit=${limit || 10}`,
    );
    return response.json();
  };

  const handleResultSelect = (result: SearchResult) => {
    console.log("Selected:", result);
    // In a real app, you might navigate to the file
    alert(`Selected: ${result.title}\nPath: ${result.metadata?.path || "/"}`);
  };

  const handleToolAction = (action: { type: string; payload: unknown }) => {
    console.log("Tool action:", action);
    if (action.type === "navigate" && typeof action.payload === "string") {
      alert(`Navigate to: ${action.payload}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">searching-ui Demo</h1>
          </div>
          <div className="flex items-center gap-4">
            <SearchTrigger
              onClick={() => setOpen(true)}
              placeholder="Search files..."
              shortcut={{ key: "K", modifier: "⌘" }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Hero Section */}
          <section className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              AI-Powered Search Interface
            </h2>
            <p className="text-lg text-muted-foreground">
              Click the search button or press{" "}
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>{" "}
              to open the search dialog
            </p>
          </section>

          {/* Feature Cards */}
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Quick Search"
              description="Instantly search through files with debounced input and real-time results."
            />
            <FeatureCard
              title="AI Agent Mode"
              description="Switch to AI-powered search with streaming responses and tool calls."
            />
            <FeatureCard
              title="Custom Tool Renderers"
              description="Display rich UI for tool results like file searches and document previews."
            />
            <FeatureCard
              title="Streaming Responses"
              description="See AI responses stream in real-time with animated loading states."
            />
            <FeatureCard
              title="Keyboard Navigation"
              description="Full keyboard support with shortcuts and arrow key navigation."
            />
            <FeatureCard
              title="Customizable UI"
              description="Style components with Tailwind CSS and shadcn/ui design system."
            />
          </section>

          {/* Instructions */}
          <section className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Try it out</h3>
            <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
              <li>
                Click the <strong>Search files...</strong> button in the header
              </li>
              <li>Type a query to see instant search results</li>
              <li>
                Click the <strong>AI Agent</strong> toggle to switch to chat
                mode
              </li>
              <li>
                Send a message to see streaming AI responses with tool calls
              </li>
              <li>Watch the custom tool renderers display search results</li>
            </ol>
          </section>
        </div>
      </main>

      {/* Search Command Dialog */}
      <SearchCommand
        open={open}
        onOpenChange={setOpen}
        onSearch={handleSearch}
        onResultSelect={handleResultSelect}
        placeholder="Search files..."
        enableAgentMode
        agentConfig={{
          apiEndpoint: "/api/search-agent",
          toolResultRenderers: toolRenderers,
          onToolAction: handleToolAction,
          header: {
            title: "AI Search Assistant",
            showBackButton: true,
            showClearButton: true,
          },
          input: {
            placeholder: "Ask me anything about the codebase...",
            streamingIcon: Brain,
            streamingText: (
              <span className="flex items-center">Analyzing...</span>
            ),
          },
        }}
        renderResult={(result, onSelect) => (
          <div
            onClick={onSelect}
            className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-accent"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
              <FileIcon fileType={result.metadata?.fileType} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{result.title}</div>
              <div className="line-clamp-1 text-sm text-muted-foreground">
                {result.snippet}
              </div>
              {result.metadata?.path && (
                <div className="mt-1 text-xs text-muted-foreground/70">
                  {result.metadata.path}
                </div>
              )}
            </div>
            {result.score !== undefined && (
              <div className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {Math.round(result.score * 100)}%
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FileIcon({ fileType }: { fileType?: string }) {
  const iconClass = "h-4 w-4";

  switch (fileType) {
    case "typescript":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
        </svg>
      );
    case "markdown":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.27 19.385H1.73A1.73 1.73 0 0 1 0 17.655V6.345a1.73 1.73 0 0 1 1.73-1.73h20.54A1.73 1.73 0 0 1 24 6.345v11.308a1.73 1.73 0 0 1-1.73 1.731zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.847zM21.232 12h-2.309V8.077h-2.307V12h-2.308l3.461 4.039z" />
        </svg>
      );
    case "json":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.759 3.975h1.783V5.76H5.759v4.458A1.783 1.783 0 0 1 3.976 12a1.783 1.783 0 0 1 1.783 1.783v4.458h1.783v1.784H5.759c-.954-.24-1.783-.803-1.783-1.783v-3.567a1.783 1.783 0 0 0-1.783-1.783H1.3v-1.783h.892a1.783 1.783 0 0 0 1.783-1.783V5.759c0-.98.83-1.543 1.783-1.784zm12.482 0c.954.24 1.783.803 1.783 1.783v3.567a1.783 1.783 0 0 0 1.783 1.783h.892v1.783h-.892a1.783 1.783 0 0 0-1.783 1.783v3.567c0 .98-.83 1.543-1.783 1.784h-1.783V18.24h1.783v-4.458A1.783 1.783 0 0 1 20.024 12a1.783 1.783 0 0 1-1.783-1.783V5.759h-1.783V3.975h1.783zM12 14.675a.892.892 0 1 1 0-1.783.892.892 0 0 1 0 1.783zm-3.567 0a.892.892 0 1 1 0-1.783.892.892 0 0 1 0 1.783zm7.133 0a.892.892 0 1 1 0-1.783.892.892 0 0 1 0 1.783z" />
        </svg>
      );
    default:
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
  }
}
