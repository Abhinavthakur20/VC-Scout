"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";

export function KeyboardShortcuts() {
  const pathname = usePathname();
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inInput =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      const mod = event.metaKey || event.ctrlKey;

      if ((mod && event.key.toLowerCase() === "k") || (!inInput && event.key === "/")) {
        event.preventDefault();
        const search = document.getElementById("global-search") as HTMLInputElement | null;
        search?.focus();
        search?.select();
      }

      if (mod && event.key.toLowerCase() === "e" && pathname.startsWith("/companies/")) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("shortcut:enrich"));
      }

      if (mod && event.key.toLowerCase() === "s" && pathname === "/companies") {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("shortcut:save-search"));
      }

      if (event.key === "Escape") {
        window.dispatchEvent(new CustomEvent("shortcut:escape"));
        if (!inInput) {
          setSearchQuery("");
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, setSearchQuery]);

  return null;
}
