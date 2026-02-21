"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, ListChecks, Search, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/companies", label: "Discover", icon: Search, disabled: false },
  { href: "/lists", label: "Lists", icon: ListChecks, disabled: false },
  { href: "/saved", label: "Saved Searches", icon: Bookmark, disabled: false },
  { href: "", label: "Settings", icon: Settings, disabled: true },
];

const thesisTags = ["AI Infrastructure", "Dev Tools", "FinTech"];

export function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside className="ui-shell fixed inset-y-4 left-4 z-40 hidden w-64 overflow-hidden rounded-3xl px-4 py-5 text-slate-100 md:flex md:flex-col">
        <div className="mb-8 flex items-center gap-3 px-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-sm" />
          <div>
            <p className="text-lg font-semibold tracking-tight">VC Scout</p>
            <p className="text-xs text-slate-300/80">Intelligence OS</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = !item.disabled && isActive(item.href);

            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center rounded-xl px-3 py-2.5 text-sm text-slate-400"
                >
                  <Icon className="h-4 w-4" />
                  <span className="ml-2">{item.label}</span>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center rounded-xl px-3 py-2.5 text-sm text-slate-200/90 transition-all duration-200 hover:bg-white/10 hover:text-white",
                  active && "bg-teal-500/20 text-white shadow-[inset_0_0_0_1px_rgba(45,212,191,0.35)]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="ml-2">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-slate-300">Thesis</p>
          <div className="flex flex-wrap gap-2">
            {thesisTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full border border-teal-300/40 bg-teal-400/10 px-2.5 py-1 text-xs text-teal-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />

          <aside className="motion-enter ui-shell relative h-full w-72 overflow-hidden px-4 py-5 text-slate-100">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500" />
                <p className="text-base font-semibold">VC Scout</p>
              </div>
              <button
                type="button"
                aria-label="Close navigation menu"
                className="rounded-lg p-2 text-slate-200 transition hover:bg-white/10"
                onClick={onCloseMobile}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = !item.disabled && isActive(item.href);

                if (item.disabled) {
                  return (
                    <div
                      key={item.label}
                      className="flex cursor-not-allowed items-center rounded-xl px-3 py-2.5 text-sm text-slate-400"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="ml-2">{item.label}</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center rounded-xl px-3 py-2.5 text-sm text-slate-200/90 transition-all duration-200 hover:bg-white/10 hover:text-white",
                      active && "bg-teal-500/20 text-white shadow-[inset_0_0_0_1px_rgba(45,212,191,0.35)]",
                    )}
                    onClick={onCloseMobile}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="ml-2">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}

