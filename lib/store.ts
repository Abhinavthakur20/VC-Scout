"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { mockCompanies } from "@/lib/mock-data";
import type {
  EnrichmentResult,
  FilterState,
  Note,
  SavedSearch,
  SortBy,
  UserList,
} from "@/lib/types";
import { uid } from "@/lib/utils";

interface AppStore {
  companies: typeof mockCompanies;
  searchQuery: string;
  filters: FilterState;
  sortBy: SortBy;
  sortDir: "asc" | "desc";
  viewMode: "table" | "cards";
  currentPage: number;
  selectedCompanyIds: Set<string>;
  lists: UserList[];
  savedSearches: SavedSearch[];
  notes: Note[];
  enrichmentCache: Record<string, EnrichmentResult>;
  setSearchQuery: (q: string) => void;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSortBy: (col: SortBy) => void;
  toggleSortDir: () => void;
  setViewMode: (m: "table" | "cards") => void;
  setCurrentPage: (p: number) => void;
  toggleSelectCompany: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  createList: (name: string, description: string, color: string) => void;
  updateList: (id: string, name: string, color: string) => void;
  deleteList: (id: string) => void;
  addCompanyToList: (listId: string, companyId: string) => void;
  removeCompanyFromList: (listId: string, companyId: string) => void;
  saveSearch: (name: string, query: string, filters: FilterState) => void;
  markSearchRun: (id: string) => void;
  renameSearch: (id: string, name: string) => void;
  deleteSearch: (id: string) => void;
  upsertNote: (companyId: string, content: string) => void;
  deleteNote: (id: string) => void;
  setEnrichmentCache: (companyId: string, result: EnrichmentResult) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      companies: mockCompanies,
      searchQuery: "",
      filters: DEFAULT_FILTERS,
      sortBy: "thesisScore",
      sortDir: "desc",
      viewMode: "cards",
      currentPage: 1,
      selectedCompanyIds: new Set<string>(),
      lists: [],
      savedSearches: [],
      notes: [],
      enrichmentCache: {},
      setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
      setFilters: (f) =>
        set((state) => ({
          filters: { ...state.filters, ...f },
          currentPage: 1,
        })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS, currentPage: 1 }),
      setSortBy: (col) =>
        set((state) => {
          if (state.sortBy === col) {
            return { sortBy: col, sortDir: state.sortDir === "asc" ? "desc" : "asc" };
          }
          return { sortBy: col, sortDir: col === "thesisScore" ? "desc" : "asc" };
        }),
      toggleSortDir: () => set((state) => ({ sortDir: state.sortDir === "asc" ? "desc" : "asc" })),
      setViewMode: (m) => set({ viewMode: m }),
      setCurrentPage: (p) => set({ currentPage: p }),
      toggleSelectCompany: (id) =>
        set((state) => {
          const next = new Set(state.selectedCompanyIds);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return { selectedCompanyIds: next };
        }),
      selectAll: (ids) => set({ selectedCompanyIds: new Set(ids) }),
      clearSelection: () => set({ selectedCompanyIds: new Set() }),
      createList: (name, description, color) =>
        set((state) => ({
          lists: [
            ...state.lists,
            {
              id: uid("list"),
              name,
              description,
              color,
              companyIds: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateList: (id, name, color) =>
        set((state) => ({
          lists: state.lists.map((list) => (list.id === id ? { ...list, name, color } : list)),
        })),
      deleteList: (id) => set((state) => ({ lists: state.lists.filter((list) => list.id !== id) })),
      addCompanyToList: (listId, companyId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId && !list.companyIds.includes(companyId)
              ? { ...list, companyIds: [...list.companyIds, companyId] }
              : list,
          ),
        })),
      removeCompanyFromList: (listId, companyId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? { ...list, companyIds: list.companyIds.filter((id) => id !== companyId) }
              : list,
          ),
        })),
      saveSearch: (name, query, filters) =>
        set((state) => ({
          savedSearches: [
            ...state.savedSearches,
            {
              id: uid("search"),
              name,
              query,
              filters,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      markSearchRun: (id) =>
        set((state) => ({
          savedSearches: state.savedSearches.map((search) =>
            search.id === id ? { ...search, lastRunAt: new Date().toISOString() } : search,
          ),
        })),
      renameSearch: (id, name) =>
        set((state) => ({
          savedSearches: state.savedSearches.map((search) =>
            search.id === id ? { ...search, name } : search,
          ),
        })),
      deleteSearch: (id) =>
        set((state) => ({ savedSearches: state.savedSearches.filter((search) => search.id !== id) })),
      upsertNote: (companyId, content) => {
        const now = new Date().toISOString();
        const existing = get().notes.find((note) => note.companyId === companyId);
        if (existing) {
          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === existing.id ? { ...note, content, updatedAt: now } : note,
            ),
          }));
          return;
        }
        set((state) => ({
          notes: [
            ...state.notes,
            {
              id: uid("note"),
              companyId,
              content,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
      },
      deleteNote: (id) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
      setEnrichmentCache: (companyId, result) =>
        set((state) => ({
          enrichmentCache: { ...state.enrichmentCache, [companyId]: result },
        })),
    }),
    {
      name: "vc-intelligence-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lists: state.lists,
        savedSearches: state.savedSearches,
        notes: state.notes,
        enrichmentCache: state.enrichmentCache,
      }),
    },
  ),
);
