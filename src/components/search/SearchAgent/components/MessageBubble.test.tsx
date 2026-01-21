import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageBubble } from "./MessageBubble";
import type { UIMessage } from "ai";

// Mock framer-motion to avoid animation issues in tests
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

describe("MessageBubble", () => {
  it("renders user message with correct styling", () => {
    const message: UIMessage = {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "Hello" }],
    };

    render(<MessageBubble message={message} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders assistant message", () => {
    const message: UIMessage = {
      id: "1",
      role: "assistant",
      parts: [{ type: "text", text: "Hi there!" }],
    };

    render(<MessageBubble message={message} />);

    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("renders tool call indicator", () => {
    const message: UIMessage = {
      id: "1",
      role: "assistant",
      parts: [
        {
          type: "tool-search_files",
          toolCallId: "tc1",
          state: "pending",
        } as never,
      ],
    };

    render(<MessageBubble message={message} />);

    expect(screen.getByText("Search Files")).toBeInTheDocument();
  });

  it("shows checkmark for completed tool calls", () => {
    const message: UIMessage = {
      id: "1",
      role: "assistant",
      parts: [
        {
          type: "tool-search_files",
          toolCallId: "tc1",
          state: "output-available",
        } as never,
      ],
    };

    render(<MessageBubble message={message} />);

    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("uses custom tool renderer when provided", () => {
    const message: UIMessage = {
      id: "1",
      role: "assistant",
      parts: [
        {
          type: "tool-custom_tool",
          toolCallId: "tc1",
          state: "output-available",
          output: { data: "test" },
        } as never,
      ],
    };

    const CustomRenderer = ({ output }: { output: unknown }) => (
      <div data-testid="custom-renderer">
        Custom: {(output as { data: string }).data}
      </div>
    );

    render(
      <MessageBubble
        message={message}
        toolResultRenderers={{ custom_tool: CustomRenderer }}
      />,
    );

    expect(screen.getByTestId("custom-renderer")).toBeInTheDocument();
    expect(screen.getByText("Custom: test")).toBeInTheDocument();
  });

  it("calls onToolAction when custom renderer triggers action", () => {
    const onToolAction = vi.fn();
    const message: UIMessage = {
      id: "1",
      role: "assistant",
      parts: [
        {
          type: "tool-action_tool",
          toolCallId: "tc1",
          state: "output-available",
          output: { id: 123 },
        } as never,
      ],
    };

    const ActionRenderer = ({
      onAction,
    }: {
      output: unknown;
      onAction?: (action: { type: string; payload: unknown }) => void;
    }) => (
      <button
        data-testid="action-button"
        onClick={() => onAction?.({ type: "click", payload: { id: 123 } })}
      >
        Click
      </button>
    );

    render(
      <MessageBubble
        message={message}
        toolResultRenderers={{ action_tool: ActionRenderer }}
        onToolAction={onToolAction}
      />,
    );

    fireEvent.click(screen.getByTestId("action-button"));
    expect(onToolAction).toHaveBeenCalledWith({
      type: "click",
      payload: { id: 123 },
    });
  });

  it("uses custom user content renderer", () => {
    const message: UIMessage = {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "Hello" }],
    };

    render(
      <MessageBubble
        message={message}
        renderUserContent={(content) => (
          <span data-testid="custom-user-content">{content.toUpperCase()}</span>
        )}
      />,
    );

    expect(screen.getByTestId("custom-user-content")).toHaveTextContent(
      "HELLO",
    );
  });

  it("uses custom assistant content renderer", () => {
    const message: UIMessage = {
      id: "1",
      role: "assistant",
      parts: [{ type: "text", text: "Hello" }],
    };

    render(
      <MessageBubble
        message={message}
        renderAssistantContent={(content) => (
          <span data-testid="custom-assistant-content">
            {content.toLowerCase()}
          </span>
        )}
      />,
    );

    expect(screen.getByTestId("custom-assistant-content")).toHaveTextContent(
      "hello",
    );
  });

  it("renders multiple text parts as joined content", () => {
    const message: UIMessage = {
      id: "1",
      role: "user",
      parts: [
        { type: "text", text: "Hello " },
        { type: "text", text: "World" },
      ],
    };

    render(<MessageBubble message={message} />);

    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const message: UIMessage = {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "Hello" }],
    };

    const { container } = render(
      <MessageBubble message={message} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
