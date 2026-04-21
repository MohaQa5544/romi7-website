import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { ArrowRight, PlayCircle } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { FileTabs } from "@/components/files/FileTabs";
import { UnitIcon } from "@/components/brand/UnitIcon";
import { UNIT_TAGLINE_AR, resolveUnitIconKey } from "@/lib/units";

export default async function UnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null; // middleware already redirects

  const [unit] = await db.select().from(schema.units).where(eq(schema.units.id, id));
  if (!unit || !unit.isPublished) notFound();

  const [semester] = await db
    .select()
    .from(schema.semesters)
    .where(eq(schema.semesters.id, unit.semesterId));

  const files = await db
    .select()
    .from(schema.files)
    .where(and(eq(schema.files.unitId, id), eq(schema.files.isPublished, true)))
    .orderBy(asc(schema.files.type), asc(schema.files.examNumber), asc(schema.files.titleAr));

  const fileIds = files.map((f) => f.id);
  const myBookmarks = fileIds.length
    ? await db
        .select({ fileId: schema.bookmarks.fileId })
        .from(schema.bookmarks)
        .where(
          and(
            eq(schema.bookmarks.userId, session.user.id),
            inArray(schema.bookmarks.fileId, fileIds),
          ),
        )
    : [];
  const bookmarkedIds = new Set(myBookmarks.map((b) => b.fileId));

  const iconKey = resolveUnitIconKey(unit);

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--text-secondary)]">
          لوحتي
        </Link>
        <ArrowRight size={12} className="-scale-x-100" />
        {semester && (
          <>
            <Link
              href={`/semester/${semester.id}`}
              className="hover:text-[var(--text-secondary)]"
            >
              {semester.nameAr}
            </Link>
            <ArrowRight size={12} className="-scale-x-100" />
          </>
        )}
        <span className="text-[var(--text-secondary)]">{unit.nameAr}</span>
      </nav>

      <header className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-6 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--romi-navy)] text-[var(--romi-gold)]">
          <UnitIcon iconKey={iconKey} size={36} />
        </div>
        <div className="flex-1 space-y-1.5">
          <p className="font-latin text-xs uppercase tracking-[0.3em] text-[var(--romi-gold-dark)]">
            Unit {unit.number} · {UNIT_TAGLINE_AR[iconKey]}
          </p>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            {unit.nameAr}
          </h1>
          {unit.description && (
            <p className="text-sm text-[var(--text-secondary)]">{unit.description}</p>
          )}
        </div>
        <Link
          href={`/quiz/${unit.id}`}
          className="btn-gold inline-flex items-center gap-2 self-start text-sm sm:self-center"
        >
          <PlayCircle size={16} />
          اختبار تفاعلي
        </Link>
      </header>

      <section>
        <FileTabs files={files} bookmarkedIds={bookmarkedIds} />
      </section>
    </div>
  );
}
