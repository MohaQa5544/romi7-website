import { asc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, XCircle, Trophy, RotateCcw, History } from "lucide-react";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { MathContent } from "@/components/math/MathRenderer";

export const metadata = { title: "نتيجة الاختبار" };

export default async function QuizResultsPage({
  params,
}: {
  params: Promise<{ unitId: string; attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { unitId, attemptId } = await params;

  const [attempt] = await db
    .select()
    .from(schema.quizAttempts)
    .where(eq(schema.quizAttempts.id, attemptId));
  if (!attempt) notFound();
  if (attempt.userId !== session.user.id) redirect("/dashboard");
  if (attempt.unitId !== unitId) notFound();
  if (!attempt.completedAt) redirect(`/quiz/${unitId}/attempt/${attemptId}`);

  const [unit] = await db.select().from(schema.units).where(eq(schema.units.id, unitId));
  if (!unit) notFound();

  const answers = await db
    .select()
    .from(schema.quizAnswers)
    .where(eq(schema.quizAnswers.attemptId, attemptId));

  const qIds = answers.map((a) => a.questionId);
  const questions = qIds.length
    ? await db.select().from(schema.questions).where(inArray(schema.questions.id, qIds))
    : [];
  const options = qIds.length
    ? await db
        .select()
        .from(schema.questionOptions)
        .where(inArray(schema.questionOptions.questionId, qIds))
        .orderBy(asc(schema.questionOptions.order))
    : [];
  const optsByQ = new Map<string, typeof options>();
  for (const o of options) {
    const arr = optsByQ.get(o.questionId) ?? [];
    arr.push(o);
    optsByQ.set(o.questionId, arr);
  }
  const qById = new Map(questions.map((q) => [q.id, q]));

  const score = attempt.scorePercent ?? 0;
  const correct = attempt.correctCount;
  const total = attempt.questionCount;
  const passed = score >= 60;
  const mm = attempt.timeSpentSeconds
    ? `${Math.floor(attempt.timeSpentSeconds / 60)}:${String(attempt.timeSpentSeconds % 60).padStart(2, "0")}`
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6">
      {/* score card */}
      <div
        className={`rounded-[var(--radius-lg)] border p-6 text-center ${
          passed
            ? "border-[var(--success)]/40 bg-[color-mix(in_oklab,var(--success)_8%,transparent)]"
            : "border-[var(--warning)]/40 bg-[color-mix(in_oklab,var(--warning)_6%,transparent)]"
        }`}
      >
        <Trophy
          size={36}
          className={`mx-auto mb-3 ${passed ? "text-[var(--success)]" : "text-[var(--warning)]"}`}
        />
        <div className="font-display text-4xl font-bold tabular-nums text-[var(--text-primary)]">
          {score.toFixed(1)}٪
        </div>
        <div className="mt-1 text-sm text-[var(--text-secondary)]">
          {correct} من {total} صحيحة
          {mm && <span className="ms-2 text-[var(--text-muted)]">· {mm}</span>}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href={`/quiz/${unitId}`} className="btn-gold text-sm">
            <RotateCcw size={14} className="me-1.5 inline" />
            اختبار جديد
          </Link>
          <Link href="/history" className="btn-outline text-sm">
            <History size={14} className="me-1.5 inline" />
            سجلّ المحاولات
          </Link>
        </div>
      </div>

      <header className="space-y-1">
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
          مراجعة الأسئلة
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">{unit.nameAr}</p>
      </header>

      <ul className="space-y-3">
        {answers.map((ans, i) => {
          const q = qById.get(ans.questionId);
          const opts = optsByQ.get(ans.questionId) ?? [];
          if (!q) return null;
          const correctOpt = opts.find((o) => o.isCorrect);
          const selectedOpt = opts.find((o) => o.id === ans.selectedOptionId);
          return (
            <li
              key={ans.id}
              className={`rounded-[var(--radius-lg)] border p-4 ${
                ans.isCorrect
                  ? "border-[var(--success)]/30 bg-[color-mix(in_oklab,var(--success)_4%,transparent)]"
                  : "border-[var(--danger)]/30 bg-[color-mix(in_oklab,var(--danger)_4%,transparent)]"
              }`}
            >
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 font-medium text-[var(--text-muted)]">
                  #{i + 1}
                </span>
                {ans.isCorrect ? (
                  <span className="inline-flex items-center gap-1 text-[var(--success)]">
                    <CheckCircle2 size={12} />
                    صحيح
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[var(--danger)]">
                    <XCircle size={12} />
                    {ans.selectedOptionId ? "خطأ" : "بدون إجابة"}
                  </span>
                )}
              </div>
              <div className="mb-3 text-sm leading-relaxed text-[var(--text-primary)]">
                <MathContent text={q.questionText} />
              </div>
              <ul className="space-y-1 text-sm">
                {opts.map((o) => {
                  const isSel = o.id === ans.selectedOptionId;
                  const isCorr = o.isCorrect;
                  const cls = isCorr
                    ? "text-[var(--success)] font-medium"
                    : isSel
                      ? "text-[var(--danger)] line-through"
                      : "text-[var(--text-secondary)]";
                  return (
                    <li key={o.id} className={`flex items-start gap-2 ${cls}`}>
                      <span className="font-latin text-[11px] text-[var(--text-muted)]">
                        {String.fromCharCode(1633 + o.order)}.
                      </span>
                      <MathContent text={o.optionText} />
                      {isCorr && <span className="text-[11px]">✓</span>}
                      {isSel && !isCorr && <span className="text-[11px]">— اختيارك</span>}
                    </li>
                  );
                })}
              </ul>
              {!ans.isCorrect && !selectedOpt && correctOpt && (
                <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                  الإجابة الصحيحة موضّحة أعلاه.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
