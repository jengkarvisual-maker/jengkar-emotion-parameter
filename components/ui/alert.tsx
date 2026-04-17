import * as React from "react";

import { cn } from "@/lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "success" | "destructive";
};

function Alert({ className, tone = "default", ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "default" && "border-border bg-muted/40 text-foreground",
        tone === "success" && "border-success/30 bg-success/10 text-success",
        tone === "destructive" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Alert };
