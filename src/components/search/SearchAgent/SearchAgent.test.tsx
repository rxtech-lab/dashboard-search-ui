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

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
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

  it("renders with default header", () => {
    render(<SearchAgent />);

    expect(screen.getByText("AI Search")).toBeInTheDocument();
  });

  it("renders back button when onBack is provided", () => {
    const onBack = vi.fn();
    render(<SearchAgent onBack={onBack} />);

    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalled();
  });

  it("does not render back button when onBack is not provided", () => {
    render(<SearchAgent />);

    expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
  });

  it("renders input field", () => {
    render(<SearchAgent />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("uses custom header title", () => {
    render(<SearchAgent header={{ title: "Custom AI Search" }} />);

    expect(screen.getByText("Custom AI Search")).toBeInTheDocument();
  });

  it("uses custom input placeholder", () => {
    render(<SearchAgent input={{ placeholder: "Custom placeholder..." }} />);

    expect(screen.getByPlaceholderText("Custom placeholder...")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<SearchAgent className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders clear button when messages exist and onClearHistory provided", async () => {
    const { useChat } = await import("@ai-sdk/react");
    (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "test" }] }],
      sendMessage: mockSendMessage,
      status: "ready",
      stop: mockStop,
      error: undefined,
      setMessages: mockSetMessages,
    });

    const onClearHistory = vi.fn();
    render(<SearchAgent onClearHistory={onClearHistory} />);

    const clearButton = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearButton);

    expect(onClearHistory).toHaveBeenCalled();
  });

  it("does not render clear button when no onClearHistory", async () => {
    const { useChat } = await import("@ai-sdk/react");
    (useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "test" }] }],
      sendMessage: mockSendMessage,
      status: "ready",
      stop: mockStop,
      error: undefined,
      setMessages: mockSetMessages,
    });

    render(<SearchAgent />);

    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });

  it("hides back button when showBackButton is false", () => {
    render(<SearchAgent onBack={() => {}} header={{ showBackButton: false }} />);

    expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
  });

  it("renders send button", () => {
    render(<SearchAgent />);

    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    render(<SearchAgent />);

    const sendButton = screen.getByRole("button", { name: /send/i });
    expect(sendButton).toBeDisabled();
  });
});
