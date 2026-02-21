"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useEnrichment } from "@/hooks/useEnrichment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeHours } from "@/lib/utils";
import type { Company } from "@/lib/types";

interface EnrichmentPanelProps {
  company: Company;
  triggerSignal: number;
}

export function EnrichmentPanel({ company, triggerSignal }: EnrichmentPanelProps) {
  const { enrich, loading, error, statusMessage, cooldownSeconds, cached } = useEnrichment(
    company.id,
    company.websiteUrl,
  );
  const lastTriggerRef = useRef(0);

  useEffect(() => {
    if (triggerSignal > 0 && triggerSignal !== lastTriggerRef.current) {
      lastTriggerRef.current = triggerSignal;
      void enrich(true);
    }
  }, [enrich, triggerSignal]);

  const sourceDomains = cached
    ? Array.from(
        new Set(
          cached.sources
            .map((source) => {
              try {
                return new URL(source.url).hostname.replace(/^www\./, "");
              } catch {
                return source.url;
              }
            })
            .filter(Boolean),
        ),
      )
    : [];
  const lastFetchedIso =
    cached && cached.sources.length > 0
      ? cached.sources
          .map((source) => source.fetchedAt)
          .sort((a, b) => +new Date(b) - +new Date(a))[0]
      : null;
  const lastFetchedLabel = lastFetchedIso
    ? new Date(lastFetchedIso).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <section className="motion-enter motion-enter-delay-2 ui-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Enrichment</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void enrich(true)}
          disabled={loading || cooldownSeconds > 0}
        >
          <RefreshCw className="h-4 w-4" />
          {cooldownSeconds > 0 ? `Retry in ${cooldownSeconds}s` : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{statusMessage || "Analyzing content..."}</span>
          </div>
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-rose-700">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">
              {error.includes("429") ? "Rate limit hit, try again in a moment." : error}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void enrich(true)}
            disabled={cooldownSeconds > 0}
          >
            {cooldownSeconds > 0 ? `Retry in ${cooldownSeconds}s` : "Retry"}
          </Button>
        </div>
      ) : cached ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Last enriched {formatRelativeHours(cached.cachedAt)} | Cached
          </p>
          <div>
            <h3 className="text-sm font-medium text-slate-700">Summary</h3>
            <p className="text-sm text-slate-800">{cached.summary}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-700">What They Do</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {cached.whatTheyDo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-700">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {cached.keywords.map((keyword) => (
                <Badge key={keyword}>{keyword}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-700">Derived Signals</h3>
            {cached.signals.length === 0 ? (
              <p className="text-sm text-slate-400">No derived signals found.</p>
            ) : (
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                {cached.signals.map((signal) => (
                  <li key={`${signal.label}-${signal.type}`}>
                    <span className="font-medium text-slate-800">{signal.label}</span>
                    <span className="text-slate-500"> - {signal.detail}</span>
                    <Badge
                      className="ml-2 align-middle"
                      variant={signal.type === "positive" ? "success" : signal.type === "flag" ? "danger" : "default"}
                    >
                      {signal.type}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-700">Sources</h3>
            <ul className="list-disc space-y-1 pl-5 text-xs text-slate-500">
              {sourceDomains.map((domain) => (
                <li key={domain}>{domain}</li>
              ))}
            </ul>
            {lastFetchedLabel ? (
              <p className="mt-2 text-xs text-slate-400">Last fetched: {lastFetchedLabel}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 text-center">
          <p className="mb-3 text-sm text-slate-500">
            Click <span className="font-medium text-slate-800">Enrich</span> to fetch live data from public pages.
          </p>
          <Button onClick={() => void enrich()} disabled={cooldownSeconds > 0}>
            <Sparkles className="h-4 w-4" />
            {cooldownSeconds > 0 ? `Retry in ${cooldownSeconds}s` : "Enrich now"}
          </Button>
        </div>
      )}
    </section>
  );
}
