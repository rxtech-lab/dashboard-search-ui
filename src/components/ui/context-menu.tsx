import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:sui:bg-accent focus:sui:text-accent-foreground data-[state=open]:sui:bg-accent data-[state=open]:sui:text-accent-foreground [&_svg:not([class*='text-'])]:sui:text-muted-foreground sui:flex sui:cursor-default sui:items-center sui:rounded-sm sui:px-2 sui:py-1.5 sui:text-sm sui:outline-hidden sui:select-none data-[inset]:sui:pl-8 [&_svg]:sui:pointer-events-none [&_svg]:sui:shrink-0 [&_svg:not([class*='size-'])]:sui:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="sui:ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      data-sui
      className={cn(
        "sui:bg-popover sui:text-popover-foreground data-[state=open]:sui:animate-in data-[state=closed]:sui:animate-out data-[state=closed]:sui:fade-out-0 data-[state=open]:sui:fade-in-0 data-[state=closed]:sui:zoom-out-95 data-[state=open]:sui:zoom-in-95 data-[side=bottom]:sui:slide-in-from-top-2 data-[side=left]:sui:slide-in-from-right-2 data-[side=right]:sui:slide-in-from-left-2 data-[side=top]:sui:slide-in-from-bottom-2 sui:z-50 sui:min-w-[8rem] sui:origin-(--radix-context-menu-content-transform-origin) sui:overflow-hidden sui:rounded-md sui:border sui:p-1 sui:shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        data-sui
        className={cn(
          "sui:bg-popover sui:text-popover-foreground data-[state=open]:sui:animate-in data-[state=closed]:sui:animate-out data-[state=closed]:sui:fade-out-0 data-[state=open]:sui:fade-in-0 data-[state=closed]:sui:zoom-out-95 data-[state=open]:sui:zoom-in-95 data-[side=bottom]:sui:slide-in-from-top-2 data-[side=left]:sui:slide-in-from-right-2 data-[side=right]:sui:slide-in-from-left-2 data-[side=top]:sui:slide-in-from-bottom-2 sui:z-50 sui:max-h-(--radix-context-menu-content-available-height) sui:min-w-[8rem] sui:origin-(--radix-context-menu-content-transform-origin) sui:overflow-x-hidden sui:overflow-y-auto sui:rounded-md sui:border sui:p-1 sui:shadow-md",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:sui:bg-accent focus:sui:text-accent-foreground data-[variant=destructive]:sui:text-destructive data-[variant=destructive]:focus:sui:bg-destructive/10 sui:dark:data-[variant=destructive]:focus:sui:bg-destructive/20 data-[variant=destructive]:focus:sui:text-destructive data-[variant=destructive]:*:[svg]:sui:!text-destructive [&_svg:not([class*='text-'])]:sui:text-muted-foreground sui:relative sui:flex sui:cursor-default sui:items-center sui:gap-2 sui:rounded-sm sui:px-2 sui:py-1.5 sui:text-sm sui:outline-hidden sui:select-none data-[disabled]:sui:pointer-events-none data-[disabled]:sui:opacity-50 data-[inset]:sui:pl-8 [&_svg]:sui:pointer-events-none [&_svg]:sui:shrink-0 [&_svg:not([class*='size-'])]:sui:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:sui:bg-accent focus:sui:text-accent-foreground sui:relative sui:flex sui:cursor-default sui:items-center sui:gap-2 sui:rounded-sm sui:py-1.5 sui:pr-2 sui:pl-8 sui:text-sm sui:outline-hidden sui:select-none data-[disabled]:sui:pointer-events-none data-[disabled]:sui:opacity-50 [&_svg]:sui:pointer-events-none [&_svg]:sui:shrink-0 [&_svg:not([class*='size-'])]:sui:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="sui:pointer-events-none sui:absolute sui:left-2 sui:flex sui:size-3.5 sui:items-center sui:justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="sui:size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:sui:bg-accent focus:sui:text-accent-foreground sui:relative sui:flex sui:cursor-default sui:items-center sui:gap-2 sui:rounded-sm sui:py-1.5 sui:pr-2 sui:pl-8 sui:text-sm sui:outline-hidden sui:select-none data-[disabled]:sui:pointer-events-none data-[disabled]:sui:opacity-50 [&_svg]:sui:pointer-events-none [&_svg]:sui:shrink-0 [&_svg:not([class*='size-'])]:sui:size-4",
        className,
      )}
      {...props}
    >
      <span className="sui:pointer-events-none sui:absolute sui:left-2 sui:flex sui:size-3.5 sui:items-center sui:justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="sui:size-2 sui:fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "sui:text-foreground sui:px-2 sui:py-1.5 sui:text-sm sui:font-medium data-[inset]:sui:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("sui:bg-border sui:-mx-1 sui:my-1 sui:h-px", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "sui:text-muted-foreground sui:ml-auto sui:text-xs sui:tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

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
};
