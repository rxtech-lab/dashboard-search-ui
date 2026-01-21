import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-sui
        sideOffset={sideOffset}
        className={cn(
          "sui:bg-foreground sui:text-background sui:animate-in sui:fade-in-0 sui:zoom-in-95 data-[state=closed]:sui:animate-out data-[state=closed]:sui:fade-out-0 data-[state=closed]:sui:zoom-out-95 data-[side=bottom]:sui:slide-in-from-top-2 data-[side=left]:sui:slide-in-from-right-2 data-[side=right]:sui:slide-in-from-left-2 data-[side=top]:sui:slide-in-from-bottom-2 sui:z-50 sui:w-fit sui:origin-(--radix-tooltip-content-transform-origin) sui:rounded-md sui:px-3 sui:py-1.5 sui:text-xs sui:text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="sui:bg-foreground sui:fill-foreground sui:z-50 sui:size-2.5 sui:translate-y-[calc(-50%_-_2px)] sui:rotate-45 sui:rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
