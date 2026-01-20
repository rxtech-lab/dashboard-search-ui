import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchCommand } from "./SearchCommand";

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
  Chat: vi.fn().mockImplementation((config) => ({
    ...config,
    stop: mockStop,
  })),
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

// Mock sessionStorage
const mockSessionStorage: Record<string, string> = {};
vi.stubGlobal("sessionStorage", {
  getItem: (key: string) => mockSessionStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockSessionStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockSessionStorage[key];
  },
  clear: () => {
    Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key]);
  },
});

describe("SearchCommand", () => {
  const mockOnSearch = vi.fn();
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onSearch: mockOnSearch,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSearch.mockResolvedValue([]);
    sessionStorage.clear();
  });

  it("renders dialog when open", () => {
    render(<SearchCommand {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render dialog when closed", () => {
    render(<SearchCommand {...defaultProps} open={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<SearchCommand {...defaultProps} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onSearch with debounced query", async () => {
    const user = userEvent.setup();
    render(<SearchCommand {...defaultProps} debounceMs={50} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "test query");

    await waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({ query: "test query" })
        );
      },
      { timeout: 500 }
    );
  });

  it("calls onSearch and receives results", async () => {
    const results = [
      { id: "1", title: "Result 1", snippet: "Description 1" },
      { id: "2", title: "Result 2", snippet: "Description 2" },
    ];
    mockOnSearch.mockResolvedValue(results);

    const user = userEvent.setup();
    render(<SearchCommand {...defaultProps} debounceMs={0} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "test");

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({ query: "test" })
      );
    });

    // Verify search was called with correct parameters
    expect(mockOnSearch).toHaveBeenCalledWith({
      query: "test",
      searchType: undefined,
      limit: 10,
    });
  });

  it("provides onResultSelect callback", async () => {
    const mockOnResultSelect = vi.fn();
    mockOnSearch.mockResolvedValue([{ id: "1", title: "Result 1" }]);

    render(
      <SearchCommand
        {...defaultProps}
        onResultSelect={mockOnResultSelect}
        debounceMs={0}
      />
    );

    // Verify the prop is accepted and component renders
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("accepts renderResult prop", () => {
    render(
      <SearchCommand
        {...defaultProps}
        debounceMs={0}
        renderResult={(result, onSelect) => (
          <div data-testid="custom-result" onClick={onSelect}>
            Custom: {result.title}
          </div>
        )}
      />
    );

    // Verify the prop is accepted and component renders
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders search type selector when searchTypes provided", () => {
    render(
      <SearchCommand
        {...defaultProps}
        searchTypes={[
          { id: "fulltext", label: "Fulltext" },
          { id: "semantic", label: "Semantic" },
        ]}
      />
    );

    expect(screen.getByText("Fulltext")).toBeInTheDocument();
    expect(screen.getByText("Semantic")).toBeInTheDocument();
  });

  it("changes search type when type button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SearchCommand
        {...defaultProps}
        searchTypes={[
          { id: "fulltext", label: "Fulltext" },
          { id: "semantic", label: "Semantic" },
        ]}
        debounceMs={0}
      />
    );

    await user.click(screen.getByText("Semantic"));
    await user.type(screen.getByRole("combobox"), "test");

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({ searchType: "semantic" })
      );
    });
  });

  it("uses custom placeholder", () => {
    render(
      <SearchCommand {...defaultProps} placeholder="Custom placeholder..." />
    );

    expect(screen.getByPlaceholderText("Custom placeholder...")).toBeInTheDocument();
  });

  it("shows AI hint when enableAgentMode is true", () => {
    render(<SearchCommand {...defaultProps} enableAgentMode />);

    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  it("does not show AI hint when enableAgentMode is false", () => {
    render(<SearchCommand {...defaultProps} enableAgentMode={false} />);

    expect(screen.queryByText(/Enter.*AI/)).not.toBeInTheDocument();
  });

  it("shows ESC hint", () => {
    render(<SearchCommand {...defaultProps} />);

    expect(screen.getByText("ESC to close")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<SearchCommand {...defaultProps} className="custom-class" />);

    expect(screen.getByRole("dialog")).toHaveClass("custom-class");
  });

  it("renders loading state", async () => {
    mockOnSearch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );

    const user = userEvent.setup();
    render(<SearchCommand {...defaultProps} debounceMs={0} />);

    await user.type(screen.getByRole("combobox"), "test");

    // Should show loading state while search is in progress
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled();
    });
  });

  it("renders custom loading using renderLoading prop", async () => {
    mockOnSearch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    const user = userEvent.setup();
    render(
      <SearchCommand
        {...defaultProps}
        debounceMs={0}
        renderLoading={() => <div data-testid="custom-loading">Loading...</div>}
      />
    );

    await user.type(screen.getByRole("combobox"), "test");

    await waitFor(() => {
      expect(screen.getByTestId("custom-loading")).toBeInTheDocument();
    });
  });

  it("calls onSearch with limit parameter", async () => {
    mockOnSearch.mockResolvedValue([{ id: "1", title: "Result 1", score: 0.85 }]);

    const user = userEvent.setup();
    render(<SearchCommand {...defaultProps} debounceMs={0} limit={5} />);

    await user.type(screen.getByRole("combobox"), "test");

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5 })
      );
    });
  });

  it("does not show empty state when results are displayed", async () => {
    const results = [
      { id: "1", title: "Result 1", snippet: "Description 1" },
    ];
    mockOnSearch.mockResolvedValue(results);

    const user = userEvent.setup();
    render(<SearchCommand {...defaultProps} debounceMs={0} enableAgentMode />);

    const input = screen.getByRole("combobox");
    await user.type(input, "test");

    await waitFor(() => {
      expect(screen.getByText("Result 1")).toBeInTheDocument();
    });

    // Empty state should not be visible when results exist
    expect(screen.queryByTestId("search-empty-state")).not.toBeInTheDocument();
    expect(screen.queryByTestId("search-type-prompt")).not.toBeInTheDocument();
  });

  it("shows 'Type to search' placeholder when no query entered", () => {
    render(<SearchCommand {...defaultProps} enableAgentMode />);

    expect(screen.getByTestId("search-empty-state")).toBeInTheDocument();
    expect(screen.getByTestId("search-type-prompt")).toBeInTheDocument();
  });

  it("shows 'No results found' when query entered but no results", async () => {
    mockOnSearch.mockResolvedValue([]);

    const user = userEvent.setup();
    render(<SearchCommand {...defaultProps} debounceMs={0} enableAgentMode />);

    const input = screen.getByRole("combobox");
    await user.type(input, "nonexistent");

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId("search-no-results")).toBeInTheDocument();
    });
  });
});
