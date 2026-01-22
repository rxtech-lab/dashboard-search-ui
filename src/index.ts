// Import styles - output as separate style.css file
// Users should import: import "@rx-lab/dashboard-searching-ui/style.css"
import "./styles.css";

// Export utilities
export { cn } from "./lib/utils";

// Export hooks
export {
  useSearchAgent,
  type UseSearchAgentOptions,
  type UseSearchAgentReturn,
  type ToolCallInfo,
} from "./hooks";

// Export search components
export {
  SearchTrigger,
  type SearchTriggerProps,
  type ShortcutConfig,
} from "./components/search/SearchTrigger";

export {
  SearchCommand,
  type SearchCommandProps,
  type BaseSearchResult,
  type SearchTypeConfig,
  type SearchParams,
} from "./components/search/SearchCommand";

export {
  SearchAgent,
  type SearchAgentProps,
  type SearchAgentHeaderConfig,
  type SearchAgentInputConfig,
  // Sub-components
  MessageBubble,
  StreamingIndicator,
  FileResultCard,
  MessageActions,
  type MessageBubbleProps,
  type StreamingIndicatorProps,
  type FileResultCardProps,
  type FileData,
  type ToolResultRenderers,
  type ToolResultRendererProps,
  type ToolAction,
  type MessageActionsProps,
  type MessageAction,
} from "./components/search/SearchAgent";

// Export shadcn UI components
export { Button, buttonVariants } from "./components/ui/button";
export { Badge, badgeVariants } from "./components/ui/badge";
export { ScrollArea, ScrollBar } from "./components/ui/scroll-area";
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./components/ui/command";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from "./components/ui/context-menu";
export {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./components/ui/tooltip";
