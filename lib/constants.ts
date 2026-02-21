import type { FilterState } from "@/lib/types";

export const STAGE_OPTIONS = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Growth",
] as const;

export const SECTOR_OPTIONS = [
  "Dev Tools",
  "AI/ML",
  "FinTech",
  "HealthTech",
  "Climate",
  "SaaS",
  "Security",
  "Consumer",
] as const;

export const LOCATION_OPTIONS = [
  "San Francisco, CA",
  "New York, NY",
  "London, UK",
  "Berlin, DE",
  "Toronto, CA",
  "Remote",
] as const;

export const EMPLOYEE_OPTIONS = ["1-10", "11-50", "51-200", "200+"] as const;

export const DEFAULT_FILTERS: FilterState = {
  stage: [],
  sector: [],
  location: [],
  thesisScoreMin: 0,
  thesisScoreMax: 100,
  employeeCount: [],
  tags: [],
};

export const LIST_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#a855f7",
  "#ec4899",
];
