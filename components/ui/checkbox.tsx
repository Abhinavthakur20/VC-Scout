import * as React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ className, label, ...props }: CheckboxProps) {
  return (
    <label className="flex w-full items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-slate-300 bg-white text-teal-600 transition-all focus:ring-2 focus:ring-teal-600/50",
          className,
        )}
        {...props}
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
}
