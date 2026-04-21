"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

type Props = {
  id: string;
  confirmMessage: string;
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
  size?: "sm" | "md";
};

export function DeleteButton({ id, confirmMessage, action, size = "md" }: Props) {
  const [pending, start] = useTransition();
  const dims = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const icon = size === "sm" ? 13 : 14;

  function onClick() {
    if (!window.confirm(confirmMessage)) return;
    start(async () => {
      const res = await action(id);
      if (!res.ok) window.alert(res.error ?? "فشل الحذف");
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label="حذف"
      className={`inline-flex ${dims} items-center justify-center rounded-[var(--radius-default)] border border-[var(--border-default)] text-[var(--text-muted)] transition-colors hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-60`}
    >
      {pending ? <Loader2 size={icon} className="animate-spin" /> : <Trash2 size={icon} />}
    </button>
  );
}
