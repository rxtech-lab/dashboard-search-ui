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
      <div className="sui:flex sui:gap-3">
        <div className="sui:shrink-0 sui:w-8 sui:h-8 sui:rounded-full sui:bg-muted sui:flex sui:items-center sui:justify-center">
          <BotIcon className="sui:h-4 sui:w-4" />
        </div>
        <div className="sui:flex-1">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="sui:flex sui:items-center sui:gap-2 sui:px-4 sui:py-2 sui:rounded-2xl sui:rounded-tl-md sui:bg-muted sui:text-sm sui:w-fit"
          >
            {LoadingIcon && (
              <LoadingIcon className="sui:h-4 sui:w-4 sui:animate-spin sui:text-primary" />
            )}
            <span className="sui:text-muted-foreground">{text}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
