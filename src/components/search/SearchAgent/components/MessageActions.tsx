import { Copy, RotateCcw, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Action types for message actions
 */
export interface MessageAction {
  type: "copy" | "regenerate";
  messageId: string;
  content?: string;
}

/**
 * Props for the MessageActions component
 */
export interface MessageActionsProps {
  /** Message ID */
  messageId: string;

  /** Text content of the message */
  textContent: string;

  /** Whether this is a user message */
  isUser: boolean;

  /** Whether the chat is currently processing */
  isProcessing?: boolean;

  /** Callback when an action is triggered */
  onAction: (action: MessageAction) => void;

  /** Additional class name */
  className?: string;
}

/**
 * Action buttons displayed at the bottom of a message.
 * Shows Copy and Regenerate buttons as icons with tooltips.
 * - User messages: Regenerate deletes follow-up messages and regenerates
 * - Assistant messages: Regenerate regenerates this message only
 */
export function MessageActions({
  messageId,
  textContent,
  isUser,
  isProcessing = false,
  onAction,
  className,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    onAction({ type: "copy", messageId, content: textContent });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    onAction({ type: "regenerate", messageId, content: textContent });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "sui:flex sui:items-center sui:gap-0.5 sui:mt-1",
          isUser ? "sui:justify-end" : "sui:justify-start sui:pl-10",
          className,
        )}
      >
        {/* Copy */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="sui:h-7 sui:w-7 sui:text-muted-foreground hover:sui:text-foreground"
              onClick={handleCopy}
              data-testid="action-copy"
            >
              {copied ? (
                <Check className="sui:h-3.5 sui:w-3.5" />
              ) : (
                <Copy className="sui:h-3.5 sui:w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{copied ? "Copied!" : "Copy"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Regenerate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="sui:h-7 sui:w-7 sui:text-muted-foreground hover:sui:text-foreground"
              onClick={handleRegenerate}
              disabled={isProcessing}
              data-testid="action-regenerate"
            >
              <RotateCcw className="sui:h-3.5 sui:w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isUser ? "Regenerate from here" : "Regenerate response"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
