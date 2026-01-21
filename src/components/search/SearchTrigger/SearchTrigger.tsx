import type { ComponentType, ReactNode, ButtonHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Keyboard shortcut configuration
 */
export interface ShortcutConfig {
  /** The key to display (e.g., "K") */
  key: string;
  /** The modifier key (e.g., "⌘" or "Ctrl") */
  modifier?: string;
}

/**
 * Props for the SearchTrigger component
 */
export interface SearchTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Click handler to open the search dialog */
  onClick: () => void;

  /** Custom trigger content - replaces default entirely */
  children?: ReactNode;

  /** Custom icon component (defaults to Search from lucide-react) */
  icon?: ComponentType<{ className?: string }>;

  /** Placeholder text shown in the trigger */
  placeholder?: string;

  /** Keyboard shortcut display (defaults to ⌘K). Set to null to hide */
  shortcut?: ShortcutConfig | null;

  /** Additional class name for the button */
  className?: string;

  /** Variant for styling (uses shadcn Button variants) */
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "secondary"
    | "destructive"
    | "link";
}

/**
 * A trigger button for opening the search dialog.
 * Can be fully customized with custom icon, placeholder, shortcut, or entirely custom children.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SearchTrigger onClick={() => setOpen(true)} />
 *
 * // Custom placeholder
 * <SearchTrigger
 *   onClick={() => setOpen(true)}
 *   placeholder="Find documents..."
 * />
 *
 * // Custom shortcut
 * <SearchTrigger
 *   onClick={() => setOpen(true)}
 *   shortcut={{ key: "P", modifier: "Ctrl" }}
 * />
 *
 * // Completely custom content
 * <SearchTrigger onClick={() => setOpen(true)}>
 *   <span>🔍 Search</span>
 * </SearchTrigger>
 * ```
 */
export function SearchTrigger({
  onClick,
  children,
  icon: Icon = Search,
  placeholder = "Search files...",
  shortcut = { key: "K", modifier: "⌘" },
  className,
  variant = "outline",
  ...buttonProps
}: SearchTriggerProps) {
  // If children are provided, render them instead of default content
  if (children) {
    return (
      <Button
        variant={variant}
        onClick={onClick}
        className={cn(
          "sui:w-full sui:max-w-md sui:justify-start sui:text-muted-foreground",
          className,
        )}
        {...buttonProps}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={onClick}
      className={cn(
        "sui:w-full sui:max-w-md sui:justify-start sui:text-muted-foreground",
        className,
      )}
      {...buttonProps}
    >
      <Icon className="sui:h-4 sui:w-4 sui:mr-2" />
      <span className="sui:flex-1 sui:text-left">{placeholder}</span>
      {shortcut && (
        <kbd className="sui:pointer-events-none sui:hidden sui:h-5 sui:select-none sui:items-center sui:gap-1 sui:rounded sui:border sui:bg-muted sui:px-1.5 sui:font-mono sui:text-[10px] sui:font-medium sui:opacity-100 sm:sui:flex">
          {shortcut.modifier && (
            <span className="sui:text-xs">{shortcut.modifier}</span>
          )}
          {shortcut.key}
        </kbd>
      )}
    </Button>
  );
}
