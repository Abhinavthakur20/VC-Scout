"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";

export function useLists() {
  const { lists, companies, addCompanyToList, removeCompanyFromList, createList, deleteList, updateList } =
    useAppStore();

  const listsWithCompanies = useMemo(
    () =>
      lists.map((list) => ({
        ...list,
        companies: companies.filter((company) => list.companyIds.includes(company.id)),
      })),
    [companies, lists],
  );

  return {
    lists: listsWithCompanies,
    createList,
    deleteList,
    updateList,
    addCompanyToList,
    removeCompanyFromList,
  };
}
