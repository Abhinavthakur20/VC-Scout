"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
}

export function SearchBar({ query, onChange }: SearchBarProps) {
  return (
    <div className="motion-enter ui-panel-strong relative rounded-2xl p-2">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        aria-label="Search companies"
        placeholder="Search name, tagline, tags, domain..."
        className="h-12 border-transparent bg-transparent pl-9 pr-10 shadow-none hover:border-transparent focus-visible:ring-0"
        value={query}
        onChange={(event) => onChange(event.target.value)}
      />
      {query ? (
        <Button
          size="icon"
          variant="ghost"
          aria-label="Clear search"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
