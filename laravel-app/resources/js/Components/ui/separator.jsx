import * as React from "react";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "shrink-0 bg-gray-200 dark:bg-gray-800",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
    />
  )
);

Separator.displayName = "Separator";

export { Separator };
