import type { ReactNode, ComponentType } from "react";
import { motion } from "framer-motion";
import { User, Bot, Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import type { ToolCallInfo } from "@/hooks/useSearchAgent";

/**
 * Tool action that can be triggered from a tool result
 */
export interface ToolAction {
  type: string;
  payload: unknown;
}

/**
 * Props passed to custom tool result renderers
 */
export interface ToolResultRendererProps {
  output: unknown;
  toolCallId?: string;
  onAction?: (action: ToolAction) => void;
}

/**
 * Map of tool names to their custom renderers
 */
export type ToolResultRenderers = {
  [toolName: string]: ComponentType<ToolResultRendererProps>;
};

/**
 * Props for the MessageBubble component
 */
export interface MessageBubbleProps {
  /** The message to render */
  message: UIMessage;

  /** Custom renderers for tool results, keyed by tool name */
  toolResultRenderers?: ToolResultRenderers;

  /** Handler for tool actions */
  onToolAction?: (action: ToolAction) => void;

  /** Custom user message content renderer */
  renderUserContent?: (content: string) => ReactNode;

  /** Custom assistant message content renderer */
  renderAssistantContent?: (content: string) => ReactNode;

  /** Custom user avatar icon */
  userIcon?: ComponentType<{ className?: string }>;

  /** Custom bot avatar icon */
  botIcon?: ComponentType<{ className?: string }>;

  /** Additional class name */
  className?: string;
}

/**
 * A message bubble component for displaying chat messages.
 * Supports custom rendering of user/assistant content and tool results.
 */
export function MessageBubble({
  message,
  toolResultRenderers = {},
  onToolAction,
  renderUserContent,
  renderAssistantContent,
  userIcon: UserIcon = User,
  botIcon: BotIcon = Bot,
  className,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Extract text content from parts
  const textContent = message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("");

  // Extract tool calls from parts
  const toolCalls = message.parts
    .filter((part) => part.type.startsWith("tool-"))
    .map((part) => {
      const toolPart = part as unknown as ToolCallInfo & { output?: unknown };
      return {
        type: toolPart.type,
        toolCallId: toolPart.toolCallId,
        state: toolPart.state,
        output: toolPart.output,
      };
    });

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse", className)}>
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? (
          <UserIcon className="h-4 w-4" />
        ) : (
          <BotIcon className="h-4 w-4" />
        )}
      </div>

      <div className={cn("flex-1 space-y-3", isUser && "text-right")}>
        {/* Tool calls indicator */}
        {!isUser && toolCalls.length > 0 && (
          <div className="space-y-2">
            {toolCalls.map((tool, idx) => {
              // Extract tool name from type (e.g., "tool-search_files" -> "search_files")
              const toolName = tool.type.replace("tool-", "");
              const ToolRenderer = toolResultRenderers[toolName];

              // If we have a custom renderer and output is available, use it
              if (
                ToolRenderer &&
                tool.state === "output-available" &&
                tool.output
              ) {
                return (
                  <div key={`${tool.toolCallId || idx}-${idx}`}>
                    <ToolRenderer
                      output={tool.output}
                      toolCallId={tool.toolCallId}
                      onAction={onToolAction}
                    />
                  </div>
                );
              }

              // Default tool indicator
              return (
                <motion.div
                  key={`${tool.toolCallId || idx}-${idx}`}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-xs w-fit"
                >
                  {tool.state === "output-available" ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  )}
                  <span className="text-muted-foreground">
                    {formatToolName(toolName)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Message content */}
        {textContent && (
          <div
            className={cn(
              "inline-block px-4 py-2 rounded-2xl text-sm max-w-[85%]",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-md"
                : "bg-muted rounded-tl-md text-left",
            )}
          >
            {isUser ? (
              renderUserContent ? (
                renderUserContent(textContent)
              ) : (
                <div className="whitespace-pre-wrap">{textContent}</div>
              )
            ) : renderAssistantContent ? (
              renderAssistantContent(textContent)
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                <Markdown>{textContent}</Markdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format a tool name for display (e.g., "search_files" -> "Search Files")
 */
function formatToolName(toolName: string): string {
  return toolName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
