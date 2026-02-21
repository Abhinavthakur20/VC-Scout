import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-300",
        className,
      )}
      {...props}
    />
  );
}
