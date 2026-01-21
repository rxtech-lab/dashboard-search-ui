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
    <div
      className={cn(
        "sui:flex sui:gap-3",
        isUser && "sui:flex-row-reverse",
        className,
      )}
    >
      <div
        className={cn(
          "sui:flex-shrink-0 sui:w-8 sui:h-8 sui:rounded-full sui:flex sui:items-center sui:justify-center",
          isUser
            ? "sui:bg-primary sui:text-primary-foreground"
            : "sui:bg-muted",
        )}
      >
        {isUser ? (
          <UserIcon className="sui:h-4 sui:w-4" />
        ) : (
          <BotIcon className="sui:h-4 sui:w-4" />
        )}
      </div>

      <div
        className={cn("sui:flex-1 sui:space-y-3", isUser && "sui:text-right")}
      >
        {/* Tool calls indicator */}
        {!isUser && toolCalls.length > 0 && (
          <div className="sui:space-y-2">
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
                  className="sui:flex sui:items-center sui:gap-2 sui:px-3 sui:py-1.5 sui:rounded-lg sui:bg-muted/50 sui:text-xs sui:w-fit"
                >
                  {tool.state === "output-available" ? (
                    <span className="sui:text-green-500">✓</span>
                  ) : (
                    <Loader2 className="sui:h-3 sui:w-3 sui:animate-spin sui:text-primary" />
                  )}
                  <span className="sui:text-muted-foreground">
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
              "sui:inline-block sui:px-4 sui:py-2 sui:rounded-2xl sui:text-sm sui:max-w-[85%]",
              isUser
                ? "sui:bg-primary sui:text-primary-foreground sui:rounded-tr-md"
                : "sui:bg-muted sui:rounded-tl-md sui:text-left",
            )}
          >
            {isUser ? (
              renderUserContent ? (
                renderUserContent(textContent)
              ) : (
                <div className="sui:whitespace-pre-wrap">{textContent}</div>
              )
            ) : renderAssistantContent ? (
              renderAssistantContent(textContent)
            ) : (
              <div className="sui:prose sui:prose-sm sui:dark:prose-invert sui:max-w-none sui:break-words prose-p:sui:my-1 prose-ul:sui:my-1 prose-ol:sui:my-1 prose-li:sui:my-0.5">
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
