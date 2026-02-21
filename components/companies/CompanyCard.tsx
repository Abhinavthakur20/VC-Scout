"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StagePill, ThesisScoreBadge } from "@/components/companies/company-ui";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SaveToListButton } from "@/components/profile/SaveToListButton";
import type { Company } from "@/lib/types";

function highlight(text: string, query: string) {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);
  return (
    <>
      {before}
      <mark className="rounded bg-teal-100 px-0.5 text-slate-900">{match}</mark>
      {after}
    </>
  );
}

export function CompanyCard({ company, query }: { company: Company; query: string }) {
  const lastSignal = [...company.signals].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];

  return (
    <Card className="motion-enter h-full overflow-hidden border-slate-200 transition-all duration-200 hover:border-teal-200 hover:shadow-md">
      <CardHeader>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CompanyLogo name={company.name} domain={company.domain} logoUrl={company.logoUrl} size={40} className="h-10 w-10 rounded-xl" />
            <div>
              <CardTitle className="text-lg">{highlight(company.name, query)}</CardTitle>
              <p className="font-mono-data text-xs text-slate-400">{company.domain}</p>
            </div>
          </div>
          <ThesisScoreBadge score={company.thesisScore} />
        </div>
        <p className="text-sm text-slate-500">{highlight(company.tagline, query)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <StagePill stage={company.stage} />
          <span className="text-xs text-slate-500">{company.sector}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {company.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-lg border border-slate-200 bg-slate-100/70 px-2 py-1 text-xs text-slate-700">
              {tag}
            </span>
          ))}
        </div>
        {lastSignal ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2">
            <p className="text-xs text-slate-500">
              <span className="font-medium text-slate-700">{lastSignal.title}</span> | {lastSignal.date}
            </p>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <SaveToListButton companyId={company.id} compact />
        <Link
          href={`/companies/${company.id}`}
          className="inline-flex items-center gap-1 text-sm text-teal-700 hover:text-teal-800"
        >
          Open
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
