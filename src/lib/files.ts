import type { FileRow } from "@/lib/db/schema";

/** Resolve the actual URL for a file row. Repo files are served from /public; blob files live at a full Vercel Blob URL already stored in `path`. */
export function getFileUrl(file: Pick<FileRow, "source" | "path">): string {
  if (file.source === "blob") return file.path;
  // repo: ensure leading slash
  return file.path.startsWith("/") ? file.path : `/${file.path}`;
}

export type FileType =
  | "question_bank"
  | "answer_key"
  | "exam"
  | "exam_solution"
  | "review"
  | "video";

type FileTypeMeta = {
  labelAr: string;
  tab: "bank" | "exams" | "review" | "videos";
  toneClass: string;
};

export const FILE_TYPE_META: Record<FileType, FileTypeMeta> = {
  question_bank: {
    labelAr: "بنك الأسئلة",
    tab: "bank",
    toneClass: "bg-[color-mix(in_oklab,var(--info)_14%,transparent)] text-[var(--info)]",
  },
  answer_key: {
    labelAr: "حل بنك الأسئلة",
    tab: "bank",
    toneClass: "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[var(--success)]",
  },
  exam: {
    labelAr: "الاختبارات",
    tab: "exams",
    toneClass: "bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-[var(--danger)]",
  },
  exam_solution: {
    labelAr: "حل الاختبارات",
    tab: "exams",
    toneClass: "bg-[color-mix(in_oklab,#8B5CF6_18%,transparent)] text-[#7C3AED]",
  },
  review: {
    labelAr: "مراجعة",
    tab: "review",
    toneClass: "bg-[color-mix(in_oklab,var(--romi-gold)_18%,transparent)] text-[var(--romi-gold-dark)]",
  },
  video: {
    labelAr: "فيديوهات شرح",
    tab: "videos",
    toneClass: "bg-[color-mix(in_oklab,#EF4444_14%,transparent)] text-[#DC2626]",
  },
};

/** Extract a YouTube video ID from any common URL form
 * (watch?v=, youtu.be/, /embed/, /shorts/) or return the input
 * if it's already an 11-char ID. Returns null on failure. */
export function extractYoutubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
    // youtu.be/ID or /embed/ID or /shorts/ID
    const m = u.pathname.match(/(?:^|\/)(?:embed|shorts)\/([\w-]{11})|^\/([\w-]{11})$/);
    if (m) return m[1] ?? m[2] ?? null;
  } catch {
    return null;
  }
  return null;
}

/** Legacy types (summary/update/other) that may still exist in the DB
 * before migration. Defensively map them to question_bank for display. */
const LEGACY_FALLBACK: FileTypeMeta = FILE_TYPE_META.question_bank;

export function getFileTypeMeta(type: string): FileTypeMeta {
  return (FILE_TYPE_META as Record<string, FileTypeMeta>)[type] ?? LEGACY_FALLBACK;
}

export function formatSize(bytes: number | null | undefined): string {
  if (!bytes || bytes < 1024) return `${bytes ?? 0} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
