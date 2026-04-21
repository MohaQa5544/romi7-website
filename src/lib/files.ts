import type { FileRow } from "@/lib/db/schema";

/** Resolve the actual URL for a file row. Repo files are served from /public; blob files live at a full Vercel Blob URL already stored in `path`. */
export function getFileUrl(file: Pick<FileRow, "source" | "path">): string {
  if (file.source === "blob") return file.path;
  // repo: ensure leading slash
  return file.path.startsWith("/") ? file.path : `/${file.path}`;
}

export type FileType = FileRow["type"];

export const FILE_TYPE_META: Record<
  FileType,
  { labelAr: string; tab: "papers" | "exams" | "answers" | "other"; toneClass: string }
> = {
  question_bank: {
    labelAr: "بنك أسئلة",
    tab: "papers",
    toneClass: "bg-[color-mix(in_oklab,var(--info)_14%,transparent)] text-[var(--info)]",
  },
  summary: {
    labelAr: "ملخص",
    tab: "papers",
    toneClass: "bg-[color-mix(in_oklab,var(--romi-navy)_14%,transparent)] text-[var(--romi-navy)]",
  },
  update: {
    labelAr: "تحديث",
    tab: "papers",
    toneClass: "bg-[color-mix(in_oklab,var(--warning)_20%,transparent)] text-[var(--warning)]",
  },
  exam: {
    labelAr: "اختبار",
    tab: "exams",
    toneClass: "bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-[var(--danger)]",
  },
  exam_solution: {
    labelAr: "حل اختبار",
    tab: "exams",
    toneClass: "bg-[color-mix(in_oklab,#8B5CF6_18%,transparent)] text-[#7C3AED]",
  },
  answer_key: {
    labelAr: "مفتاح الإجابات",
    tab: "answers",
    toneClass: "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[var(--success)]",
  },
  other: {
    labelAr: "ملف",
    tab: "other",
    toneClass: "bg-[var(--surface-2)] text-[var(--text-secondary)]",
  },
};

export function formatSize(bytes: number | null | undefined): string {
  if (!bytes || bytes < 1024) return `${bytes ?? 0} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
