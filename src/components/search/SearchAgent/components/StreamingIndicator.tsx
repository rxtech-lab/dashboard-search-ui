import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2, Bot } from "lucide-react";

/**
 * Props for the StreamingIndicator component
 */
export interface StreamingIndicatorProps {
  /** Custom text or component to display while streaming */
  text?: ReactNode;

  /** Custom icon component for the bot avatar */
  botIcon?: ComponentType<{ className?: string }>;

  /** Custom loading icon, or null to hide it */
  loadingIcon?: ComponentType<{ className?: string }> | null;

  /** Additional class name */
  className?: string;
}

/**
 * A loading indicator shown while the AI is streaming a response.
 */
export function StreamingIndicator({
  text = "Searching...",
  botIcon: BotIcon = Bot,
  loadingIcon,
  className,
}: StreamingIndicatorProps) {
  // Default to Loader2, but allow null to hide the icon
  const LoadingIcon = loadingIcon === null ? null : (loadingIcon ?? Loader2);

  return (
    <div className={className}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <BotIcon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl rounded-tl-md bg-muted text-sm w-fit"
          >
            {LoadingIcon && <LoadingIcon className="h-4 w-4 animate-spin text-primary" />}
            <span className="text-muted-foreground">{text}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
