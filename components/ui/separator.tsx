import { cn } from "@/lib/utils";

export function Separator({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return orientation === "horizontal" ? (
    <div className={cn("h-px w-full bg-slate-200/70", className)} />
  ) : (
    <div className={cn("h-full w-px bg-slate-200/70", className)} />
  );
}
