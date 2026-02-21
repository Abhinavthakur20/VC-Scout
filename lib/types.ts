export interface Company {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  tagline: string;
  description: string;
  stage: "Pre-Seed" | "Seed" | "Series A" | "Series B" | "Series C+" | "Growth";
  sector: string;
  tags: string[];
  location: string;
  foundedYear: number;
  employeeCount?: string;
  revenue?: string;
  fundingTotal?: string;
  lastFundingDate?: string;
  thesisScore: number;
  thesisExplain: string;
  signals: Signal[];
  websiteUrl: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  enrichedAt?: string;
  enrichment?: EnrichmentResult;
}

export interface Signal {
  id: string;
  date: string;
  type: "funding" | "hiring" | "product" | "news" | "founder_move" | "partnership";
  title: string;
  detail?: string;
  source?: string;
}

export interface EnrichmentResult {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  signals: DerivedSignal[];
  sources: ScrapedSource[];
  cachedAt: string;
}

export interface DerivedSignal {
  label: string;
  detail: string;
  type: "positive" | "neutral" | "flag";
}

export interface ScrapedSource {
  url: string;
  fetchedAt: string;
  pageType: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: FilterState;
  createdAt: string;
  lastRunAt?: string;
}

export interface UserList {
  id: string;
  name: string;
  description?: string;
  color: string;
  companyIds: string[];
  createdAt: string;
}

export interface FilterState {
  stage: string[];
  sector: string[];
  location: string[];
  thesisScoreMin: number;
  thesisScoreMax: number;
  employeeCount: string[];
  tags: string[];
}

export interface Note {
  id: string;
  companyId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type SortBy =
  | "thesisScore"
  | "name"
  | "foundedYear"
  | "lastFundingDate"
  | "employeeCount";
