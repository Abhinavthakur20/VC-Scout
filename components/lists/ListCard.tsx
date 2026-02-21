"use client";

import { useState } from "react";
import { ChevronDown, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { exportCompaniesCsv, exportCompaniesJson } from "@/lib/export";
import type { Company, UserList } from "@/lib/types";

interface ListCardProps {
  list: UserList & { companies: Company[] };
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string, color: string) => void;
  onRemoveCompany: (listId: string, companyId: string) => void;
}

export function ListCard({ list, onDelete, onUpdate, onRemoveCompany }: ListCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const [color, setColor] = useState(list.color);

  return (
    <Card className="motion-enter p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {editing ? (
            <div className="space-y-2">
              <Input aria-label="Edit list name" value={name} onChange={(event) => setName(event.target.value)} />
              <input
                aria-label="Edit list color"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: list.color }} />
                <h3 className="text-lg font-semibold">{list.name}</h3>
              </div>
              {list.description ? <p className="text-sm text-slate-500">{list.description}</p> : null}
              <p className="mt-1 text-xs text-slate-400">
                {list.companies.length} companies | Created {new Date(list.createdAt).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setExpanded((prev) => !prev)}>
            <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Collapse" : "Expand"}
          </Button>
          {editing ? (
            <Button
              size="sm"
              onClick={() => {
                onUpdate(list.id, name, color);
                setEditing(false);
                toast.success("List updated");
              }}
            >
              Save
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              exportCompaniesCsv(list.companies, `${list.name}-companies.csv`);
              toast.success("CSV exported");
            }}
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              exportCompaniesJson(list.companies, `${list.name}-companies.json`);
              toast.success("JSON exported");
            }}
          >
            <Download className="h-4 w-4" />
            JSON
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(list.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200/80">
          {list.companies.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No companies in this list yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80">
                <tr className="text-left text-slate-400">
                  <th className="p-2">Company</th>
                  <th className="p-2">Stage</th>
                  <th className="p-2">Sector</th>
                  <th className="p-2">Thesis Score</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.companies.map((company) => (
                  <tr key={company.id} className="border-t border-slate-200 transition-colors hover:bg-slate-50/70">
                    <td className="p-2">{company.name}</td>
                    <td className="p-2">{company.stage}</td>
                    <td className="p-2">{company.sector}</td>
                    <td className="p-2">{company.thesisScore}</td>
                    <td className="p-2">
                      <Button size="sm" variant="ghost" onClick={() => onRemoveCompany(list.id, company.id)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </Card>
  );
}
