"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleBookmark } from "@/lib/bookmarks/actions";

type Props = {
  fileId: string;
  initial: boolean;
  size?: "sm" | "md";
};

export function BookmarkButton({ fileId, initial, size = "md" }: Props) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(initial);

  const iconSize = size === "sm" ? 16 : 18;

  function onClick() {
    startTransition(async () => {
      setOptimistic(!optimistic);
      const result = await toggleBookmark(fileId);
      if (!result.ok) {
        // revert via transition — useOptimistic auto-reverts on transition end without commit
        console.error(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={optimistic ? "إزالة من المحفوظات" : "حفظ"}
      className={`inline-flex items-center justify-center rounded-[var(--radius-default)] border border-[var(--border-default)] text-[var(--text-secondary)] transition-colors hover:border-[var(--romi-gold)] hover:text-[var(--romi-gold-dark)] disabled:opacity-60 ${
        size === "sm" ? "h-8 w-8" : "h-9 w-9"
      } ${optimistic ? "border-[var(--romi-gold)] text-[var(--romi-gold-dark)] bg-[color-mix(in_oklab,var(--romi-gold)_12%,transparent)]" : ""}`}
    >
      {optimistic ? <BookmarkCheck size={iconSize} /> : <Bookmark size={iconSize} />}
    </button>
  );
}
