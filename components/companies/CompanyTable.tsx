"use client";

import Link from "next/link";
import { ArrowUpDown, ArrowUpRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StagePill, ThesisScoreBadge } from "@/components/companies/company-ui";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { SaveToListButton } from "@/components/profile/SaveToListButton";
import type { Company, SortBy } from "@/lib/types";

interface CompanyTableProps {
  companies: Company[];
  sortBy: SortBy;
  sortDir: "asc" | "desc";
  onSort: (next: SortBy) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
}

function sortLabel(label: string, sortBy: SortBy, active: SortBy, sortDir: "asc" | "desc") {
  const isActive = sortBy === active;
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <ArrowUpDown className={`h-3.5 w-3.5 ${isActive ? "text-teal-500" : "text-slate-500"}`} />
      {isActive ? <span className="text-[10px]">{sortDir.toUpperCase()}</span> : null}
    </span>
  );
}

export function CompanyTable({
  companies,
  sortBy,
  sortDir,
  onSort,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: CompanyTableProps) {
  return (
    <Table className="min-w-[980px] table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="sticky left-0 z-20 w-10 bg-slate-50/95 backdrop-blur">
            <Checkbox
              aria-label="Select all on page"
              checked={companies.length > 0 && companies.every((company) => selectedIds.has(company.id))}
              onChange={(event) => onSelectAll(event.currentTarget.checked)}
            />
          </TableHead>
          <TableHead className="sticky left-10 z-20 w-[220px] bg-slate-50/95 backdrop-blur">Company</TableHead>
          <TableHead className="w-[110px]">Stage</TableHead>
          <TableHead className="w-[110px]">Sector</TableHead>
          <TableHead className="w-[120px]">
            <button type="button" onClick={() => onSort("thesisScore")}>
              {sortLabel("Thesis Score", sortBy, "thesisScore", sortDir)}
            </button>
          </TableHead>
          <TableHead className="w-[110px]">Funding</TableHead>
          <TableHead className="w-[120px]">
            <button type="button" onClick={() => onSort("employeeCount")}>
              {sortLabel("Employees", sortBy, "employeeCount", sortDir)}
            </button>
          </TableHead>
          <TableHead className="w-[210px]">Last Signal</TableHead>
          <TableHead className="w-[110px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => {
          const lastSignal = [...company.signals].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
          return (
            <TableRow key={company.id}>
              <TableCell className="sticky left-0 z-10 bg-white/95 backdrop-blur">
                <Checkbox
                  aria-label={`Select ${company.name}`}
                  checked={selectedIds.has(company.id)}
                  onChange={() => onToggleSelect(company.id)}
                />
              </TableCell>
              <TableCell className="sticky left-10 z-10 bg-white/95 backdrop-blur">
                <div className="flex items-center gap-2">
                  <CompanyLogo name={company.name} domain={company.domain} logoUrl={company.logoUrl} size={28} className="h-7 w-7 rounded-lg" />
                  <div>
                    <p className="truncate text-sm font-medium">{company.name}</p>
                    <p className="font-mono-data max-w-[140px] truncate text-xs text-slate-400">{company.domain}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StagePill stage={company.stage} />
              </TableCell>
              <TableCell>{company.sector}</TableCell>
              <TableCell>
                <ThesisScoreBadge score={company.thesisScore} />
              </TableCell>
              <TableCell>{company.fundingTotal ?? "-"}</TableCell>
              <TableCell>{company.employeeCount ?? "-"}</TableCell>
              <TableCell>
                <div className="max-w-[180px] truncate text-xs text-slate-500">{lastSignal ? lastSignal.title : "-"}</div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                  <SaveToListButton companyId={company.id} compact />
                  <Link href={`/companies/${company.id}`} aria-label={`Open ${company.name}`}>
                    <ArrowUpRight className="h-4 w-4 text-slate-700" />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
