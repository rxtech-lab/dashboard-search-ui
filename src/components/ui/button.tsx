import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "sui:inline-flex sui:items-center sui:justify-center sui:gap-2 sui:whitespace-nowrap sui:rounded-md sui:text-sm sui:font-medium sui:transition-all disabled:sui:pointer-events-none disabled:sui:opacity-50 [&_svg]:sui:pointer-events-none [&_svg:not([class*='size-'])]:sui:size-4 sui:shrink-0 [&_svg]:sui:shrink-0 sui:outline-none focus-visible:sui:border-ring focus-visible:sui:ring-ring/50 focus-visible:sui:ring-[3px] aria-invalid:sui:ring-destructive/20 sui:dark:aria-invalid:sui:ring-destructive/40 aria-invalid:sui:border-destructive",
  {
    variants: {
      variant: {
        default:
          "sui:bg-primary sui:text-primary-foreground hover:sui:bg-primary/90",
        destructive:
          "sui:bg-destructive sui:text-white hover:sui:bg-destructive/90 focus-visible:sui:ring-destructive/20 sui:dark:focus-visible:sui:ring-destructive/40 sui:dark:sui:bg-destructive/60",
        outline:
          "sui:border sui:bg-background sui:shadow-xs hover:sui:bg-accent hover:sui:text-accent-foreground sui:dark:sui:bg-input/30 sui:dark:sui:border-input sui:dark:hover:sui:bg-input/50",
        secondary:
          "sui:bg-secondary sui:text-secondary-foreground hover:sui:bg-secondary/80",
        ghost:
          "hover:sui:bg-accent hover:sui:text-accent-foreground sui:dark:hover:sui:bg-accent/50",
        link: "sui:text-primary sui:underline-offset-4 hover:sui:underline",
      },
      size: {
        default: "sui:h-9 sui:px-4 sui:py-2 has-[>svg]:sui:px-3",
        sm: "sui:h-8 sui:rounded-md sui:gap-1.5 sui:px-3 has-[>svg]:sui:px-2.5",
        lg: "sui:h-10 sui:rounded-md sui:px-6 has-[>svg]:sui:px-4",
        icon: "sui:size-9",
        "icon-sm": "sui:size-8",
        "icon-lg": "sui:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
