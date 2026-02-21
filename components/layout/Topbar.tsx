"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { isMac } from "@/lib/utils";

const pageLabels: Record<string, string> = {
  "/companies": "Discover Companies",
  "/lists": "Portfolio Lists",
  "/saved": "Saved Searches",
};

export function Topbar({
  onOpenMobileNav,
}: {
  onOpenMobileNav: () => void;
}) {
  const pathname = usePathname();
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const hint = useMemo(() => (isMac() ? "CMD+K" : "CTRL+K"), []);

  const pageTitle = Object.entries(pageLabels).find(([route]) => pathname.startsWith(route))?.[1] ?? "Workspace";

  return (
    <header className="sticky top-0 z-40 px-4 py-2 md:ml-[18.75rem]">
      <div className="ui-panel app-frame rounded-2xl border-teal-200/80 shadow-[0_16px_30px_-24px_rgba(15,118,110,0.5)]">
        <div className="flex h-16 items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation menu"
            className="text-teal-700 hover:bg-teal-50/60 md:hidden"
            onClick={onOpenMobileNav}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden min-w-[170px] lg:block">
            <p className="text-xs uppercase tracking-[0.14em] text-teal-700/80">Navigation</p>
            <p className="text-sm font-semibold text-teal-900">{pageTitle}</p>
          </div>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600/70" />
            <Input
              id="global-search"
              aria-label="Global search"
              placeholder={pathname.startsWith("/companies") ? "Search companies, signals, tags..." : "Search"}
              className="h-11 pl-9 pr-16"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-teal-200 px-1.5 py-0.5 text-[10px] text-teal-700">
              {hint}
            </span>
          </div>

          <Button
            variant="secondary"
            size="icon"
            aria-label="Notifications"
            className="hidden border-teal-200 text-teal-700 hover:bg-teal-50/50 sm:inline-flex"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700" />
        </div>
      </div>
    </header>
  );
}
