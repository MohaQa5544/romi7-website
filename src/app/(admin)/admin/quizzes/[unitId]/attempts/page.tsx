import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Users } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { QuizAdminTabs } from "@/components/admin/QuizAdminTabs";

export const metadata = { title: "محاولات الاختبار — الإدارة" };

function formatDate(d: Date | null | undefined) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("ar-QA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(d));
  } catch {
    return new Date(d).toISOString().slice(0, 16).replace("T", " ");
  }
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}ث`;
  return `${m}د ${s}ث`;
}

function scoreColor(pct: number | null | undefined) {
  if (pct == null) return "text-[var(--text-muted)]";
  if (pct >= 80) return "text-[var(--success)]";
  if (pct >= 50) return "text-[var(--warning)]";
  return "text-[var(--danger)]";
}

export default async function QuizAttemptsPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  await requireAdmin();
  const { unitId } = await params;

  const [unit] = await db.select().from(schema.units).where(eq(schema.units.id, unitId));
  if (!unit) notFound();

  const rows = await db
    .select({
      attemptId: schema.quizAttempts.id,
      userId: schema.users.id,
      userName: schema.users.name,
      userEmail: schema.users.email,
      questionCount: schema.quizAttempts.questionCount,
      correctCount: schema.quizAttempts.correctCount,
      scorePercent: schema.quizAttempts.scorePercent,
      timeSpentSeconds: schema.quizAttempts.timeSpentSeconds,
      startedAt: schema.quizAttempts.startedAt,
      completedAt: schema.quizAttempts.completedAt,
    })
    .from(schema.quizAttempts)
    .innerJoin(schema.users, eq(schema.users.id, schema.quizAttempts.userId))
    .where(eq(schema.quizAttempts.unitId, unitId))
    .orderBy(desc(schema.quizAttempts.startedAt))
    .limit(500);

  const completed = rows.filter((r) => r.completedAt);
  const avg =
    completed.length > 0
      ? Math.round(
          completed.reduce((a, r) => a + (r.scorePercent ?? 0), 0) / completed.length,
        )
      : null;
  const uniqueStudents = new Set(rows.map((r) => r.userId)).size;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Link href="/admin/quizzes" className="hover:text-[var(--text-primary)]">
          الاختبارات
        </Link>
        <ChevronRight size={12} className="rotate-180" />
        <Link
          href={`/admin/quizzes/${unit.id}`}
          className="hover:text-[var(--text-primary)]"
        >
          الوحدة {unit.number}
        </Link>
        <ChevronRight size={12} className="rotate-180" />
        <span className="text-[var(--text-secondary)]">المحاولات</span>
      </nav>

      <header className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          محاولات الطلّاب — {unit.nameAr}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {rows.length} محاولة · {uniqueStudents} طالب{avg != null && ` · متوسط الدرجات ${avg}%`}
        </p>
      </header>

      <QuizAdminTabs unitId={unit.id} active="attempts" />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center">
          <Users size={28} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            لم يخض أي طالب هذا الاختبار بعد.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)]">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="bg-[var(--surface-1)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">الطالب</th>
                <th className="px-4 py-3 font-medium">النتيجة</th>
                <th className="px-4 py-3 font-medium">الإجابات</th>
                <th className="px-4 py-3 font-medium">الوقت</th>
                <th className="px-4 py-3 font-medium">التاريخ</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {rows.map((r) => {
                const isDone = !!r.completedAt;
                return (
                  <tr key={r.attemptId} className="transition-colors hover:bg-[var(--surface-1)]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-primary)]">{r.userName}</div>
                      <div className="font-latin text-[11px] text-[var(--text-muted)]">{r.userEmail}</div>
                    </td>
                    <td className={`px-4 py-3 font-latin text-base font-semibold ${scoreColor(r.scorePercent)}`}>
                      {r.scorePercent != null ? `${Math.round(r.scorePercent)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 font-latin text-[var(--text-secondary)]">
                      {r.correctCount}/{r.questionCount}
                    </td>
                    <td className="px-4 py-3 font-latin text-[var(--text-secondary)]">
                      {formatDuration(r.timeSpentSeconds)}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[var(--text-muted)]">
                      {formatDate(r.completedAt ?? r.startedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {isDone ? (
                        <span className="rounded-full bg-[color-mix(in_oklab,var(--success)_14%,transparent)] px-2 py-0.5 text-[11px] text-[var(--success)]">
                          مكتملة
                        </span>
                      ) : (
                        <span className="rounded-full bg-[color-mix(in_oklab,var(--warning)_14%,transparent)] px-2 py-0.5 text-[11px] text-[var(--warning)]">
                          قيد التنفيذ
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
