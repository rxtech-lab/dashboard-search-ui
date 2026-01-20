import { useRef, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowUp,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import type { UIMessage } from "ai";
import { Chat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useSearchAgent,
  type UseSearchAgentOptions,
} from "@/hooks/useSearchAgent";
import {
  MessageBubble,
  StreamingIndicator,
  type ToolResultRenderers,
  type ToolAction,
} from "./components";

/**
 * Header configuration for SearchAgent
 */
export interface SearchAgentHeaderConfig {
  /** Title text */
  title?: string;

  /** Icon component */
  icon?: ComponentType<{ className?: string }>;

  /** Show back button */
  showBackButton?: boolean;

  /** Show clear history button */
  showClearButton?: boolean;
}

/**
 * Input configuration for SearchAgent
 */
export interface SearchAgentInputConfig {
  /** Placeholder when ready for input */
  placeholder?: string;

  /** Placeholder when processing */
  placeholderProcessing?: string;

  /** Text or component shown in loading indicator while streaming (default: "Searching...") */
  streamingText?: ReactNode;

  /** Custom spinner icon for loading indicator, or null to hide it */
  streamingIcon?: ComponentType<{ className?: string }> | null;
}

/**
 * Props for the SearchAgent component
 */
export interface SearchAgentProps {
  /** Initial query to send on mount */
  initialQuery?: string;

  /** Initial messages to load */
  initialMessages?: UIMessage[];

  /** Called when messages change */
  onMessagesChange?: (messages: UIMessage[]) => void;

  /** API endpoint for the chat */
  apiEndpoint?: string;

  /** Custom Chat instance (overrides apiEndpoint) */
  chatInstance?: Chat<UIMessage>;

  /** Custom renderers for tool results */
  toolResultRenderers?: ToolResultRenderers;

  /** Called when a tool action occurs */
  onToolAction?: (action: ToolAction) => void;

  /** Custom message renderer (replaces entire MessageBubble) */
  renderMessage?: (props: {
    message: UIMessage;
    isUser: boolean;
    toolResultRenderers?: ToolResultRenderers;
    onToolAction?: (action: ToolAction) => void;
  }) => ReactNode;

  /** Custom user message content renderer */
  renderUserContent?: (content: string) => ReactNode;

  /** Custom assistant message content renderer */
  renderAssistantContent?: (content: string) => ReactNode;

  /** Custom streaming indicator */
  renderStreamingIndicator?: () => ReactNode;

  /** Navigation handler - replaces Next.js router dependency */
  onNavigate?: (path: string) => void;

  /** Called when back button is clicked */
  onBack?: () => void;

  /** Called when dialog should close */
  onClose?: () => void;

  /** Called when user clears history */
  onClearHistory?: () => void;

  /** Header configuration */
  header?: SearchAgentHeaderConfig;

  /** Input configuration */
  input?: SearchAgentInputConfig;

  /** Additional class name */
  className?: string;
}

/**
 * An AI-powered search agent component with streaming chat support.
 * Fully customizable with render props for messages, tools, and UI elements.
 *
 * @example
 * ```tsx
 * <SearchAgent
 *   initialQuery="Find all PDF documents"
 *   apiEndpoint="/api/search-agent"
 *   onBack={() => setMode("quick")}
 *   onClose={() => setOpen(false)}
 *   toolResultRenderers={{
 *     display_files: FileResultsRenderer,
 *   }}
 * />
 * ```
 */
export function SearchAgent({
  initialQuery = "",
  initialMessages,
  onMessagesChange,
  apiEndpoint = "/api/search-agent",
  chatInstance,
  toolResultRenderers = {},
  onToolAction,
  renderMessage,
  renderUserContent,
  renderAssistantContent,
  renderStreamingIndicator,
  onNavigate,
  onBack,
  onClose,
  onClearHistory,
  header = {},
  input: inputConfig = {},
  className,
}: SearchAgentProps) {
  const {
    title = "AI Search",
    icon: HeaderIcon = Sparkles,
    showBackButton = true,
    showClearButton = true,
  } = header;

  const {
    placeholder = "Ask a follow-up question...",
    placeholderProcessing = "Generating...",
    streamingText = "Searching...",
    streamingIcon,
  } = inputConfig;

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  // Wrap onToolAction to handle navigation
  const handleToolAction = (action: ToolAction) => {
    if (action.type === "navigate" && onNavigate) {
      onNavigate(action.payload as string);
      onClose?.();
    }
    onToolAction?.(action);
  };

  const hookOptions: UseSearchAgentOptions = {
    apiEndpoint,
    initialMessages,
    chatInstance,
    onMessagesChange,
    initialQuery,
  };

  const {
    messages,
    isProcessing,
    sendMessage,
    stop,
    hasContent,
  } = useSearchAgent(hookOptions);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input after processing
  useEffect(() => {
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isProcessing) {
        sendMessage(inputValue);
        setInputValue("");
      }
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim() && !isProcessing) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleClearHistory = () => {
    onClearHistory?.();
  };

  // Check if we should show loading indicator
  // Show when processing and waiting for assistant response
  const showLoadingIndicator = (() => {
    if (!isProcessing) return false;

    // If no messages, show loading
    if (messages.length === 0) return true;

    const lastMessage = messages[messages.length - 1];

    // If the last message is from user, show loading (waiting for assistant to respond)
    if (lastMessage.role === "user") return true;

    // If the last message is from assistant, show loading only if it has no content yet
    return !hasContent(lastMessage);
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn("flex flex-col h-full", className)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b pr-12">
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 px-2"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        <div className="flex items-center gap-2 text-sm font-medium flex-1">
          <HeaderIcon className="h-4 w-4 text-primary" />
          {title}
        </div>
        {showClearButton && onClearHistory && messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="h-8 px-2 text-muted-foreground hover:text-destructive"
            aria-label="Clear history"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 px-3">
        <div className="py-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => {
              // Skip empty assistant messages
              if (message.role === "assistant" && !hasContent(message)) {
                return null;
              }

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderMessage ? (
                    renderMessage({
                      message,
                      isUser: message.role === "user",
                      toolResultRenderers,
                      onToolAction: handleToolAction,
                    })
                  ) : (
                    <MessageBubble
                      message={message}
                      toolResultRenderers={toolResultRenderers}
                      onToolAction={handleToolAction}
                      renderUserContent={renderUserContent}
                      renderAssistantContent={renderAssistantContent}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading indicator */}
          <AnimatePresence>
            {showLoadingIndicator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStreamingIndicator ? (
                  renderStreamingIndicator()
                ) : (
                  <StreamingIndicator text={streamingText} loadingIcon={streamingIcon} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isProcessing ? placeholderProcessing : placeholder}
            disabled={isProcessing}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <AnimatePresence mode="wait" initial={false}>
            {isProcessing ? (
              <motion.div
                key="stop"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={stop}
                  className="h-6 w-6 p-0"
                  aria-label="Stop"
                >
                  <Square className="h-4 w-4 fill-current" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -90 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  className="h-6 w-6 p-0 rounded-full bg-primary hover:bg-primary/90"
                  aria-label="Send"
                >
                  <ArrowUp className="h-4 w-4 text-primary-foreground" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
