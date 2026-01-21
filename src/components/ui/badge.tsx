import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "sui:inline-flex sui:items-center sui:justify-center sui:rounded-full sui:border sui:px-2 sui:py-0.5 sui:text-xs sui:font-medium sui:w-fit sui:whitespace-nowrap sui:shrink-0 [&>svg]:sui:size-3 sui:gap-1 [&>svg]:sui:pointer-events-none focus-visible:sui:border-ring focus-visible:sui:ring-ring/50 focus-visible:sui:ring-[3px] aria-invalid:sui:ring-destructive/20 sui:dark:aria-invalid:sui:ring-destructive/40 aria-invalid:sui:border-destructive sui:transition-[color,box-shadow] sui:overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "sui:border-transparent sui:bg-primary sui:text-primary-foreground [a&]:hover:sui:bg-primary/90",
        secondary:
          "sui:border-transparent sui:bg-secondary sui:text-secondary-foreground [a&]:hover:sui:bg-secondary/90",
        destructive:
          "sui:border-transparent sui:bg-destructive sui:text-white [a&]:hover:sui:bg-destructive/90 focus-visible:sui:ring-destructive/20 sui:dark:focus-visible:sui:ring-destructive/40 sui:dark:sui:bg-destructive/60",
        outline:
          "sui:text-foreground [a&]:hover:sui:bg-accent [a&]:hover:sui:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
