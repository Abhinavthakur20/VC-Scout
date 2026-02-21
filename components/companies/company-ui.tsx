import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StagePill({ stage }: { stage: string }) {
  const styles: Record<string, string> = {
    "Pre-Seed": "bg-sky-50 text-sky-700 border-sky-200",
    Seed: "bg-blue-50 text-blue-700 border-blue-200",
    "Series A": "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Series B": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Series C+": "bg-emerald-50 text-emerald-700 border-emerald-200",
    Growth: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return <Badge className={cn("border", styles[stage] ?? "border-slate-200")}>{stage}</Badge>;
}

export function ThesisScoreBadge({ score }: { score: number }) {
  const tone = score >= 80 ? "success" : score >= 60 ? "warning" : "danger";
  const label = score >= 80 ? "High" : score >= 60 ? "Mid" : "Low";
  return (
    <Badge variant={tone} className="gap-1">
      <span>{label}</span>
      <span className="font-mono-data">{score}</span>
    </Badge>
  );
}
