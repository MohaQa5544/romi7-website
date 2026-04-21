import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { db, schema } from "@/lib/db";
import { UnitCard } from "@/components/units/UnitCard";

export default async function SemesterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [semester] = await db
    .select()
    .from(schema.semesters)
    .where(eq(schema.semesters.id, id));
  if (!semester || !semester.isPublished) notFound();

  const units = await db
    .select()
    .from(schema.units)
    .where(and(eq(schema.units.semesterId, id), eq(schema.units.isPublished, true)))
    .orderBy(asc(schema.units.order));

  const unitIds = units.map((u) => u.id);
  const counts = unitIds.length
    ? await db
        .select({
          unitId: schema.files.unitId,
          count: sql<number>`count(*)`.as("count"),
        })
        .from(schema.files)
        .where(
          and(
            inArray(schema.files.unitId, unitIds),
            eq(schema.files.isPublished, true),
          ),
        )
        .groupBy(schema.files.unitId)
    : [];
  const countMap = new Map(counts.map((c) => [c.unitId, Number(c.count)]));

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--text-secondary)]">
          لوحتي
        </Link>
        <ArrowRight size={12} className="-scale-x-100" />
        <span className="text-[var(--text-secondary)]">{semester.nameAr}</span>
      </nav>

      <header className="space-y-1.5">
        <p className="font-latin text-xs uppercase tracking-[0.3em] text-[var(--romi-gold-dark)]">
          {semester.nameEn}
        </p>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          {semester.nameAr}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          تصفّح وحدات هذا الفصل وابدأ مذاكرتك من أيّ وحدة.
        </p>
      </header>

      {units.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-8 text-center text-sm text-[var(--text-muted)]">
          لا توجد وحدات منشورة بعد.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((u) => (
            <UnitCard key={u.id} unit={u} fileCount={countMap.get(u.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
