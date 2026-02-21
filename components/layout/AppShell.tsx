"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { KeyboardShortcuts } from "@/components/layout/KeyboardShortcuts";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-transparent text-slate-900">
      <KeyboardShortcuts />
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
      <main className="motion-enter px-4 pb-10 pt-8 transition-all duration-300 md:ml-[18.75rem] md:px-4">
        <div className="app-frame">{children}</div>
      </main>
    </div>
  );
}
