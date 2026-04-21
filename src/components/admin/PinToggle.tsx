"use client";

import { useTransition } from "react";
import { Pin, PinOff, Loader2 } from "lucide-react";

type Props = {
  id: string;
  pinned: boolean;
  action: (id: string) => Promise<unknown>;
};

export function PinToggle({ id, pinned, action }: Props) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(async () => void (await action(id)))}
      disabled={pending}
      aria-label={pinned ? "إلغاء التثبيت" : "تثبيت"}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-default)] border transition-colors disabled:opacity-60 ${
        pinned
          ? "border-[var(--romi-gold)] bg-[color-mix(in_oklab,var(--romi-gold)_14%,transparent)] text-[var(--romi-gold-dark)]"
          : "border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--romi-gold)] hover:text-[var(--romi-gold-dark)]"
      }`}
    >
      {pending ? (
        <Loader2 size={13} className="animate-spin" />
      ) : pinned ? (
        <Pin size={13} />
      ) : (
        <PinOff size={13} />
      )}
    </button>
  );
}
