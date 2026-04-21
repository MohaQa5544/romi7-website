import { asc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft, BookOpen } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = { title: "الاختبارات — الإدارة" };

export default async function AdminQuizzesIndexPage() {
  await requireAdmin();

  const units = await db
    .select({
      id: schema.units.id,
      number: schema.units.number,
      nameAr: schema.units.nameAr,
      nameEn: schema.units.nameEn,
      questionCount: sql<number>`(select count(*) from ${schema.questions} where ${schema.questions.unitId} = ${schema.units.id})`.as(
        "questionCount",
      ),
      needsReviewCount: sql<number>`(select count(*) from ${schema.questions} where ${schema.questions.unitId} = ${schema.units.id} and ${schema.questions.needsReview} = 1)`.as(
        "needsReviewCount",
      ),
    })
    .from(schema.units)
    .leftJoin(schema.semesters, eq(schema.units.semesterId, schema.semesters.id))
    .orderBy(asc(schema.units.order));

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          الاختبارات
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          اختر وحدة لإدارة أسئلتها.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((u) => (
          <li key={u.id}>
            <Link
              href={`/admin/quizzes/${u.id}`}
              className="block rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-4 transition-colors hover:border-[var(--romi-gold)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--romi-gold-dark)]">
                    <BookOpen size={14} />
                  </div>
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">
                      الوحدة {u.number} — {u.nameAr}
                    </div>
                    <div className="font-latin text-[11px] text-[var(--text-muted)]">
                      {u.nameEn}
                    </div>
                  </div>
                </div>
                <ChevronLeft size={16} className="text-[var(--text-muted)]" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[var(--text-secondary)]">
                  {Number(u.questionCount)} سؤال
                </span>
                {Number(u.needsReviewCount) > 0 && (
                  <span className="rounded-full bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] px-2 py-0.5 text-[var(--warning)]">
                    {Number(u.needsReviewCount)} بحاجة مراجعة
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
