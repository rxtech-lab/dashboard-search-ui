import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSearchAgent } from "./useSearchAgent";

// Mock AI SDK
const mockSendMessage = vi.fn();
const mockStop = vi.fn();
const mockSetMessages = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(() => ({
    messages: [],
    sendMessage: mockSendMessage,
    status: "ready",
    stop: mockStop,
    error: undefined,
    setMessages: mockSetMessages,
  })),
  Chat: vi.fn().mockImplementation(function (
    this: Record<string, unknown>,
    config: Record<string, unknown>,
  ) {
    Object.assign(this, config);
    this.stop = mockStop;
  }),
}));

describe("useSearchAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns initial state", () => {
    const { result } = renderHook(() => useSearchAgent());

    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe("ready");
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("provides sendMessage function", () => {
    const { result } = renderHook(() => useSearchAgent());

    act(() => {
      result.current.sendMessage("Hello");
    });

    expect(mockSendMessage).toHaveBeenCalledWith({ text: "Hello" });
  });

  it("provides stop function", () => {
    const { result } = renderHook(() => useSearchAgent());

    act(() => {
      result.current.stop();
    });

    expect(mockStop).toHaveBeenCalled();
  });

  it("provides clearMessages function", () => {
    const { result } = renderHook(() => useSearchAgent());

    act(() => {
      result.current.clearMessages();
    });

    expect(mockSetMessages).toHaveBeenCalledWith([]);
  });

  it("extracts text content from message", () => {
    const { result } = renderHook(() => useSearchAgent());

    const message = {
      id: "1",
      role: "user" as const,
      parts: [
        { type: "text" as const, text: "Hello " },
        { type: "text" as const, text: "World" },
      ],
    };

    expect(result.current.getTextContent(message)).toBe("Hello World");
  });

  it("extracts tool calls from message", () => {
    const { result } = renderHook(() => useSearchAgent());

    const message = {
      id: "1",
      role: "assistant" as const,
      parts: [
        {
          type: "tool-search_files",
          toolCallId: "tc1",
          state: "output-available",
          output: { files: [] },
        },
        { type: "text" as const, text: "Results found" },
      ],
    };

    const toolCalls = result.current.getToolCalls(message);

    expect(toolCalls).toHaveLength(1);
    expect(toolCalls[0].type).toBe("tool-search_files");
    expect(toolCalls[0].state).toBe("output-available");
  });

  it("checks if message has content", () => {
    const { result } = renderHook(() => useSearchAgent());

    const messageWithText = {
      id: "1",
      role: "user" as const,
      parts: [{ type: "text" as const, text: "Hello" }],
    };

    const messageWithTool = {
      id: "2",
      role: "assistant" as const,
      parts: [{ type: "tool-search_files", toolCallId: "tc1" }],
    };

    const emptyMessage = {
      id: "3",
      role: "assistant" as const,
      parts: [{ type: "text" as const, text: "   " }],
    };

    expect(result.current.hasContent(messageWithText)).toBe(true);
    expect(result.current.hasContent(messageWithTool)).toBe(true);
    expect(result.current.hasContent(emptyMessage)).toBe(false);
  });

  it("uses custom apiEndpoint", async () => {
    const { Chat } = await import("@ai-sdk/react");

    renderHook(() => useSearchAgent({ apiEndpoint: "/custom/endpoint" }));

    expect(Chat).toHaveBeenCalled();
  });

  it("calls onMessagesChange when messages update", async () => {
    const onMessagesChange = vi.fn();
    const { useChat } = await import("@ai-sdk/react");

    (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      messages: [{ id: "1", role: "user", parts: [] }],
      sendMessage: mockSendMessage,
      status: "ready",
      stop: mockStop,
      error: undefined,
      setMessages: mockSetMessages,
    });

    renderHook(() => useSearchAgent({ onMessagesChange }));

    await waitFor(() => {
      expect(onMessagesChange).toHaveBeenCalled();
    });
  });

  it("calculates isProcessing correctly for streaming status", async () => {
    const { useChat } = await import("@ai-sdk/react");

    (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: "streaming",
      stop: mockStop,
      error: undefined,
      setMessages: mockSetMessages,
    });

    const { result } = renderHook(() => useSearchAgent());

    expect(result.current.isProcessing).toBe(true);
  });

  it("calculates isProcessing correctly for submitted status", async () => {
    const { useChat } = await import("@ai-sdk/react");

    (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: "submitted",
      stop: mockStop,
      error: undefined,
      setMessages: mockSetMessages,
    });

    const { result } = renderHook(() => useSearchAgent());

    expect(result.current.isProcessing).toBe(true);
  });
});
