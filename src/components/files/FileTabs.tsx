"use client";

import { useState } from "react";
import type { FileRow } from "@/lib/db/schema";
import { FILE_TYPE_META } from "@/lib/files";
import { FileCard } from "./FileCard";

type Tab = "papers" | "exams" | "answers";

const TAB_LABEL: Record<Tab, string> = {
  papers: "الأوراق",
  exams: "الاختبارات",
  answers: "مفاتيح الإجابات",
};

type Props = {
  files: FileRow[];
  bookmarkedIds: Set<string>;
};

export function FileTabs({ files, bookmarkedIds }: Props) {
  const grouped: Record<Tab, FileRow[]> = { papers: [], exams: [], answers: [] };
  for (const f of files) {
    const tab = FILE_TYPE_META[f.type].tab;
    if (tab === "other") grouped.papers.push(f);
    else grouped[tab].push(f);
  }

  const availableTabs: Tab[] = (["papers", "exams", "answers"] as Tab[]).filter(
    (t) => grouped[t].length > 0,
  );
  const [active, setActive] = useState<Tab>(availableTabs[0] ?? "papers");

  if (availableTabs.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-8 text-center text-sm text-[var(--text-muted)]">
        لم تُضَف ملفات لهذه الوحدة بعد.
      </div>
    );
  }

  const current = grouped[active];

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)]"
      >
        {availableTabs.map((t) => {
          const isActive = t === active;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t)}
              className={`relative -mb-px px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {TAB_LABEL[t]}
              <span className="ms-1.5 rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
                {grouped[t].length}
              </span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] bg-[var(--romi-gold)]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {current.map((f) => (
          <FileCard key={f.id} file={f} bookmarked={bookmarkedIds.has(f.id)} />
        ))}
      </div>
    </div>
  );
}
