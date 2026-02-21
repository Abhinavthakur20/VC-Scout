"use client";

import { useAppStore } from "@/lib/store";

export function useSavedSearches() {
  const { savedSearches, saveSearch, deleteSearch, markSearchRun, renameSearch } = useAppStore();
  return { savedSearches, saveSearch, deleteSearch, markSearchRun, renameSearch };
}
