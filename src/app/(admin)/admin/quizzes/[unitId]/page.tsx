import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { QuestionDialog } from "@/components/admin/QuestionDialog";
import { QuizAdminTabs } from "@/components/admin/QuizAdminTabs";
import { TogglePublishButton } from "@/components/admin/TogglePublishButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { MathContent } from "@/components/math/MathRenderer";
import {
  toggleQuestionPublished,
  deleteQuestion,
  toggleQuestionNeedsReview,
} from "@/lib/admin/questions-actions";

export const metadata = { title: "أسئلة الوحدة — الإدارة" };

const DIFFICULTY_LABEL = { easy: "سهل", medium: "متوسط", hard: "صعب" } as const;

export default async function AdminUnitQuestionsPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  await requireAdmin();
  const { unitId } = await params;

  const [unit] = await db.select().from(schema.units).where(eq(schema.units.id, unitId));
  if (!unit) notFound();

  const questions = await db
    .select()
    .from(schema.questions)
    .where(eq(schema.questions.unitId, unitId))
    .orderBy(asc(schema.questions.createdAt));

  const options = questions.length
    ? await db
        .select()
        .from(schema.questionOptions)
        .orderBy(asc(schema.questionOptions.order))
    : [];
  const byQ = new Map<string, typeof options>();
  for (const o of options) {
    const arr = byQ.get(o.questionId) ?? [];
    arr.push(o);
    byQ.set(o.questionId, arr);
  }
  const rows = questions.map((q) => ({ ...q, options: byQ.get(q.id) ?? [] }));
  const needsReviewCount = rows.filter((r) => r.needsReview).length;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Link href="/admin/quizzes" className="hover:text-[var(--text-primary)]">
          الاختبارات
        </Link>
        <ChevronRight size={12} className="rotate-180" />
        <span className="text-[var(--text-secondary)]">الوحدة {unit.number}</span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            أسئلة: {unit.nameAr}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {rows.length} سؤال
            {needsReviewCount > 0 && (
              <span className="ms-2 inline-flex items-center gap-1 text-[var(--warning)]">
                <AlertTriangle size={12} />
                {needsReviewCount} بحاجة مراجعة
              </span>
            )}
          </p>
        </div>
        <QuestionDialog unitId={unit.id} />
      </header>

      <QuizAdminTabs unitId={unit.id} active="questions" />

      {rows.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center text-sm text-[var(--text-muted)]">
          لا توجد أسئلة بعد. أضف سؤالاً لبدء إنشاء اختبار الوحدة.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((q, idx) => (
            <li
              key={q.id}
              className={`rounded-[var(--radius-lg)] border p-4 ${
                q.needsReview
                  ? "border-[var(--warning)]/40 bg-[color-mix(in_oklab,var(--warning)_5%,transparent)]"
                  : "border-[var(--border-subtle)] bg-[var(--surface-0)]"
              }`}
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[var(--text-muted)]">
                      #{idx + 1}
                    </span>
                    {q.difficulty && (
                      <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[var(--text-secondary)]">
                        {DIFFICULTY_LABEL[q.difficulty]}
                      </span>
                    )}
                    {q.lessonCode && (
                      <span className="font-latin text-[var(--text-muted)]">{q.lessonCode}</span>
                    )}
                    {q.needsReview && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] px-2 py-0.5 text-[var(--warning)]">
                        <AlertTriangle size={10} /> مراجعة
                      </span>
                    )}
                  </div>
                  <div className="text-sm leading-relaxed text-[var(--text-primary)]">
                    <MathContent text={q.questionText} />
                  </div>
                  <ol className="space-y-1 ps-4 text-sm text-[var(--text-secondary)]">
                    {q.options.map((o) => (
                      <li
                        key={o.id}
                        className={
                          o.isCorrect
                            ? "font-medium text-[var(--success)]"
                            : undefined
                        }
                      >
                        <span className="me-1 font-latin text-[11px] text-[var(--text-muted)]">
                          {String.fromCharCode(1633 + o.order)}.
                        </span>
                        <MathContent text={o.optionText} />
                        {o.isCorrect && (
                          <span className="ms-1 text-[11px]">✓ الإجابة</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <TogglePublishButton
                    id={q.id}
                    isPublished={q.isPublished}
                    action={toggleQuestionPublished}
                  />
                  <form action={toggleQuestionNeedsReview.bind(null, q.id)}>
                    <button
                      type="submit"
                      aria-label="تبديل علامة المراجعة"
                      className={`inline-flex h-8 items-center gap-1 rounded-[var(--radius-default)] border px-2 text-[11px] ${
                        q.needsReview
                          ? "border-[var(--warning)]/40 bg-[color-mix(in_oklab,var(--warning)_14%,transparent)] text-[var(--warning)]"
                          : "border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--warning)] hover:text-[var(--warning)]"
                      }`}
                    >
                      <AlertTriangle size={11} />
                      مراجعة
                    </button>
                  </form>
                  <QuestionDialog
                    unitId={unit.id}
                    question={{
                      id: q.id,
                      unitId: q.unitId,
                      questionText: q.questionText,
                      lessonCode: q.lessonCode,
                      difficulty: q.difficulty,
                      needsReview: q.needsReview,
                      isPublished: q.isPublished,
                      sourceQuestionNumber: q.sourceQuestionNumber,
                      options: q.options.map((o) => ({
                        id: o.id,
                        optionText: o.optionText,
                        isCorrect: o.isCorrect,
                        order: o.order,
                      })),
                    }}
                    trigger="edit"
                  />
                  <DeleteButton
                    id={q.id}
                    size="sm"
                    confirmMessage="هل تريد حذف هذا السؤال؟"
                    action={deleteQuestion}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
