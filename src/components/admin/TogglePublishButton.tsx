"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type Props = {
  id: string;
  isPublished: boolean;
  action: (id: string) => Promise<unknown>;
};

export function TogglePublishButton({ id, isPublished, action }: Props) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await action(id)))}
      aria-label={isPublished ? "إخفاء" : "نشر"}
      className={`inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-default)] border px-2.5 text-xs font-medium transition-colors disabled:opacity-60 ${
        isPublished
          ? "border-[var(--success)]/30 bg-[color-mix(in_oklab,var(--success)_10%,transparent)] text-[var(--success)] hover:bg-[color-mix(in_oklab,var(--success)_18%,transparent)]"
          : "border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--text-secondary)] hover:text-[var(--text-secondary)]"
      }`}
    >
      {pending ? (
        <Loader2 size={12} className="animate-spin" />
      ) : isPublished ? (
        <Eye size={12} />
      ) : (
        <EyeOff size={12} />
      )}
      {isPublished ? "منشور" : "مخفي"}
    </button>
  );
}
