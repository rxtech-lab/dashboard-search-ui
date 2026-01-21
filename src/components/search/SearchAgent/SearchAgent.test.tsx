import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchAgent } from "./SearchAgent";

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
  Chat: vi.fn().mockImplementation(function (this: Record<string, unknown>, config: Record<string, unknown>) {
    Object.assign(this, config);
    this.stop = mockStop;
  }),
}));

// Mock Radix tooltip
vi.mock("@radix-ui/react-tooltip", () => ({
  Provider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  Root: ({ children }: React.PropsWithChildren) => <>{children}</>,
  Trigger: ({ children, asChild }: React.PropsWithChildren<{ asChild?: boolean }>) => {
    if (asChild && React.isValidElement(children)) {
      return children;
    }
    return <span>{children}</span>;
  },
  Portal: ({ children }: React.PropsWithChildren) => <>{children}</>,
  Content: ({ children }: React.PropsWithChildren) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  Arrow: () => null,
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    span: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <span {...props}>{children}</span>
    ),
    button: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("SearchAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic rendering", () => {
    it("renders with default props", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent />);
      expect(screen.getByText("AI Search")).toBeInTheDocument();
    });

    it("renders custom title", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent header={{ title: "Custom Search" }} />);
      expect(screen.getByText("Custom Search")).toBeInTheDocument();
    });

    it("shows back button when onBack is provided", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      const onBack = vi.fn();
      render(<SearchAgent onBack={onBack} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      expect(backButton).toBeInTheDocument();

      fireEvent.click(backButton);
      expect(onBack).toHaveBeenCalled();
    });

    it("hides back button when header.showBackButton is false", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(
        <SearchAgent
          onBack={() => {}}
          header={{ showBackButton: false }}
        />
      );

      expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
    });
  });

  describe("message display", () => {
    it("renders user messages", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] },
        ],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent />);
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    it("renders assistant messages", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [
          { id: "1", role: "assistant", parts: [{ type: "text", text: "Hi there!" }] },
        ],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent />);
      expect(screen.getByText("Hi there!")).toBeInTheDocument();
    });
  });

  describe("sending messages", () => {
    it("sends message when pressing enter", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "test message" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockSendMessage).toHaveBeenCalledWith({ text: "test message" });
    });

    it("does not send empty messages", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent />);

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("shows loading indicator when processing", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "test" }] },
        ],
        sendMessage: mockSendMessage,
        status: "streaming",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent />);
      expect(screen.getByText("Searching...")).toBeInTheDocument();
    });

    it("shows custom streaming text", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "test" }] },
        ],
        sendMessage: mockSendMessage,
        status: "streaming",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent input={{ streamingText: "Thinking..." }} />);
      expect(screen.getByText("Thinking...")).toBeInTheDocument();
    });
  });

  describe("message actions - regenerate", () => {
    it("renders action buttons by default", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "test message" }] }],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent />);

      // Action buttons should be rendered (they're hidden until hover but present in DOM)
      expect(screen.getByTestId("action-copy")).toBeInTheDocument();
      expect(screen.getByTestId("action-regenerate")).toBeInTheDocument();
    });

    it("does not render action buttons when enableMessageActions is false", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "test message" }] }],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent enableMessageActions={false} />);

      expect(screen.queryByTestId("action-copy")).not.toBeInTheDocument();
      expect(screen.queryByTestId("action-regenerate")).not.toBeInTheDocument();
    });

    it("regenerate user message - removes messages and resends", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "original query" }] },
          { id: "2", role: "assistant", parts: [{ type: "text", text: "response" }] },
        ],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      const onMessageRegenerate = vi.fn();
      render(<SearchAgent onMessageRegenerate={onMessageRegenerate} />);

      // Click the first regenerate button (for user message)
      const regenerateButtons = screen.getAllByTestId("action-regenerate");
      fireEvent.click(regenerateButtons[0]);

      // Should call onMessageRegenerate
      expect(onMessageRegenerate).toHaveBeenCalledWith("1", "original query");

      // Should call setMessages to remove messages
      expect(mockSetMessages).toHaveBeenCalled();

      // Should resend the user message
      expect(mockSendMessage).toHaveBeenCalledWith({ text: "original query" });
    });

    it("regenerate assistant message - regenerates response", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "user query" }] },
          { id: "2", role: "assistant", parts: [{ type: "text", text: "assistant response" }] },
        ],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      const onMessageRegenerate = vi.fn();
      render(<SearchAgent onMessageRegenerate={onMessageRegenerate} />);

      // Click the second regenerate button (for assistant message)
      const regenerateButtons = screen.getAllByTestId("action-regenerate");
      fireEvent.click(regenerateButtons[1]);

      // Should call onMessageRegenerate with the user message content
      expect(onMessageRegenerate).toHaveBeenCalledWith("2", "user query");

      // Should call setMessages
      expect(mockSetMessages).toHaveBeenCalled();

      // Should resend the preceding user message
      expect(mockSendMessage).toHaveBeenCalledWith({ text: "user query" });
    });

    it("regenerate in follow-up conversation - keeps earlier messages", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "first query" }] },
          { id: "2", role: "assistant", parts: [{ type: "text", text: "first response" }] },
          { id: "3", role: "user", parts: [{ type: "text", text: "follow-up query" }] },
          { id: "4", role: "assistant", parts: [{ type: "text", text: "follow-up response" }] },
        ],
        sendMessage: mockSendMessage,
        status: "ready",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      const onMessageRegenerate = vi.fn();
      render(<SearchAgent onMessageRegenerate={onMessageRegenerate} />);

      // Click regenerate on the second user message
      const regenerateButtons = screen.getAllByTestId("action-regenerate");
      fireEvent.click(regenerateButtons[2]); // Third button is for follow-up query

      expect(onMessageRegenerate).toHaveBeenCalledWith("3", "follow-up query");

      // Verify setMessages keeps first 2 messages
      const setMessagesCall = mockSetMessages.mock.calls[0][0];
      const testMessages = [
        { id: "1", role: "user", parts: [{ type: "text", text: "first query" }] },
        { id: "2", role: "assistant", parts: [{ type: "text", text: "first response" }] },
        { id: "3", role: "user", parts: [{ type: "text", text: "follow-up query" }] },
        { id: "4", role: "assistant", parts: [{ type: "text", text: "follow-up response" }] },
      ];
      const result = setMessagesCall(testMessages);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");

      // Should resend the follow-up query
      expect(mockSendMessage).toHaveBeenCalledWith({ text: "follow-up query" });
    });

    it("disables regenerate button when processing", async () => {
      const { useChat } = await import("@ai-sdk/react");
      (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
        messages: [
          { id: "1", role: "user", parts: [{ type: "text", text: "user query" }] },
        ],
        sendMessage: mockSendMessage,
        status: "streaming",
        stop: mockStop,
        error: undefined,
        setMessages: mockSetMessages,
      });

      render(<SearchAgent />);

      const regenerateButton = screen.getByTestId("action-regenerate");
      expect(regenerateButton).toBeDisabled();
    });
  });
});
