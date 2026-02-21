"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EMPLOYEE_OPTIONS, LOCATION_OPTIONS, SECTOR_OPTIONS, STAGE_OPTIONS } from "@/lib/constants";
import type { FilterState } from "@/lib/types";

interface CompanyFiltersProps {
  filters: FilterState;
  tags: string[];
  onFiltersChange: (next: Partial<FilterState>) => void;
  onReset: () => void;
  onSaveSearch: (name: string) => void;
  saveDialogOpen: boolean;
  onSaveDialogOpenChange: (open: boolean) => void;
}

function toggleArrayValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </section>
  );
}

export function CompanyFilters({
  filters,
  tags,
  onFiltersChange,
  onReset,
  onSaveSearch,
  saveDialogOpen,
  onSaveDialogOpenChange,
}: CompanyFiltersProps) {
  const [searchName, setSearchName] = useState("");
  const sortedTags = useMemo(() => [...tags].sort(), [tags]);

  const activeFilterCount =
    filters.stage.length +
    filters.sector.length +
    filters.location.length +
    filters.employeeCount.length +
    filters.tags.length +
    (filters.thesisScoreMin > 0 || filters.thesisScoreMax < 100 ? 1 : 0);

  return (
    <Card className="motion-enter sticky top-20 max-h-[calc(100vh-7.5rem)] overflow-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-slate-500">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </CardTitle>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500">
            {activeFilterCount} active
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <FilterBlock title="Stage">
          <div className="grid gap-2">
            {STAGE_OPTIONS.map((stage) => (
              <Checkbox
                key={stage}
                label={stage}
                checked={filters.stage.includes(stage)}
                onChange={() => onFiltersChange({ stage: toggleArrayValue(filters.stage, stage) })}
              />
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Sector">
          <div className="grid gap-2">
            {SECTOR_OPTIONS.map((sector) => (
              <Checkbox
                key={sector}
                label={sector}
                checked={filters.sector.includes(sector)}
                onChange={() => onFiltersChange({ sector: toggleArrayValue(filters.sector, sector) })}
              />
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Location">
          <div className="grid gap-2">
            {LOCATION_OPTIONS.map((location) => (
              <Checkbox
                key={location}
                label={location.replace(", CA", "").replace(", NY", "").replace(", UK", "").replace(", DE", "")}
                checked={filters.location.includes(location)}
                onChange={() => onFiltersChange({ location: toggleArrayValue(filters.location, location) })}
              />
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Thesis Score">
          <div className="space-y-3">
            <div className="text-xs text-slate-500">
              {filters.thesisScoreMin} to {filters.thesisScoreMax}
            </div>
            <Slider
              min={0}
              max={100}
              value={filters.thesisScoreMin}
              onChange={(event) => {
                const next = Number(event.currentTarget.value);
                onFiltersChange({ thesisScoreMin: Math.min(next, filters.thesisScoreMax) });
              }}
            />
            <Slider
              min={0}
              max={100}
              value={filters.thesisScoreMax}
              onChange={(event) => {
                const next = Number(event.currentTarget.value);
                onFiltersChange({ thesisScoreMax: Math.max(next, filters.thesisScoreMin) });
              }}
            />
          </div>
        </FilterBlock>

        <FilterBlock title="Employee Count">
          <div className="grid gap-2">
            {EMPLOYEE_OPTIONS.map((employees) => (
              <Checkbox
                key={employees}
                label={employees}
                checked={filters.employeeCount.includes(employees)}
                onChange={() =>
                  onFiltersChange({ employeeCount: toggleArrayValue(filters.employeeCount, employees) })
                }
              />
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Tags">
          <div className="flex flex-wrap gap-2">
            {sortedTags.map((tag) => {
              const active = filters.tags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  className={cn(
                    "rounded-full border px-2 py-1 text-xs transition-colors",
                    active
                      ? "border-teal-300 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  )}
                  onClick={() => onFiltersChange({ tags: toggleArrayValue(filters.tags, tag) })}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </FilterBlock>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Button variant="secondary" onClick={onReset}>
            Clear filters
          </Button>
          <Button onClick={() => onSaveDialogOpenChange(true)}>Save Search</Button>
        </div>
      </CardContent>

      <Dialog open={saveDialogOpen} onOpenChange={onSaveDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save current search</DialogTitle>
            <DialogDescription>Store this query and filter combination for later.</DialogDescription>
          </DialogHeader>
          <Input
            aria-label="Saved search name"
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
            placeholder="AI infra pipeline leaders"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => onSaveDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!searchName.trim()) return;
                onSaveSearch(searchName.trim());
                setSearchName("");
                onSaveDialogOpenChange(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
