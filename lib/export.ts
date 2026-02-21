import type { Company } from "@/lib/types";

const CSV_HEADERS = [
  "name",
  "domain",
  "stage",
  "sector",
  "thesisScore",
  "fundingTotal",
  "location",
  "foundedYear",
];

function csvEscape(value: string | number | undefined) {
  if (value === undefined || value === null) {
    return "";
  }
  const raw = String(value).replaceAll('"', '""');
  return `"${raw}"`;
}

export function companiesToCsv(companies: Company[]) {
  const lines = companies.map((company) =>
    [
      csvEscape(company.name),
      csvEscape(company.domain),
      csvEscape(company.stage),
      csvEscape(company.sector),
      csvEscape(company.thesisScore),
      csvEscape(company.fundingTotal),
      csvEscape(company.location),
      csvEscape(company.foundedYear),
    ].join(","),
  );
  return `${CSV_HEADERS.join(",")}\n${lines.join("\n")}`;
}

export function downloadTextFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCompaniesCsv(companies: Company[], filename = "companies.csv") {
  const csv = companiesToCsv(companies);
  downloadTextFile(filename, csv, "text/csv;charset=utf-8;");
}

export function exportCompaniesJson(companies: Company[], filename = "companies.json") {
  downloadTextFile(filename, JSON.stringify(companies, null, 2), "application/json;charset=utf-8;");
}
