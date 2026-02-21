"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

export function CompanyLogo({
  name,
  logoUrl,
  size,
  className,
}: {
  name: string;
  domain?: string;
  logoUrl?: string;
  size: number;
  className?: string;
}) {
  const sources = useMemo(() => {
    const candidates = [logoUrl].filter(Boolean);
    return Array.from(new Set(candidates));
  }, [logoUrl]);

  const [srcIndex, setSrcIndex] = useState(0);
  const currentSrc = sources[srcIndex];
  const initials = initialsFromName(name);

  useEffect(() => {
    setSrcIndex(0);
  }, [sources]);

  if (!currentSrc) {
    return (
      <div
        aria-label={`${name} logo fallback`}
        className={cn(
          "inline-flex items-center justify-center bg-slate-200 text-[10px] font-semibold text-slate-700",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={cn("object-cover", className)}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        setSrcIndex((prev) => prev + 1);
      }}
    />
  );
}
