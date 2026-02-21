"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";

export function SaveToListButton({
  companyId,
  compact = false,
}: {
  companyId: string;
  compact?: boolean;
}) {
  const { lists, addCompanyToList } = useAppStore();

  const select = useMemo(
    () => (
      <Select
        aria-label="Add to list"
        className={compact ? "h-8 min-w-[108px] text-xs" : "h-9 min-w-[160px] text-xs"}
        defaultValue=""
        onChange={(event) => {
          if (!event.target.value) return;
          addCompanyToList(event.target.value, companyId);
          toast.success("Saved to list");
          event.currentTarget.value = "";
        }}
      >
        <option value="">Add to list...</option>
        {lists.map((list) => (
          <option value={list.id} key={list.id}>
            {list.name}
          </option>
        ))}
      </Select>
    ),
    [addCompanyToList, companyId, compact, lists],
  );

  if (lists.length === 0) {
    return (
      <Button variant="outline" size={compact ? "sm" : "default"} disabled aria-label="No lists available">
        <BookmarkPlus className="h-4 w-4" />
        {!compact ? "No lists yet" : null}
      </Button>
    );
  }

  return select;
}
