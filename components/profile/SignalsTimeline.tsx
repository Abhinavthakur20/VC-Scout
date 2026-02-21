"use client";

import { useMemo, useState } from "react";
import { DollarSign, Handshake, Newspaper, Rocket, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Signal } from "@/lib/types";

function iconForType(type: Signal["type"]) {
  if (type === "funding") return <DollarSign className="h-4 w-4 text-green-400" />;
  if (type === "hiring") return <Users className="h-4 w-4 text-teal-500" />;
  if (type === "product") return <Rocket className="h-4 w-4 text-cyan-500" />;
  if (type === "news") return <Newspaper className="h-4 w-4 text-slate-500" />;
  if (type === "founder_move") return <UserCheck className="h-4 w-4 text-orange-400" />;
  return <Handshake className="h-4 w-4 text-teal-400" />;
}

export function SignalsTimeline({ signals }: { signals: Signal[] }) {
  const [showAll, setShowAll] = useState(false);
  const sorted = useMemo(
    () => [...signals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [signals],
  );
  const visible = showAll ? sorted : sorted.slice(0, 5);

  return (
    <section className="motion-enter motion-enter-delay-1 ui-panel rounded-2xl p-5">
      <h2 className="mb-4 text-xl font-semibold">Signals Timeline</h2>
      <div className="space-y-4">
        {visible.map((signal) => (
          <div key={signal.id} className="flex gap-3">
            <div className="mt-0.5">{iconForType(signal.type)}</div>
            <div className="flex-1 border-l border-slate-200 pl-3">
              <p className="text-xs text-slate-400">{signal.date}</p>
              <p className="text-sm font-medium text-slate-900">{signal.title}</p>
              {signal.detail ? <p className="text-sm text-slate-500">{signal.detail}</p> : null}
              {signal.source ? (
                <span className="mt-1 inline-block rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                  {signal.source}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {sorted.length > 5 ? (
        <Button className="mt-4" variant="secondary" size="sm" onClick={() => setShowAll((prev) => !prev)}>
          {showAll ? "Show less" : "Show all"}
        </Button>
      ) : null}
    </section>
  );
}
