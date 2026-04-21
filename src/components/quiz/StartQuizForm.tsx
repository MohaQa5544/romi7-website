"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlayCircle } from "lucide-react";
import { startQuizAttempt, type StartState } from "@/lib/quiz/actions";

export function StartQuizForm({ unitId, available }: { unitId: string; available: number }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<StartState, FormData>(
    startQuizAttempt,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      router.push(`/quiz/${unitId}/attempt/${state.attemptId}`);
    }
  }, [state, router, unitId]);

  const max = Math.min(available, 20);
  const options = Array.from(new Set([5, 10, 15, max].filter((n) => n >= 3 && n <= max))).sort(
    (a, b) => a - b,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="unitId" value={unitId} />
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[var(--text-secondary)]">
          عدد الأسئلة
        </label>
        <div className="flex flex-wrap gap-2">
          {options.map((n, i) => (
            <label
              key={n}
              className="relative cursor-pointer"
            >
              <input
                type="radio"
                name="count"
                value={n}
                defaultChecked={i === Math.min(1, options.length - 1)}
                className="peer sr-only"
              />
              <span className="inline-flex h-10 min-w-[3.5rem] items-center justify-center rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] px-3 text-sm font-medium transition-colors peer-checked:border-[var(--romi-gold)] peer-checked:bg-[color-mix(in_oklab,var(--romi-gold)_12%,transparent)] peer-checked:text-[var(--romi-gold-dark)]">
                {n}
              </span>
            </label>
          ))}
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">متوفّر: {available} سؤال</p>
      </div>

      {state && !state.ok && (
        <p className="rounded-[var(--radius-default)] border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-3 py-2 text-xs text-[var(--danger)]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-gold w-full text-sm">
        {pending ? (
          <Loader2 size={14} className="me-1.5 inline animate-spin" />
        ) : (
          <PlayCircle size={14} className="me-1.5 inline" />
        )}
        ابدأ الاختبار
      </button>
    </form>
  );
}
