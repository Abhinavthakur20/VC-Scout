"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LIST_COLORS } from "@/lib/constants";

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description: string, color: string) => void;
}

export function CreateListDialog({ open, onOpenChange, onSubmit }: CreateListDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(LIST_COLORS[0]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create List</DialogTitle>
          <DialogDescription>Organize companies into thesis-specific watchlists.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            aria-label="List name"
            placeholder="Developer Infrastructure targets"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            aria-label="List description"
            placeholder="Optional description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <div>
            <p className="mb-2 text-sm text-slate-500">Color</p>
            <div className="flex flex-wrap gap-2">
              {LIST_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Pick color ${option}`}
                  className={`h-6 w-6 rounded-full border transition ${
                    color === option ? "border-slate-900 scale-110" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: option }}
                  onClick={() => setColor(option)}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!name.trim()) return;
              onSubmit(name.trim(), description.trim(), color);
              setName("");
              setDescription("");
              setColor(LIST_COLORS[0]);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
