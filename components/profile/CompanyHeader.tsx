"use client";

import Link from "next/link";
import { ExternalLink, Github, Globe, Linkedin, Twitter } from "lucide-react";
import { CompanyLogo } from "@/components/companies/CompanyLogo";
import { StagePill, ThesisScoreBadge } from "@/components/companies/company-ui";
import { SaveToListButton } from "@/components/profile/SaveToListButton";
import { Button } from "@/components/ui/button";
import type { Company } from "@/lib/types";

interface CompanyHeaderProps {
  company: Company;
  onEnrich: () => void;
  onAddNote: () => void;
  onExport: () => void;
}

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-500">Thesis Match</span>
        <ThesisScoreBadge score={score} />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100/90">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href?: string;
  label: string;
  icon: React.ReactNode;
}) {
  if (!href) return null;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function CompanyHeader({ company, onEnrich, onAddNote, onExport }: CompanyHeaderProps) {
  return (
    <section className="motion-enter ui-panel rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <CompanyLogo name={company.name} domain={company.domain} logoUrl={company.logoUrl} size={64} className="h-16 w-16 rounded-xl" />
          <div>
            <h1 className="text-3xl font-semibold">{company.name}</h1>
            <p className="text-slate-500">{company.tagline}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link
                href={company.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono-data text-xs text-teal-700 hover:text-teal-800"
              >
                {company.domain} <ExternalLink className="ml-1 inline h-3 w-3" />
              </Link>
              <span className="text-xs text-slate-400">Founded {company.foundedYear}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StagePill stage={company.stage} />
              <span className="ui-chip rounded-full px-2 py-1 text-xs">
                {company.sector}
              </span>
              <span className="ui-chip rounded-full px-2 py-1 text-xs">
                {company.location}
              </span>
              <span className="ui-chip rounded-full px-2 py-1 text-xs">
                {company.employeeCount ?? "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid min-w-[260px] gap-3">
          <ScoreMeter score={company.thesisScore} />
          <p className="text-sm text-slate-500">{company.thesisExplain}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SocialLink href={company.websiteUrl} label="Website" icon={<Globe className="h-4 w-4" />} />
        <SocialLink href={company.linkedinUrl} label="LinkedIn" icon={<Linkedin className="h-4 w-4" />} />
        <SocialLink href={company.githubUrl} label="GitHub" icon={<Github className="h-4 w-4" />} />
        <SocialLink href={company.twitterUrl} label="Twitter" icon={<Twitter className="h-4 w-4" />} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={onEnrich}>Enrich</Button>
        <SaveToListButton companyId={company.id} />
        <Button variant="secondary" onClick={onAddNote}>
          Add Note
        </Button>
        <Button variant="outline" onClick={onExport}>
          Export
        </Button>
      </div>
    </section>
  );
}
