import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, MessageSquare } from "lucide-react";
import type { UIMessage } from "ai";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SearchAgent, type SearchAgentProps } from "../SearchAgent";

/**
 * Generic search result type
 */
export interface BaseSearchResult<T = unknown> {
  /** Unique identifier */
  id: string | number;

  /** Display title */
  title: string;

  /** Optional snippet/description */
  snippet?: string;

  /** Relevance score (0-1) */
  score?: number;

  /** Additional metadata */
  metadata?: T;
}

/**
 * Search type configuration
 */
export interface SearchTypeConfig {
  /** Unique identifier */
  id: string;

  /** Display label */
  label: string;
}

/**
 * Search parameters passed to onSearch
 */
export interface SearchParams {
  query: string;
  searchType?: string;
  limit?: number;
}

/**
 * Props for the SearchCommand component
 */
export interface SearchCommandProps<
  TResult extends BaseSearchResult = BaseSearchResult,
> {
  /** Whether the dialog is open */
  open: boolean;

  /** Callback to change open state */
  onOpenChange: (open: boolean) => void;

  /**
   * Search function - called with debounced query.
   * Can be a server action, API call, or any async function.
   */
  onSearch: (params: SearchParams) => Promise<TResult[]>;

  /** Called when user selects a result */
  onResultSelect?: (result: TResult) => void;

  /** Available search types */
  searchTypes?: SearchTypeConfig[];

  /** Default search type ID */
  defaultSearchType?: string;

  /** Debounce delay in ms */
  debounceMs?: number;

  /** Max results to fetch */
  limit?: number;

  /** Custom result item renderer */
  renderResult?: (result: TResult, onSelect: () => void) => ReactNode;

  /** Custom empty state renderer */
  renderEmpty?: (query: string, hasResults: boolean) => ReactNode;

  /** Custom loading renderer */
  renderLoading?: () => ReactNode;

  /** Enable AI agent mode */
  enableAgentMode?: boolean;

  /** Agent configuration (required if enableAgentMode is true) */
  agentConfig?: Partial<SearchAgentProps>;

  /** Storage key for session persistence (null to disable) */
  chatHistoryStorageKey?: string | null;

  /** Dialog placeholder */
  placeholder?: string;

  /** Show search type selector */
  showSearchTypeSelector?: boolean;

  /** Dialog class name */
  className?: string;
}

/**
 * A search command dialog with optional AI agent mode.
 * Supports custom search functions, result rendering, and search type selection.
 *
 * @example
 * ```tsx
 * <SearchCommand
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSearch={async ({ query, searchType, limit }) => {
 *     const results = await searchAPI(query, { type: searchType, limit });
 *     return results;
 *   }}
 *   onResultSelect={(result) => {
 *     router.push(`/files/${result.id}`);
 *   }}
 *   enableAgentMode
 *   agentConfig={{ apiEndpoint: "/api/search-agent" }}
 * />
 * ```
 */
export function SearchCommand<
  TResult extends BaseSearchResult = BaseSearchResult,
>({
  open,
  onOpenChange,
  onSearch,
  onResultSelect,
  searchTypes,
  defaultSearchType,
  debounceMs = 300,
  limit = 10,
  renderResult,
  renderEmpty,
  renderLoading,
  enableAgentMode = false,
  agentConfig = {},
  chatHistoryStorageKey = "search-chat-history",
  placeholder = "Search... (Press Enter for AI search)",
  showSearchTypeSelector = true,
  className,
}: SearchCommandProps<TResult>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState(
    defaultSearchType || searchTypes?.[0]?.id || "",
  );
  const [mode, setMode] = useState<"quick" | "agent">("quick");
  const [agentQuery, setAgentQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Chat history persistence
  const [chatHistory, setChatHistoryState] = useState<UIMessage[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (chatHistoryStorageKey) {
      const stored = sessionStorage.getItem(chatHistoryStorageKey);
      if (stored) {
        try {
          setChatHistoryState(JSON.parse(stored));
        } catch {
          // Ignore parse errors
        }
      }
    }
    setIsHydrated(true);
  }, [chatHistoryStorageKey]);

  // Save to sessionStorage
  const setChatHistory = useCallback(
    (messages: UIMessage[]) => {
      setChatHistoryState(messages);
      if (chatHistoryStorageKey) {
        sessionStorage.setItem(chatHistoryStorageKey, JSON.stringify(messages));
      }
    },
    [chatHistoryStorageKey],
  );

  const hasChatHistory = isHydrated && chatHistory.length > 0;

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await onSearch({
          query: searchQuery,
          searchType: searchType || undefined,
          limit,
        });
        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onSearch, searchType, limit],
  );

  // Debounce effect - only in quick mode
  useEffect(() => {
    if (mode !== "quick") return;

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch, mode, debounceMs]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setMode("quick");
      setAgentQuery("");
    }
  }, [open]);

  const handleSelect = (result: TResult) => {
    onResultSelect?.(result);
    onOpenChange(false);
  };

  const handleEnterPress = () => {
    if (query.trim() && mode === "quick" && enableAgentMode) {
      setChatHistory([]);
      setAgentQuery(query);
      setMode("agent");
    }
  };

  const handleResumeChat = () => {
    setAgentQuery("");
    setMode("agent");
  };

  const handleClearChatHistory = () => {
    setChatHistory([]);
    // Stay in agent mode - don't switch back to quick mode
  };

  const handleMessagesChange = useCallback(
    (messages: UIMessage[]) => {
      setChatHistory(messages);
    },
    [setChatHistory],
  );

  const handleBackToQuick = () => {
    setMode("quick");
    setAgentQuery("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Default result renderer
  const defaultRenderResult = (result: TResult, onSelect: () => void) => (
    <CommandItem
      key={result.id}
      value={String(result.id)}
      onSelect={onSelect}
      className="cursor-pointer"
    >
      <div className="flex items-start gap-3 w-full">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{result.title}</p>
          {result.snippet && (
            <p className="text-xs text-muted-foreground truncate">
              {result.snippet}
            </p>
          )}
        </div>
        {result.score !== undefined && result.score > 0 && (
          <Badge variant="secondary" className="text-xs">
            {(result.score * 100).toFixed(0)}%
          </Badge>
        )}
      </div>
    </CommandItem>
  );

  // Default empty renderer - only called when there are no results
  const defaultRenderEmpty = (currentQuery: string) => (
    <CommandEmpty data-testid="search-empty-state">
      {currentQuery ? (
        <div className="space-y-2 py-4">
          <p data-testid="search-no-results">No results found.</p>
          {enableAgentMode && (
            <button
              onClick={handleEnterPress}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Sparkles className="h-4 w-4" />
              Try AI search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 py-4">
          <p data-testid="search-type-prompt">Type to search...</p>
          {enableAgentMode && (
            <p className="text-xs text-muted-foreground">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                Enter
              </kbd>{" "}
              for AI-powered search
            </p>
          )}
        </div>
      )}
    </CommandEmpty>
  );

  // Default loading renderer
  const defaultRenderLoading = () => (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className={cn("max-w-2xl! overflow-hidden ", className)}
      shouldFilter={false}
      showCloseButton
    >
      <AnimatePresence mode="wait" initial={false}>
        {mode === "quick" ? (
          <motion.div
            key="quick-search"
            initial={{ opacity: 0, x: -30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col"
          >
            <CommandInput
              ref={inputRef}
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim() && enableAgentMode) {
                  e.preventDefault();
                  handleEnterPress();
                }
              }}
            />
            <CommandList>
              {isLoading ? (
                (renderLoading || defaultRenderLoading)()
              ) : (
                <>
                  {results.length === 0 &&
                    (renderEmpty
                      ? renderEmpty(query, false)
                      : defaultRenderEmpty(query))}

                  {results.length > 0 && (
                    <CommandGroup heading="Results">
                      {results.map((result) =>
                        renderResult
                          ? renderResult(result, () => handleSelect(result))
                          : defaultRenderResult(result, () =>
                              handleSelect(result),
                            ),
                      )}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>

            {/* Footer */}
            <div className="border-t p-2 flex items-center justify-between">
              {/* Search type selector */}
              {showSearchTypeSelector &&
                searchTypes &&
                searchTypes.length > 0 && (
                  <div className="flex items-center gap-2">
                    {searchTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSearchType(type.id)}
                        className={cn(
                          "px-2 py-1 text-xs rounded-md transition-colors",
                          searchType === type.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80",
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}

              {/* Right side hints */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
                {enableAgentMode && hasChatHistory && (
                  <button
                    onClick={handleResumeChat}
                    className="flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Resume Chat
                  </button>
                )}
                {enableAgentMode && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                      Enter
                    </kbd>
                    AI
                  </span>
                )}
                <span>ESC to close</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="agent-search"
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="h-[min(600px,80vh)]"
          >
            <SearchAgent
              initialQuery={agentQuery}
              initialMessages={chatHistory}
              onMessagesChange={handleMessagesChange}
              onClearHistory={handleClearChatHistory}
              onBack={handleBackToQuick}
              onClose={handleClose}
              {...agentConfig}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </CommandDialog>
  );
}
