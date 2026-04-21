import { and, eq, desc, sql } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, PlayCircle, Clock, CheckCircle2 } from "lucide-react";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { StartQuizForm } from "@/components/quiz/StartQuizForm";

export const metadata = { title: "اختبار" };

export default async function QuizIntroPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { unitId } = await params;

  const [unit] = await db.select().from(schema.units).where(eq(schema.units.id, unitId));
  if (!unit) notFound();

  const [{ count: availableCount }] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(schema.questions)
    .where(
      and(
        eq(schema.questions.unitId, unitId),
        eq(schema.questions.isPublished, true),
        eq(schema.questions.needsReview, false),
      ),
    );

  const recentAttempts = await db
    .select()
    .from(schema.quizAttempts)
    .where(
      and(
        eq(schema.quizAttempts.userId, session.user.id),
        eq(schema.quizAttempts.unitId, unitId),
      ),
    )
    .orderBy(desc(schema.quizAttempts.startedAt))
    .limit(5);

  const ready = Number(availableCount) >= 3;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6">
      <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--text-primary)]">
          لوحتي
        </Link>
        <ChevronRight size={12} className="rotate-180" />
        <Link href={`/unit/${unit.id}`} className="hover:text-[var(--text-primary)]">
          الوحدة {unit.number}
        </Link>
        <ChevronRight size={12} className="rotate-180" />
        <span className="text-[var(--text-secondary)]">اختبار</span>
      </nav>

      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          اختبار: {unit.nameAr}
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          اختر عدد الأسئلة ثم ابدأ الاختبار. كل سؤال له إجابة صحيحة واحدة — اضغط على الخيار لاختياره،
          ثم يمكنك التنقّل بين الأسئلة قبل التسليم.
        </p>
      </header>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-5">
        {ready ? (
          <StartQuizForm unitId={unit.id} available={Number(availableCount)} />
        ) : (
          <div className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
            <Clock size={18} className="mt-0.5 text-[var(--text-muted)]" />
            <div>
              لا تتوفّر أسئلة كافية لهذه الوحدة بعد. سيضيف الأستاذ أسئلة قريباً إن شاء الله.
            </div>
          </div>
        )}
      </div>

      {recentAttempts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            محاولاتك الأخيرة
          </h2>
          <ul className="divide-y divide-[var(--border-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)]">
            {recentAttempts.map((a) => (
              <li key={a.id}>
                {a.completedAt ? (
                  <Link
                    href={`/quiz/${unit.id}/results/${a.id}`}
                    className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-1)]"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[var(--success)]" />
                      <span>
                        {a.correctCount} / {a.questionCount}
                      </span>
                      <span className="text-[var(--text-muted)]">
                        — {a.scorePercent?.toFixed(1)}٪
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {new Intl.DateTimeFormat("ar-EG", {
                        dateStyle: "medium",
                      }).format(a.startedAt)}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href={`/quiz/${unit.id}/attempt/${a.id}`}
                    className="flex items-center justify-between px-4 py-3 text-sm text-[var(--warning)] hover:bg-[var(--surface-1)]"
                  >
                    <div className="flex items-center gap-2">
                      <PlayCircle size={14} />
                      استئناف محاولة غير مكتملة
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {new Intl.DateTimeFormat("ar-EG", {
                        dateStyle: "medium",
                      }).format(a.startedAt)}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
