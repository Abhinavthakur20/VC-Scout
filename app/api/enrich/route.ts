import { NextResponse } from "next/server";
import type { DerivedSignal, EnrichmentResult, ScrapedSource } from "@/lib/types";

interface ScrapeResult {
  url: string;
  pageType: string;
  content: string;
  fetchedAt: string;
}

const MAX_CONTEXT_CHARS = 12000;

const STOPWORDS = new Set([
  "about",
  "above",
  "after",
  "again",
  "also",
  "among",
  "and",
  "any",
  "are",
  "back",
  "because",
  "been",
  "being",
  "between",
  "both",
  "but",
  "can",
  "company",
  "could",
  "data",
  "for",
  "from",
  "have",
  "into",
  "just",
  "more",
  "our",
  "over",
  "product",
  "service",
  "that",
  "their",
  "there",
  "they",
  "this",
  "with",
  "your",
]);

function parseJson(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    return JSON.parse(match[0]) as Record<string, unknown>;
  }
}

function stripSectionScaffold(text: string) {
  return text
    .replace(/##\s+[A-Z_]+\s+\([^)]+\)/g, " ")
    .replace(/\n---\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanSummary(raw: string) {
  const cleaned = stripSectionScaffold(raw)
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "Summary unavailable.";
  const firstTwo = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 20)
    .slice(0, 2)
    .join(" ");
  if (!firstTwo) return cleaned.slice(0, 220);
  return firstTwo.length > 280 ? `${firstTwo.slice(0, 277)}...` : firstTwo;
}

function isDerivedSignal(value: unknown): value is DerivedSignal {
  if (!value || typeof value !== "object") return false;
  const item = value as DerivedSignal;
  return (
    typeof item.label === "string" &&
    typeof item.detail === "string" &&
    (item.type === "positive" || item.type === "neutral" || item.type === "flag")
  );
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function scrapePageWithFirecrawl(url: string, pageType: string): Promise<ScrapeResult | null> {
  if (!process.env.FIRECRAWL_API_KEY) {
    return null;
  }
  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 12000,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 429) {
    throw new Error("firecrawl_rate_limited");
  }
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as { data?: { markdown?: string } };
  const content = (data.data?.markdown ?? "").trim();
  if (content.length < 120) return null;
  return {
    url,
    pageType,
    content,
    fetchedAt: new Date().toISOString(),
  };
}

async function scrapePageDirect(url: string, pageType: string): Promise<ScrapeResult | null> {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 VC-Scout-Enrichment/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      return null;
    }
    const html = await response.text();
    const content = htmlToText(html);
    if (content.length < 120) return null;
    return {
      url,
      pageType,
      content,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function topSentences(text: string, count: number) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 30);
  return sentences.slice(0, count);
}

function topBullets(text: string, count: number) {
  const chunks = text
    .split(/[.\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 35 && item.length <= 180);
  return chunks.slice(0, count);
}

function topKeywords(text: string, count: number) {
  const words = text.match(/[A-Za-z][A-Za-z0-9/+.-]{2,}/g) ?? [];
  const freq = new Map<string, number>();
  const original = new Map<string, string>();
  for (const raw of words) {
    const lower = raw.toLowerCase();
    if (STOPWORDS.has(lower)) continue;
    if (/^\d+$/.test(lower)) continue;
    freq.set(lower, (freq.get(lower) ?? 0) + 1);
    if (!original.has(lower)) original.set(lower, raw);
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => original.get(key) ?? key);
}

function deriveSignals(text: string, sources: ScrapedSource[]): DerivedSignal[] {
  const lower = text.toLowerCase();
  const signals: DerivedSignal[] = [];
  const sourceUrls = sources.map((source) => source.url.toLowerCase());
  const hasCareersPage = sourceUrls.some((url) => url.includes("/careers")) || /(careers|open roles|we're hiring|job openings)/.test(lower);
  const hasBlog = sourceUrls.some((url) => url.includes("/blog") || url.includes("/changelog")) || /(blog|changelog|release notes|latest updates)/.test(lower);
  const hasPlatformSignals = /(platform|api|developer|sdk|dashboard|workflow)/.test(lower);

  if (hasCareersPage) {
    signals.push({
      label: "Has careers page -> hiring",
      detail: "Public careers or hiring signals detected.",
      type: "positive",
    });
  }
  if (hasBlog) {
    signals.push({
      label: "Has blog/changelog -> active development",
      detail: "Recent update-oriented content was found.",
      type: "neutral",
    });
  }
  if (hasPlatformSignals) {
    signals.push({
      label: "Product platform signals -> SaaS profile",
      detail: "Platform/API style language appears in product content.",
      type: "positive",
    });
  }
  if (!/pricing/.test(lower)) {
    signals.push({
      label: "No pricing page reference",
      detail: "No clear pricing language detected in sampled pages.",
      type: "flag",
    });
  }

  if (signals.length < 2) {
    signals.push({
      label: "Public content available",
      detail: "Website provided enough public text for baseline enrichment.",
      type: "neutral",
    });
  }
  return signals.slice(0, 4);
}

function buildHeuristicResult(combinedContent: string, sources: ScrapedSource[]): EnrichmentResult {
  const cleanContent = stripSectionScaffold(combinedContent);
  const summarySentences = topSentences(cleanContent, 2);
  const bullets = topBullets(cleanContent, 5);
  const keywords = topKeywords(cleanContent, 8);
  const signals = deriveSignals(cleanContent, sources);

  return {
    summary:
      summarySentences.length > 0
        ? cleanSummary(summarySentences.join(" "))
        : "Summary inferred from publicly available website content.",
    whatTheyDo:
      bullets.length > 0
        ? bullets
        : ["Public website content suggests a B2B software-focused offering."],
    keywords: keywords.length > 0 ? keywords : ["software", "platform", "product"],
    signals,
    sources,
    cachedAt: new Date().toISOString(),
  };
}

async function extractWithGemini(combinedContent: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("gemini_missing_key");
  }
  const systemPrompt = `You are a senior VC analyst. Given scraped website content from a startup's public pages, extract structured intelligence for deal sourcing. Always respond with valid JSON only, no markdown fences, matching this exact schema:
{
  "summary": "1-2 sentence company summary",
  "whatTheyDo": ["bullet 1", "bullet 2", "...up to 6"],
  "keywords": ["keyword1", "keyword2", "...5-10 total"],
  "signals": [
    { "label": "Signal label", "detail": "Detail text", "type": "positive|neutral|flag" }
  ]
}`;

  const userPrompt = `Company website content:\n\n${combinedContent}\n\nExtract structured intelligence.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (response.status === 429) {
    throw new Error("gemini_rate_limited");
  }
  if (!response.ok) {
    throw new Error(`gemini_failed_${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.find((part) => typeof part.text === "string")?.text;
  return parseJson(text ?? "{}");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { websiteUrl?: string };
    const websiteUrl = body.websiteUrl?.trim();

    if (!websiteUrl) {
      return NextResponse.json({ error: "websiteUrl is required" }, { status: 400 });
    }

    const baseUrl = new URL(websiteUrl).origin;
    const pagesToScrape = [
      { url: baseUrl, pageType: "homepage" },
      { url: `${baseUrl}/about`, pageType: "about" },
      { url: `${baseUrl}/careers`, pageType: "careers" },
    ];

    const successfulScrapes: ScrapeResult[] = [];
    let firecrawlRateLimited = false;

    for (const page of pagesToScrape) {
      let result: ScrapeResult | null = null;
      if (!firecrawlRateLimited) {
        try {
          result = await scrapePageWithFirecrawl(page.url, page.pageType);
        } catch (error) {
          if (error instanceof Error && error.message === "firecrawl_rate_limited") {
            firecrawlRateLimited = true;
          }
        }
      }

      if (!result) {
        result = await scrapePageDirect(page.url, page.pageType);
      }
      if (result) {
        successfulScrapes.push(result);
      }
    }

    if (successfulScrapes.length === 0) {
      return NextResponse.json({ error: "Could not fetch website content" }, { status: 422 });
    }

    const combinedContent = successfulScrapes
      .map((item) => `## ${item.pageType.toUpperCase()} (${item.url})\n\n${item.content}`)
      .join("\n\n---\n\n")
      .slice(0, MAX_CONTEXT_CHARS);

    const sources: ScrapedSource[] = successfulScrapes.map(({ url, pageType, fetchedAt }) => ({
      url,
      pageType,
      fetchedAt,
    }));

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = await extractWithGemini(combinedContent);
    } catch {
      parsed = null;
    }

    if (!parsed) {
      const fallback = buildHeuristicResult(combinedContent, sources);
      if (firecrawlRateLimited) {
        fallback.signals = [
          ...fallback.signals.slice(0, 3),
          {
            label: "Firecrawl rate limit encountered",
            detail: "Fallback direct-fetch enrichment path was used for this run.",
            type: "neutral" as const,
          },
        ].slice(0, 4);
      }
      return NextResponse.json(fallback);
    }

    const result: EnrichmentResult = {
      summary: typeof parsed.summary === "string" ? cleanSummary(parsed.summary) : cleanSummary(combinedContent),
      whatTheyDo: Array.isArray(parsed.whatTheyDo)
        ? parsed.whatTheyDo.filter((item): item is string => typeof item === "string").slice(0, 6)
        : [],
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.filter((item): item is string => typeof item === "string").slice(0, 10)
        : [],
      signals:
        Array.isArray(parsed.signals) && parsed.signals.filter(isDerivedSignal).length > 0
          ? parsed.signals.filter(isDerivedSignal).slice(0, 4)
          : deriveSignals(stripSectionScaffold(combinedContent), sources),
      sources,
      cachedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enrichment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
