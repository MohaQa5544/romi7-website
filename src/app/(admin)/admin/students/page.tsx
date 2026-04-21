import { and, count, desc, eq, isNotNull, like, or, sql } from "drizzle-orm";
import { Search } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { formatDateAr } from "@/lib/announcements";

export const metadata = { title: "الطلّاب — الإدارة" };

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function StudentsPage({ searchParams }: Props) {
  await requireAdmin();
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  const baseWhere = eq(schema.users.role, "student");
  const where = term
    ? and(
        baseWhere,
        or(like(schema.users.name, `%${term}%`), like(schema.users.email, `%${term}%`)),
      )
    : baseWhere;

  const students = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      createdAt: schema.users.createdAt,
      lastActiveAt: schema.users.lastActiveAt,
      attempts: sql<number>`(
        select count(*) from ${schema.quizAttempts}
        where ${schema.quizAttempts.userId} = ${schema.users.id}
        and ${schema.quizAttempts.completedAt} is not null
      )`.as("attempts"),
      avgScore: sql<number | null>`(
        select avg(${schema.quizAttempts.scorePercent}) from ${schema.quizAttempts}
        where ${schema.quizAttempts.userId} = ${schema.users.id}
        and ${schema.quizAttempts.completedAt} is not null
      )`.as("avgScore"),
    })
    .from(schema.users)
    .where(where)
    .orderBy(desc(schema.users.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            الطلّاب
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {students.length.toLocaleString("ar-EG")} طالب مسجّل
          </p>
        </div>

        <form method="GET" className="relative w-full max-w-sm">
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-[var(--text-muted)]">
            <Search size={15} />
          </span>
          <input
            type="search"
            name="q"
            defaultValue={term}
            placeholder="ابحث بالاسم أو البريد"
            className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] ps-9 pe-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30"
          />
        </form>
      </header>

      {students.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-8 text-center text-sm text-[var(--text-muted)]">
          {term ? "لا نتائج مطابقة للبحث." : "لا يوجد طلّاب مسجّلون بعد."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-1)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-2.5 text-start font-medium">الاسم</th>
                <th className="px-4 py-2.5 text-start font-medium">البريد</th>
                <th className="px-4 py-2.5 text-start font-medium">التسجيل</th>
                <th className="px-4 py-2.5 text-start font-medium">آخر نشاط</th>
                <th className="px-4 py-2.5 text-start font-medium">اختبارات</th>
                <th className="px-4 py-2.5 text-start font-medium">المتوسّط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--surface-1)]">
                  <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">
                    {s.name}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]" dir="ltr">
                    {s.email}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-muted)]">
                    {formatDateAr(s.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-muted)]">
                    {s.lastActiveAt ? formatDateAr(s.lastActiveAt) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                    {Number(s.attempts).toLocaleString("ar-EG")}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                    {s.avgScore !== null && s.avgScore !== undefined
                      ? `${Math.round(Number(s.avgScore))}٪`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
