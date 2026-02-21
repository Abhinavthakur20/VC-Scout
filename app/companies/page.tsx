"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, LayoutGrid, Rows3, X } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { SearchBar } from "@/components/companies/SearchBar";
import { CompanyFilters } from "@/components/companies/CompanyFilters";
import { CompanyTable } from "@/components/companies/CompanyTable";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { exportCompaniesCsv, exportCompaniesJson } from "@/lib/export";
import type { Company, SortBy } from "@/lib/types";

const PAGE_SIZE = 10;

function employeeSortValue(value?: string) {
  if (!value) return 0;
  if (value === "1-10") return 10;
  if (value === "11-50") return 50;
  if (value === "51-200") return 200;
  if (value === "200+") return 1000;
  return 0;
}

function matchesQuery(company: Company, query: string) {
  if (!query) return true;
  const target = [
    company.name,
    company.tagline,
    company.description,
    company.domain,
    company.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return target.includes(query.toLowerCase());
}

function sortCompanies(companies: Company[], sortBy: SortBy, sortDir: "asc" | "desc") {
  const sorted = [...companies].sort((a, b) => {
    if (sortBy === "thesisScore") return a.thesisScore - b.thesisScore;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "foundedYear") return a.foundedYear - b.foundedYear;
    if (sortBy === "lastFundingDate") {
      return new Date(a.lastFundingDate ?? "1970-01-01").getTime() - new Date(b.lastFundingDate ?? "1970-01-01").getTime();
    }
    if (sortBy === "employeeCount") return employeeSortValue(a.employeeCount) - employeeSortValue(b.employeeCount);
    return 0;
  });
  return sortDir === "asc" ? sorted : sorted.reverse();
}

export default function CompaniesPage() {
  const {
    companies,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    resetFilters,
    sortBy,
    sortDir,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    selectedCompanyIds,
    toggleSelectCompany,
    selectAll,
    clearSelection,
    saveSearch,
    lists,
    addCompanyToList,
  } = useAppStore();
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode("cards");
    }
  }, [setViewMode]);

  useEffect(() => {
    const onSaveShortcut = () => setSaveDialogOpen(true);
    const onEscape = () => setSaveDialogOpen(false);
    window.addEventListener("shortcut:save-search", onSaveShortcut);
    window.addEventListener("shortcut:escape", onEscape);
    return () => {
      window.removeEventListener("shortcut:save-search", onSaveShortcut);
      window.removeEventListener("shortcut:escape", onEscape);
    };
  }, []);

  const allTags = useMemo(
    () => Array.from(new Set(companies.flatMap((company) => company.tags))),
    [companies],
  );

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      if (!matchesQuery(company, debouncedQuery)) return false;
      if (filters.stage.length > 0 && !filters.stage.includes(company.stage)) return false;
      if (filters.sector.length > 0 && !filters.sector.includes(company.sector)) return false;
      if (filters.location.length > 0 && !filters.location.includes(company.location)) return false;
      if (
        filters.employeeCount.length > 0 &&
        !filters.employeeCount.includes(company.employeeCount ?? "")
      ) {
        return false;
      }
      if (company.thesisScore < filters.thesisScoreMin || company.thesisScore > filters.thesisScoreMax) {
        return false;
      }
      if (filters.tags.length > 0 && !filters.tags.every((tag) => company.tags.includes(tag))) return false;
      return true;
    });
  }, [companies, debouncedQuery, filters]);

  const sorted = useMemo(() => sortCompanies(filtered, sortBy, sortDir), [filtered, sortBy, sortDir]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedCompanies = companies.filter((company) => selectedCompanyIds.has(company.id));

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 xl:grid-cols-[320px,minmax(0,1fr)] 2xl:grid-cols-[340px,minmax(0,1fr)]">
        <CompanyFilters
          filters={filters}
          tags={allTags}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          onSaveDialogOpenChange={setSaveDialogOpen}
          saveDialogOpen={saveDialogOpen}
          onSaveSearch={(name) => {
            saveSearch(name, searchQuery, filters);
            toast.success("Search saved");
          }}
        />

        <div className="space-y-4">
          <SearchBar query={searchQuery} onChange={setSearchQuery} />

          <Card className="motion-enter motion-enter-delay-1 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-800">{paged.length}</span> of{" "}
                <span className="font-semibold text-slate-800">{sorted.length}</span> companies
              </p>
              <div className="flex items-center gap-2">
                <Select
                  aria-label="Sort companies"
                  className="h-10 w-[230px]"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortBy)}
                >
                  <option value="thesisScore">Thesis Score</option>
                  <option value="name">Name A-Z</option>
                  <option value="foundedYear">Founded Year</option>
                  <option value="lastFundingDate">Last Funding Date</option>
                  <option value="employeeCount">Employee Count</option>
                </Select>
                <Button
                  variant={viewMode === "table" ? "default" : "secondary"}
                  size="icon"
                  aria-label="Table view"
                  className="h-10 w-10"
                  onClick={() => setViewMode("table")}
                >
                  <Rows3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "secondary"}
                  size="icon"
                  aria-label="Card view"
                  className="h-10 w-10"
                  onClick={() => setViewMode("cards")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {paged.length === 0 ? (
            <Card className="motion-enter motion-enter-delay-2 p-8 text-center">
              <h2 className="mb-2 text-lg font-semibold">No results found</h2>
              <p className="mb-4 text-sm text-slate-500">Try broadening your query or clearing filters.</p>
              <Button onClick={resetFilters}>Reset filters</Button>
            </Card>
          ) : viewMode === "table" ? (
            <Card className="motion-enter motion-enter-delay-2 p-3">
              <CompanyTable
                companies={paged}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={setSortBy}
                selectedIds={selectedCompanyIds}
                onToggleSelect={toggleSelectCompany}
                onSelectAll={(checked) => {
                  if (checked) {
                    selectAll(paged.map((company) => company.id));
                  } else {
                    clearSelection();
                  }
                }}
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {paged.map((company) => (
                <CompanyCard key={company.id} company={company} query={debouncedQuery} />
              ))}
            </div>
          )}

          <div className="motion-enter motion-enter-delay-3 flex items-center justify-between text-sm text-slate-500">
            <p>
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setCurrentPage(page - 1)}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setCurrentPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedCompanyIds.size > 0 ? (
        <div className="motion-enter fixed bottom-4 left-1/2 z-40 w-[95%] max-w-3xl -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-700">{selectedCompanyIds.size} selected</p>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                aria-label="Add selected to list"
                className="h-9 min-w-[180px]"
                defaultValue=""
                onChange={(event) => {
                  const listId = event.target.value;
                  if (!listId) return;
                  selectedCompanies.forEach((company) => addCompanyToList(listId, company.id));
                  toast.success("Added to list");
                  event.currentTarget.value = "";
                }}
              >
                <option value="">Add to list</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </Select>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  exportCompaniesCsv(selectedCompanies, "selected-companies.csv");
                  toast.success("CSV exported");
                }}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  exportCompaniesJson(selectedCompanies, "selected-companies.json");
                  toast.success("JSON exported");
                }}
              >
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
