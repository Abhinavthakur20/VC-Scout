"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CompanyHeader } from "@/components/profile/CompanyHeader";
import { SignalsTimeline } from "@/components/profile/SignalsTimeline";
import { EnrichmentPanel } from "@/components/profile/EnrichmentPanel";
import { EnrichmentErrorBoundary } from "@/components/profile/EnrichmentErrorBoundary";
import { NotesPanel } from "@/components/profile/NotesPanel";
import { SaveToListButton } from "@/components/profile/SaveToListButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportCompaniesCsv, exportCompaniesJson } from "@/lib/export";
import { useAppStore } from "@/lib/store";

export default function CompanyProfilePage() {
  const params = useParams<{ id: string }>();
  const { companies, lists } = useAppStore();
  const company = companies.find((item) => item.id === params.id);
  const [enrichTrigger, setEnrichTrigger] = useState(0);
  const [noteFocusSignal, setNoteFocusSignal] = useState(0);
  const [showWhyMatch, setShowWhyMatch] = useState(false);

  useEffect(() => {
    const onEnrich = () => setEnrichTrigger((prev) => prev + 1);
    window.addEventListener("shortcut:enrich", onEnrich);
    return () => window.removeEventListener("shortcut:enrich", onEnrich);
  }, []);

  const listMemberships = useMemo(
    () => lists.filter((list) => company && list.companyIds.includes(company.id)),
    [company, lists],
  );

  if (!company) {
    return (
      <Card className="mx-auto max-w-3xl p-8 text-center">
        <h1 className="mb-3 text-2xl font-semibold">Company not found</h1>
        <Link href="/companies" className="text-teal-700 hover:text-teal-800">
          Back to discovery
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <CompanyHeader
        company={company}
        onEnrich={() => setEnrichTrigger((prev) => prev + 1)}
        onAddNote={() => setNoteFocusSignal((prev) => prev + 1)}
        onExport={() => {
          exportCompaniesJson([company], `${company.id}.json`);
          toast.success("Company exported");
        }}
      />

      <section className="motion-enter motion-enter-delay-1 ui-panel rounded-2xl p-5">
        <h2 className="mb-4 text-xl font-semibold">Funding + Overview</h2>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
            <p className="text-xs text-slate-400">Total Funding</p>
            <p className="font-semibold">{company.fundingTotal ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
            <p className="text-xs text-slate-400">Last Round</p>
            <p className="font-semibold">{company.lastFundingDate ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
            <p className="text-xs text-slate-400">Founded</p>
            <p className="font-semibold">{company.foundedYear}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
            <p className="text-xs text-slate-400">Employees</p>
            <p className="font-semibold">{company.employeeCount ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
            <p className="text-xs text-slate-400">Revenue</p>
            <p className="font-semibold">{company.revenue ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
            <p className="text-xs text-slate-400">Location</p>
            <p className="font-semibold">{company.location}</p>
          </div>
        </div>
        <p className="text-slate-700">{company.description}</p>
      </section>

      <section className="motion-enter motion-enter-delay-2 ui-panel rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Why It Matches</h2>
          <Button variant="secondary" size="sm" onClick={() => setShowWhyMatch((prev) => !prev)}>
            {showWhyMatch ? "Hide" : "Show"}
          </Button>
        </div>
        {showWhyMatch ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Thesis score: {company.thesisScore} with strong category alignment.</li>
            <li>Signal velocity indicates ongoing execution momentum.</li>
            <li>Sector and tag profile maps to fund focus priorities.</li>
          </ul>
        ) : null}
      </section>

      <SignalsTimeline signals={company.signals} />

      <EnrichmentErrorBoundary>
        <EnrichmentPanel company={company} triggerSignal={enrichTrigger} />
      </EnrichmentErrorBoundary>

      <NotesPanel companyId={company.id} focusSignal={noteFocusSignal} />

      <section className="motion-enter motion-enter-delay-3 ui-panel rounded-2xl p-5">
        <h2 className="mb-3 text-xl font-semibold">Lists</h2>
        <div className="mb-3">
          <SaveToListButton companyId={company.id} />
        </div>
        {listMemberships.length === 0 ? (
          <p className="text-sm text-slate-400">This company is not in any list yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {listMemberships.map((list) => (
              <span
                key={list.id}
                className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-700"
                style={{ borderColor: list.color, color: list.color }}
              >
                {list.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportCompaniesCsv([company], `${company.id}.csv`)}>
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportCompaniesJson([company], `${company.id}.json`)}>
            Export JSON
          </Button>
        </div>
      </section>
    </div>
  );
}
