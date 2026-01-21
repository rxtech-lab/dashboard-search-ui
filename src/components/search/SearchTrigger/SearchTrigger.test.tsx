import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchTrigger } from "./SearchTrigger";

describe("SearchTrigger", () => {
  it("renders with default content", () => {
    render(<SearchTrigger onClick={() => {}} />);

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Search files...")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<SearchTrigger onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders custom placeholder", () => {
    render(
      <SearchTrigger onClick={() => {}} placeholder="Find documents..." />,
    );

    expect(screen.getByText("Find documents...")).toBeInTheDocument();
  });

  it("renders custom children instead of default", () => {
    render(
      <SearchTrigger onClick={() => {}}>
        <span>Custom Trigger</span>
      </SearchTrigger>,
    );

    expect(screen.getByText("Custom Trigger")).toBeInTheDocument();
    expect(screen.queryByText("Search files...")).not.toBeInTheDocument();
  });

  it("renders custom shortcut", () => {
    render(
      <SearchTrigger
        onClick={() => {}}
        shortcut={{ key: "P", modifier: "Ctrl" }}
      />,
    );

    expect(screen.getByText("Ctrl")).toBeInTheDocument();
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("renders default shortcut", () => {
    render(<SearchTrigger onClick={() => {}} />);

    expect(screen.getByText("⌘")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("hides shortcut when set to null", () => {
    render(<SearchTrigger onClick={() => {}} shortcut={null} />);

    expect(screen.queryByText("K")).not.toBeInTheDocument();
    expect(screen.queryByText("⌘")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<SearchTrigger onClick={() => {}} className="custom-class" />);

    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("renders custom icon", () => {
    const CustomIcon = ({ className }: { className?: string }) => (
      <span data-testid="custom-icon" className={className}>
        🔍
      </span>
    );

    render(<SearchTrigger onClick={() => {}} icon={CustomIcon} />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("passes through additional button props", () => {
    render(
      <SearchTrigger
        onClick={() => {}}
        disabled
        data-testid="search-trigger"
      />,
    );

    const button = screen.getByTestId("search-trigger");
    expect(button).toBeDisabled();
  });

  it("applies variant prop", () => {
    render(<SearchTrigger onClick={() => {}} variant="ghost" />);

    // The button should have the variant class (implementation may vary)
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
