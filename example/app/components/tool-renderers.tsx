"use client";

import {
  FileResultCard,
  type ToolResultRendererProps,
  type ToolResultRenderers,
} from "@rx-lab/dashboard-searching-ui";
import { FileText, Search, FolderOpen } from "lucide-react";

// Types for tool outputs
interface SearchFilesOutput {
  query: string;
  results: Array<{
    id: string;
    title: string;
    snippet: string;
    score: number;
  }>;
}

interface DisplayResultsOutput {
  files: Array<{
    id: string;
    title: string;
    fileType: string;
    mimeType: string;
    folderName: string;
  }>;
}

// Custom renderer for search_files tool
function SearchFilesRenderer({ output, onAction }: ToolResultRendererProps) {
  const data = output as SearchFilesOutput;

  if (!data?.results?.length) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center text-sm text-muted-foreground">
        No results found for &quot;{data?.query}&quot;
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Search className="h-3 w-3" />
        <span>
          Found {data.results.length} results for &quot;{data.query}&quot;
        </span>
      </div>
      <div className="space-y-1">
        {data.results.map((result) => (
          <div
            key={result.id}
            className="group flex cursor-pointer items-start gap-3 rounded-md border bg-card p-3 transition-colors hover:bg-accent"
            onClick={() =>
              onAction?.({ type: "navigate", payload: `/files/${result.id}` })
            }
          >
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{result.title}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {Math.round(result.score * 100)}%
                </span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {result.snippet}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom renderer for display_results tool
function DisplayResultsRenderer({ output, onAction }: ToolResultRendererProps) {
  const data = output as DisplayResultsOutput;

  if (!data?.files?.length) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center text-sm text-muted-foreground">
        <FolderOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
        No files to display
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        Displaying {data.files.length} files:
      </div>
      <div className="grid gap-2">
        {data.files.map((file) => (
          <FileResultCard
            key={file.id}
            file={file}
            onClick={() =>
              onAction?.({ type: "navigate", payload: `/files/${file.id}` })
            }
            renderIcon={(fileType) => {
              return <FileText className="h-4 w-4 text-blue-500" />;
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Export the tool renderers map
export const toolRenderers: ToolResultRenderers = {
  search_files: SearchFilesRenderer,
  display_results: DisplayResultsRenderer,
};
