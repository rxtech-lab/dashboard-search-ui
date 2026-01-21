"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      data-sui
      className={cn(
        "data-[state=open]:sui:animate-in data-[state=closed]:sui:animate-out data-[state=closed]:sui:fade-out-0 data-[state=open]:sui:fade-in-0 sui:fixed sui:inset-0 sui:z-50 sui:bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-sui
        className={cn(
          "sui:bg-background data-[state=open]:sui:animate-in data-[state=closed]:sui:animate-out data-[state=closed]:sui:fade-out-0 data-[state=open]:sui:fade-in-0 data-[state=closed]:sui:zoom-out-95 data-[state=open]:sui:zoom-in-95 sui:fixed sui:top-[50%] sui:left-[50%] sui:z-50 sui:grid sui:w-full sui:max-w-[calc(100%-2rem)] sui:translate-x-[-50%] sui:translate-y-[-50%] sui:gap-4 sui:rounded-lg sui:p-6 sui:shadow-lg sui:duration-200 sui:outline-none sm:sui:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="sui:ring-offset-background focus:sui:ring-ring data-[state=open]:sui:bg-accent data-[state=open]:sui:text-muted-foreground sui:absolute sui:top-4 sui:right-4 sui:rounded-xs sui:opacity-70 sui:transition-opacity hover:sui:opacity-100 focus:sui:ring-2 focus:sui:ring-offset-2 focus:sui:outline-hidden disabled:sui:pointer-events-none [&_svg]:sui:pointer-events-none [&_svg]:sui:shrink-0 [&_svg:not([class*='size-'])]:sui:size-4"
          >
            <XIcon />
            <span className="sui:sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "sui:flex sui:flex-col sui:gap-2 sui:text-center sm:sui:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "sui:flex sui:flex-col-reverse sui:gap-2 sm:sui:flex-row sm:sui:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "sui:text-lg sui:leading-none sui:font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("sui:text-muted-foreground sui:text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
