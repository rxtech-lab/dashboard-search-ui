import { useEffect, useCallback, useMemo, useRef } from "react";
import { Chat, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";

/**
 * Tool call information extracted from a message part
 */
export interface ToolCallInfo {
  type: string;
  toolCallId?: string;
  state?: string;
  output?: unknown;
}

/**
 * Options for the useSearchAgent hook
 */
export interface UseSearchAgentOptions {
  /**
   * API endpoint for the chat. Required unless chatInstance is provided.
   */
  apiEndpoint?: string;

  /**
   * Initial messages to load
   */
  initialMessages?: UIMessage[];

  /**
   * Custom Chat instance (overrides apiEndpoint)
   */
  chatInstance?: Chat<UIMessage>;

  /**
   * Called when messages change
   */
  onMessagesChange?: (messages: UIMessage[]) => void;

  /**
   * Auto-send initial query on mount
   */
  initialQuery?: string;

  /**
   * Callback for tool calls
   */
  onToolCall?: (toolCall: { toolName: string; args: unknown }) => void;

  /**
   * Callback when assistant response finishes
   */
  onFinish?: (message: UIMessage) => void;

  /**
   * Callback on error
   */
  onError?: (error: Error) => void;
}

/**
 * Return type for useSearchAgent hook
 */
export interface UseSearchAgentReturn {
  /** Current messages */
  messages: UIMessage[];

  /** Current status */
  status: "ready" | "submitted" | "streaming" | "error";

  /** Whether a request is in progress */
  isProcessing: boolean;

  /** Current error if any */
  error: Error | undefined;

  /** Send a message */
  sendMessage: (text: string) => void;

  /** Stop the current generation */
  stop: () => void;

  /** Clear all messages */
  clearMessages: () => void;

  /** Set messages directly */
  setMessages: (
    messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[]),
  ) => void;

  /** The underlying Chat instance */
  chat: Chat<UIMessage>;

  /** Extract text content from a message */
  getTextContent: (message: UIMessage) => string;

  /** Extract tool calls from a message */
  getToolCalls: (message: UIMessage) => ToolCallInfo[];

  /** Check if message has displayable content */
  hasContent: (message: UIMessage) => boolean;

  /** Delete a message and all messages after it */
  deleteMessageAndAfter: (messageId: string) => void;

  /** Get message content by ID for editing */
  getMessageContent: (messageId: string) => string | undefined;
}

/**
 * A hook that wraps the AI SDK's useChat hook for search agent functionality.
 * Extracts common chat logic and provides utilities for working with messages.
 */
export function useSearchAgent(
  options: UseSearchAgentOptions = {},
): UseSearchAgentReturn {
  const {
    apiEndpoint = "/api/search-agent",
    initialMessages,
    chatInstance: providedChat,
    onMessagesChange,
    initialQuery,
    onToolCall,
    onFinish,
    onError,
  } = options;

  const initialQuerySent = useRef(false);

  // Create or use provided Chat instance
  const chat = useMemo(() => {
    if (providedChat) return providedChat;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatOptions: any = {
      transport: new DefaultChatTransport({ api: apiEndpoint }),
      messages: initialMessages,
    };

    if (onToolCall) {
      chatOptions.onToolCall = ({
        toolCall,
      }: {
        toolCall: { toolName: string; args?: unknown };
      }) => {
        onToolCall({
          toolName: toolCall.toolName,
          args: toolCall.args,
        });
      };
    }

    if (onFinish) {
      chatOptions.onFinish = ({ message }: { message: UIMessage }) => {
        onFinish(message);
      };
    }

    if (onError) {
      chatOptions.onError = (err: Error) => {
        onError(err);
      };
    }

    return new Chat(chatOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providedChat, apiEndpoint]); // Recreate if providedChat or apiEndpoint changes

  const {
    messages,
    sendMessage: baseSendMessage,
    status,
    error,
    setMessages,
  } = useChat({ chat });

  const isProcessing = status === "streaming" || status === "submitted";

  // Sync messages to parent
  useEffect(() => {
    if (onMessagesChange && messages.length > 0) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  // Auto-send initial query
  useEffect(() => {
    if (
      initialQuery &&
      !initialQuerySent.current &&
      status === "ready" &&
      (!initialMessages || initialMessages.length === 0)
    ) {
      initialQuerySent.current = true;
      baseSendMessage({ text: initialQuery });
    }
  }, [initialQuery, baseSendMessage, status, initialMessages]);

  // Wrapped sendMessage for simpler API
  const sendMessage = useCallback(
    (text: string) => {
      baseSendMessage({ text });
    },
    [baseSendMessage],
  );

  // Stop generation
  const stop = useCallback(() => {
    chat.stop();
  }, [chat]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  // Extract text content from a message
  const getTextContent = useCallback((message: UIMessage): string => {
    return message.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text",
      )
      .map((part) => part.text)
      .join("");
  }, []);

  // Extract tool calls from a message
  const getToolCalls = useCallback((message: UIMessage): ToolCallInfo[] => {
    return message.parts
      .filter((part) => part.type.startsWith("tool-"))
      .map((part) => {
        const toolPart = part as unknown as ToolCallInfo;
        return {
          type: toolPart.type,
          toolCallId: toolPart.toolCallId,
          state: toolPart.state,
          output: toolPart.output,
        };
      });
  }, []);

  // Check if message has displayable content
  const hasContent = useCallback(
    (message: UIMessage): boolean => {
      const textContent = getTextContent(message);
      const toolCalls = getToolCalls(message);
      return textContent.trim().length > 0 || toolCalls.length > 0;
    },
    [getTextContent, getToolCalls],
  );

  // Delete a message and all messages after it (for edit/retry flow)
  const deleteMessageAndAfter = useCallback(
    (messageId: string) => {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === messageId);
        if (idx === -1) return prev;
        return prev.slice(0, idx);
      });
    },
    [setMessages],
  );

  // Get message content by ID for editing
  const getMessageContent = useCallback(
    (messageId: string): string | undefined => {
      const message = messages.find((m) => m.id === messageId);
      return message ? getTextContent(message) : undefined;
    },
    [messages, getTextContent],
  );

  return {
    messages,
    status,
    isProcessing,
    error,
    sendMessage,
    stop,
    clearMessages,
    setMessages,
    chat,
    getTextContent,
    getToolCalls,
    hasContent,
    deleteMessageAndAfter,
    getMessageContent,
  };
}
