"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { formatRelativeHours } from "@/lib/utils";

export function NotesPanel({ companyId, focusSignal }: { companyId: string; focusSignal: number }) {
  const { notes, upsertNote, deleteNote } = useAppStore();
  const notesForCompany = useMemo(
    () => notes.filter((note) => note.companyId === companyId).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [companyId, notes],
  );
  const [draft, setDraft] = useState(notesForCompany[0]?.content ?? "");
  const timerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setDraft(notesForCompany[0]?.content ?? "");
  }, [companyId, notesForCompany]);

  useEffect(() => {
    if (focusSignal === 0) return;
    textareaRef.current?.focus();
  }, [focusSignal]);

  const persistNote = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      if (!draft.trim()) return;
      upsertNote(companyId, draft.trim());
      toast.success("Note saved");
    }, 500);
  };

  return (
    <section id="notes-panel" className="motion-enter motion-enter-delay-3 ui-panel rounded-2xl p-5">
      <h2 className="mb-3 text-xl font-semibold">Notes</h2>
      <Textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={persistNote}
        placeholder="Write analyst notes. Auto-saves on blur."
        aria-label="Company notes"
        className="min-h-[120px]"
      />

      <div className="mt-4 space-y-2">
        {notesForCompany.length === 0 ? (
          <p className="text-sm text-slate-400">No notes yet.</p>
        ) : (
          notesForCompany.map((note) => (
            <div key={note.id} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-slate-400">Updated {formatRelativeHours(note.updatedAt)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Delete note"
                  onClick={() => {
                    deleteNote(note.id);
                    toast.success("Note deleted");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-800">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
