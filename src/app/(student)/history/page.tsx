import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { History, CheckCircle2, TrendingUp, PlayCircle, XCircle } from "lucide-react";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth/config";

export const metadata = { title: "سجلّ الاختبارات" };

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/history");

  const rows = await db
    .select({
      id: schema.quizAttempts.id,
      unitId: schema.quizAttempts.unitId,
      questionCount: schema.quizAttempts.questionCount,
      correctCount: schema.quizAttempts.correctCount,
      scorePercent: schema.quizAttempts.scorePercent,
      timeSpentSeconds: schema.quizAttempts.timeSpentSeconds,
      startedAt: schema.quizAttempts.startedAt,
      completedAt: schema.quizAttempts.completedAt,
      unitNameAr: schema.units.nameAr,
      unitNumber: schema.units.number,
    })
    .from(schema.quizAttempts)
    .leftJoin(schema.units, eq(schema.quizAttempts.unitId, schema.units.id))
    .where(eq(schema.quizAttempts.userId, session.user.id))
    .orderBy(desc(schema.quizAttempts.startedAt));

  const completed = rows.filter((r) => r.completedAt);
  const avgScore = completed.length
    ? completed.reduce((a, r) => a + (r.scorePercent ?? 0), 0) / completed.length
    : 0;
  const bestScore = completed.reduce((a, r) => Math.max(a, r.scorePercent ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          سجلّ الاختبارات
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          جميع محاولاتك التفاعلية — {rows.length} محاولة.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-muted)]">
            <History size={22} />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            لم تبدأ أي اختبار بعد. افتح وحدة واختر «اختبار» للبدء.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="محاولات" value={String(rows.length)} icon={<History size={16} />} />
            <StatCard
              label="مكتملة"
              value={String(completed.length)}
              icon={<CheckCircle2 size={16} />}
            />
            <StatCard
              label="المعدّل"
              value={`${avgScore.toFixed(1)}٪`}
              icon={<TrendingUp size={16} />}
            />
            <StatCard
              label="الأفضل"
              value={`${bestScore.toFixed(1)}٪`}
              icon={<TrendingUp size={16} />}
            />
          </div>

          <ul className="divide-y divide-[var(--border-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)]">
            {rows.map((r) => {
              const done = !!r.completedAt;
              const score = r.scorePercent ?? 0;
              const passed = done && score >= 60;
              const mm = r.timeSpentSeconds
                ? `${Math.floor(r.timeSpentSeconds / 60)}:${String(
                    r.timeSpentSeconds % 60,
                  ).padStart(2, "0")}`
                : null;
              const href = done
                ? `/quiz/${r.unitId}/results/${r.id}`
                : `/quiz/${r.unitId}/attempt/${r.id}`;
              return (
                <li key={r.id}>
                  <Link
                    href={href}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-1)]"
                  >
                    <div className="flex items-center gap-3">
                      {done ? (
                        passed ? (
                          <CheckCircle2 size={16} className="text-[var(--success)]" />
                        ) : (
                          <XCircle size={16} className="text-[var(--warning)]" />
                        )
                      ) : (
                        <PlayCircle size={16} className="text-[var(--romi-navy)]" />
                      )}
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">
                          الوحدة {r.unitNumber} — {r.unitNameAr}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {new Intl.DateTimeFormat("ar-EG", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(r.startedAt)}
                          {mm && <span className="ms-2">· {mm}</span>}
                        </div>
                      </div>
                    </div>
                    {done ? (
                      <div className="text-end">
                        <div className="font-display text-base font-semibold text-[var(--text-primary)]">
                          {score.toFixed(1)}٪
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {r.correctCount} / {r.questionCount}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[var(--warning)]">استئناف</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-display text-xl font-semibold text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

