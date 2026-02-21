"use client";

import { useRouter } from "next/navigation";
import { Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useAppStore } from "@/lib/store";

function filtersSummary(filters: ReturnType<typeof useAppStore.getState>["filters"]) {
  const chunks: string[] = [];
  if (filters.stage.length) chunks.push(`Stage: ${filters.stage.join(", ")}`);
  if (filters.sector.length) chunks.push(`Sector: ${filters.sector.join(", ")}`);
  if (filters.location.length) chunks.push(`Location: ${filters.location.join(", ")}`);
  chunks.push(`Score: ${filters.thesisScoreMin}-${filters.thesisScoreMax}`);
  return chunks.join(" | ");
}

export default function SavedSearchesPage() {
  const router = useRouter();
  const { savedSearches, deleteSearch, markSearchRun, renameSearch } = useSavedSearches();
  const { setSearchQuery, setFilters } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="motion-enter ui-panel-strong rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Saved Searches</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Reusable Query Library</h1>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-600">
            {savedSearches.length} saved
          </div>
        </div>
      </div>

      {savedSearches.length === 0 ? (
        <Card className="motion-enter motion-enter-delay-1 p-8 text-center text-slate-500">
          No saved searches yet. Save one from Discover.
        </Card>
      ) : (
        <div className="grid gap-3">
          {savedSearches.map((search) => (
            <Card key={search.id} className="motion-enter p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{search.name}</h2>
                  <p className="text-sm text-slate-500">Query: {search.query || "None"}</p>
                  <p className="text-xs text-slate-400">{filtersSummary(search.filters)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Created {new Date(search.createdAt).toLocaleDateString()}
                    {search.lastRunAt ? ` | Last run ${new Date(search.lastRunAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSearchQuery(search.query);
                      setFilters(search.filters);
                      markSearchRun(search.id);
                      router.push("/companies");
                    }}
                  >
                    <Play className="h-4 w-4" />
                    Run Search
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const name = window.prompt("Rename saved search", search.name);
                      if (!name) return;
                      renameSearch(search.id, name.trim());
                      toast.success("Saved search renamed");
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      deleteSearch(search.id);
                      toast.success("Saved search deleted");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
