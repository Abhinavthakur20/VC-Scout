import type { EnrichmentResult } from "@/lib/types";

const CACHE_PREFIX = "enrich_";

export function getCachedEnrichment(companyId: string): EnrichmentResult | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(`${CACHE_PREFIX}${companyId}`);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as EnrichmentResult;
  } catch {
    return null;
  }
}

export function setCachedEnrichment(companyId: string, value: EnrichmentResult) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(`${CACHE_PREFIX}${companyId}`, JSON.stringify(value));
}

export function isEnrichmentFresh(cachedAt: string, ttlMs = 24 * 60 * 60 * 1000) {
  const age = Date.now() - new Date(cachedAt).getTime();
  return age < ttlMs;
}
