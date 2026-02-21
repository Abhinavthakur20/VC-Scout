import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function Slider({ className, ...props }: SliderProps) {
  return (
    <input
      type="range"
      className={cn("h-2 w-full cursor-pointer accent-teal-600", className)}
      {...props}
    />
  );
}
