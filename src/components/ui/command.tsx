import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      data-sui
      className={cn(
        "sui:bg-popover sui:text-popover-foreground sui:flex sui:h-full sui:w-full sui:flex-col sui:overflow-hidden sui:rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  shouldFilter,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  shouldFilter?: boolean;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sui:sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("sui:overflow-hidden sui:p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command
          shouldFilter={shouldFilter}
          className="**:[[cmdk-group-heading]]:sui:text-muted-foreground **:data-[slot=command-input-wrapper]:sui:h-12 [&_[cmdk-group-heading]]:sui:px-2 [&_[cmdk-group-heading]]:sui:font-medium [&_[cmdk-group]]:sui:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:sui:pt-0 [&_[cmdk-input-wrapper]_svg]:sui:h-5 [&_[cmdk-input-wrapper]_svg]:sui:w-5 [&_[cmdk-input]]:sui:h-12 [&_[cmdk-item]]:sui:px-2 [&_[cmdk-item]]:sui:py-3 [&_[cmdk-item]_svg]:sui:h-5 [&_[cmdk-item]_svg]:sui:w-5"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="sui:flex sui:h-9 sui:items-center sui:gap-2 sui:border-b sui:px-3"
    >
      <SearchIcon className="sui:size-4 sui:shrink-0 sui:opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:sui:text-muted-foreground sui:flex sui:h-10 sui:w-full sui:rounded-md sui:bg-transparent sui:py-3 sui:text-sm sui:outline-hidden disabled:sui:cursor-not-allowed disabled:sui:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "sui:max-h-[600px] sui:scroll-py-1 sui:overflow-x-hidden sui:overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="sui:py-6 sui:text-center sui:text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "sui:text-foreground sui:text-sm [&_[cmdk-group-heading]]:sui:text-muted-foreground sui:overflow-hidden sui:p-1 [&_[cmdk-group-heading]]:sui:px-2 [&_[cmdk-group-heading]]:sui:py-1.5 [&_[cmdk-group-heading]]:sui:text-xs [&_[cmdk-group-heading]]:sui:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("sui:bg-border sui:-mx-1 sui:h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:sui:bg-accent data-[selected=true]:sui:text-accent-foreground [&_svg:not([class*='text-'])]:sui:text-muted-foreground sui:relative sui:flex sui:cursor-default sui:items-center sui:gap-2 sui:rounded-sm sui:px-2 sui:py-1.5 sui:text-sm sui:outline-hidden sui:select-none data-[disabled=true]:sui:pointer-events-none data-[disabled=true]:sui:opacity-50 [&_svg]:sui:pointer-events-none [&_svg]:sui:shrink-0 [&_svg:not([class*='size-'])]:sui:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "sui:text-muted-foreground sui:ml-auto sui:text-xs sui:tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

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
};
