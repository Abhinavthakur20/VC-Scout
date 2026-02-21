"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListCard } from "@/components/lists/ListCard";
import { CreateListDialog } from "@/components/lists/CreateListDialog";
import { useLists } from "@/hooks/useLists";

export default function ListsPage() {
  const [open, setOpen] = useState(false);
  const { lists, createList, deleteList, updateList, removeCompanyFromList } = useLists();

  return (
    <div className="space-y-6">
      <div className="motion-enter ui-panel-strong rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Lists</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio List Manager</h1>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-600">
            {lists.length} active list{lists.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="motion-enter flex items-center justify-between">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New List
        </Button>
      </div>

      {lists.length === 0 ? (
        <Card className="motion-enter motion-enter-delay-1 p-10 text-center">
          <p className="mb-2 text-lg font-semibold">No lists yet</p>
          <p className="mb-5 text-sm text-slate-500">Create your first list to start organizing companies.</p>
          <Button onClick={() => setOpen(true)}>Create List</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onDelete={(id) => {
                deleteList(id);
                toast.success("List deleted");
              }}
              onUpdate={updateList}
              onRemoveCompany={removeCompanyFromList}
            />
          ))}
        </div>
      )}

      <CreateListDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(name, description, color) => {
          createList(name, description, color);
          toast.success("List created");
          setOpen(false);
        }}
      />
    </div>
  );
}
