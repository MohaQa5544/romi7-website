"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react";
import { MathContent } from "@/components/math/MathRenderer";
import { submitQuizAttempt } from "@/lib/quiz/actions";

type Question = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
};

type Props = {
  unitId: string;
  unitName: string;
  attemptId: string;
  questions: Question[];
};

// Mulberry32 PRNG seeded from attempt id, for stable-but-per-attempt option shuffle
function hash(s: string) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffleOptions<T>(arr: T[], rand: () => number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizRunner({ unitId, unitName, attemptId, questions }: Props) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, null])),
  );
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef<number>(Date.now());
  const [, forceTick] = useState(0);

  // stable shuffle per attempt
  const shuffled = useMemo(() => {
    const rand = hash(attemptId);
    return questions.map((q) => ({ ...q, options: shuffleOptions(q.options, rand) }));
  }, [attemptId, questions]);

  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  function pick(qId: string, optId: string) {
    setAnswers((a) => ({ ...a, [qId]: optId }));
  }

  const q = shuffled[idx];
  const total = shuffled.length;
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const unansweredIndices = shuffled
    .map((x, i) => (answers[x.id] ? null : i))
    .filter((i): i is number => i !== null);

  async function handleSubmit() {
    setError(null);
    const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
    start(async () => {
      const res = await submitQuizAttempt({
        attemptId,
        answers,
        timeSpentSeconds: elapsed,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/quiz/${unitId}/results/${attemptId}`);
    });
  }

  const elapsedSec = Math.floor((Date.now() - startedAt.current) / 1000);
  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const ss = String(elapsedSec % 60).padStart(2, "0");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      {/* header */}
      <div className="mb-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>
          {unitName} — السؤال {idx + 1} من {total}
        </span>
        <span className="font-latin tabular-nums">{mm}:{ss}</span>
      </div>
      {/* progress */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          style={{ width: `${((idx + 1) / total) * 100}%` }}
          className="h-full bg-[var(--romi-gold)] transition-all"
        />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-5">
        <div className="mb-4 text-base leading-relaxed text-[var(--text-primary)]">
          <MathContent text={q.text} />
        </div>
        <div className="space-y-2">
          {q.options.map((o, i) => {
            const selected = answers[q.id] === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => pick(q.id, o.id)}
                className={`flex w-full items-center gap-3 rounded-[var(--radius-default)] border-[1.5px] px-4 py-3 text-start text-sm transition-colors ${
                  selected
                    ? "border-[var(--romi-gold)] bg-[color-mix(in_oklab,var(--romi-gold)_10%,transparent)] text-[var(--text-primary)]"
                    : "border-[var(--border-default)] bg-[var(--surface-0)] text-[var(--text-secondary)] hover:border-[var(--romi-gold-dark)]"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] ${
                    selected
                      ? "border-[var(--romi-gold)] bg-[var(--romi-gold)] text-white"
                      : "border-[var(--border-default)] text-[var(--text-muted)]"
                  }`}
                >
                  {String.fromCharCode(1633 + i)}
                </span>
                <span className="flex-1">
                  <MathContent text={o.text} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* nav */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="btn-outline inline-flex items-center gap-1 text-sm disabled:opacity-40"
        >
          <ChevronRight size={14} />
          السابق
        </button>

        <span className="text-xs text-[var(--text-muted)]">
          أُجيب: {answeredCount} / {total}
        </span>

        {idx < total - 1 ? (
          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
            className="btn-gold inline-flex items-center gap-1 text-sm"
          >
            التالي
            <ChevronLeft size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending}
            className="btn-gold inline-flex items-center gap-1 text-sm"
          >
            {pending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            تسليم
          </button>
        )}
      </div>

      {unansweredIndices.length > 0 && idx === total - 1 && (
        <p className="mt-3 text-[11px] text-[var(--warning)]">
          لم تُجب بعد عن: {unansweredIndices.map((i) => i + 1).join("، ")}.
          يمكنك التسليم الآن وسيتم احتسابها خاطئة.
        </p>
      )}

      {/* question grid navigator */}
      <div className="mt-6 grid grid-cols-10 gap-1.5">
        {shuffled.map((x, i) => {
          const answered = !!answers[x.id];
          const isCurrent = i === idx;
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`الذهاب إلى السؤال ${i + 1}`}
              className={`h-8 rounded-[var(--radius-default)] border text-[11px] font-medium transition-colors ${
                isCurrent
                  ? "border-[var(--romi-gold)] bg-[var(--romi-gold)] text-white"
                  : answered
                    ? "border-[var(--success)]/40 bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-[var(--success)]"
                    : "border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--romi-gold-dark)]"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-[var(--radius-default)] border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-3 py-2 text-xs text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
