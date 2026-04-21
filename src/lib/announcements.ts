import type { announcements } from "@/lib/db/schema";

export type Severity = typeof announcements.$inferSelect.severity;

export const SEVERITY_META: Record<
  Severity,
  { label: string; container: string; iconColor: string; accent: string }
> = {
  info: {
    label: "إعلان",
    container:
      "border-[color-mix(in_oklab,var(--info)_30%,transparent)] bg-[color-mix(in_oklab,var(--info)_8%,transparent)]",
    iconColor: "text-[var(--info)]",
    accent: "text-[var(--info)]",
  },
  success: {
    label: "خبر سارّ",
    container:
      "border-[color-mix(in_oklab,var(--success)_30%,transparent)] bg-[color-mix(in_oklab,var(--success)_8%,transparent)]",
    iconColor: "text-[var(--success)]",
    accent: "text-[var(--success)]",
  },
  warning: {
    label: "تنبيه",
    container:
      "border-[var(--romi-gold)]/35 bg-[var(--romi-gold)]/10",
    iconColor: "text-[var(--romi-gold-dark)]",
    accent: "text-[var(--romi-gold-dark)]",
  },
  urgent: {
    label: "عاجل",
    container:
      "border-[var(--danger)]/35 bg-[color-mix(in_oklab,var(--danger)_8%,transparent)]",
    iconColor: "text-[var(--danger)]",
    accent: "text-[var(--danger)]",
  },
};

export function formatDateAr(date: Date): string {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
