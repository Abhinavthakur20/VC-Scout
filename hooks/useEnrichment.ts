"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import type { EnrichmentResult } from "@/lib/types";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RETRY_AFTER_SECONDS = 30;

export function useEnrichment(companyId: string, websiteUrl: string) {
  const { enrichmentCache, setEnrichmentCache } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [nextRetryAt, setNextRetryAt] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cached = enrichmentCache[companyId];
  const isCacheValid = useMemo(() => {
    if (!cached) return false;
    return Date.now() - new Date(cached.cachedAt).getTime() < CACHE_TTL_MS;
  }, [cached]);

  const mutation = useMutation({
    mutationFn: async (): Promise<EnrichmentResult> => {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, websiteUrl }),
      });
      let payload: unknown = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }
      if (!response.ok) {
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get("Retry-After");
          const retryAfterBody =
            typeof payload === "object" &&
            payload !== null &&
            "retryAfterSeconds" in payload &&
            typeof (payload as { retryAfterSeconds?: unknown }).retryAfterSeconds === "number"
              ? (payload as { retryAfterSeconds: number }).retryAfterSeconds
              : null;
          const retryAfterParsed = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : null;
          const retryAfterSeconds =
            (retryAfterBody && Number.isFinite(retryAfterBody) && retryAfterBody > 0 && retryAfterBody) ||
            (retryAfterParsed && Number.isFinite(retryAfterParsed) && retryAfterParsed > 0 && retryAfterParsed) ||
            DEFAULT_RETRY_AFTER_SECONDS;
          setNextRetryAt(Date.now() + retryAfterSeconds * 1000);
        }
        const error =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof (payload as { error?: unknown }).error === "string"
            ? (payload as { error: string }).error
            : "Enrichment failed";
        throw new Error(error);
      }
      return payload as EnrichmentResult;
    },
    onSuccess: (result) => {
      setEnrichmentCache(companyId, result);
      setError(null);
      setNextRetryAt(null);
      setCooldownSeconds(0);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Enrichment failed";
      setError(message);
    },
  });

  useEffect(() => {
    if (!nextRetryAt) {
      setCooldownSeconds(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((nextRetryAt - Date.now()) / 1000));
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        setNextRetryAt(null);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [nextRetryAt]);

  useEffect(() => {
    if (!mutation.isPending) {
      setStatusMessage("");
      return;
    }
    const messages = [
      "Fetching public website...",
      "Scraping company pages...",
      "Extracting intelligence...",
      "Generating signals...",
    ];
    let index = 0;
    const timer = window.setInterval(() => {
      setStatusMessage(messages[index % messages.length]);
      index += 1;
    }, 1500);
    return () => window.clearInterval(timer);
  }, [mutation.isPending]);

  const enrich = useCallback(
    async (forceRefresh = false) => {
      if (isCacheValid && !forceRefresh) {
        return;
      }
      if (nextRetryAt && Date.now() < nextRetryAt) {
        setError(`Rate limit hit. Retry in ${Math.max(1, Math.ceil((nextRetryAt - Date.now()) / 1000))}s.`);
        return;
      }
      setError(null);
      try {
        await mutation.mutateAsync();
      } catch {
        // onError already populates UI state; avoid unhandled promise rejections.
      }
    },
    [isCacheValid, mutation.mutateAsync, nextRetryAt],
  );

  return {
    enrich,
    loading: mutation.isPending,
    error,
    statusMessage,
    cooldownSeconds,
    cached: isCacheValid ? cached : null,
  };
}
