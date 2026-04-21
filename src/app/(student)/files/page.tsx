import { and, asc, eq, like, inArray, type SQL } from "drizzle-orm";
import { FileText } from "lucide-react";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { FILE_TYPE_META } from "@/lib/files";
import { FileCard } from "@/components/files/FileCard";
import { FileSearchFilters } from "@/components/files/FileSearchFilters";

export const metadata = { title: "البحث عن ملزمة" };

type SP = Promise<{
  semester?: string;
  unit?: string;
  type?: string;
  q?: string;
}>;

export default async function FilesSearchPage({ searchParams }: { searchParams: SP }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/files");
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const semester = (sp.semester ?? "").trim();
  const unit = (sp.unit ?? "").trim();
  const type = (sp.type ?? "").trim();

  const [semesters, allUnits] = await Promise.all([
    db
      .select()
      .from(schema.semesters)
      .where(eq(schema.semesters.isPublished, true))
      .orderBy(asc(schema.semesters.order)),
    db
      .select()
      .from(schema.units)
      .where(eq(schema.units.isPublished, true))
      .orderBy(asc(schema.units.order)),
  ]);

  const unitsForSemester = semester
    ? allUnits.filter((u) => u.semesterId === semester)
    : allUnits;

  // Build conditions
  const conds: SQL[] = [eq(schema.files.isPublished, true)];
  if (q) conds.push(like(schema.files.titleAr, `%${q}%`));
  if (unit) {
    conds.push(eq(schema.files.unitId, unit));
  } else if (semester) {
    const ids = allUnits.filter((u) => u.semesterId === semester).map((u) => u.id);
    if (ids.length) conds.push(inArray(schema.files.unitId, ids));
  }
  if (type)
    conds.push(
      eq(
        schema.files.type,
        type as
          | "question_bank"
          | "answer_key"
          | "exam"
          | "exam_solution"
          | "summary"
          | "update"
          | "other",
      ),
    );

  const filtersActive = !!(q || semester || unit || type);

  const files = filtersActive
    ? await db
        .select()
        .from(schema.files)
        .where(and(...conds))
        .orderBy(asc(schema.files.titleAr))
        .limit(100)
    : [];

  // bookmarks
  const bookmarkedIds = files.length
    ? new Set(
        (
          await db
            .select({ fileId: schema.bookmarks.fileId })
            .from(schema.bookmarks)
            .where(
              and(
                eq(schema.bookmarks.userId, session.user.id),
                inArray(
                  schema.bookmarks.fileId,
                  files.map((f) => f.id),
                ),
              ),
            )
        ).map((r) => r.fileId),
      )
    : new Set<string>();

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
          ابحث عن ملزمة
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          اختر الفصل والوحدة ونوع المحتوى للعثور على ما تحتاج.
        </p>
      </header>

      <FileSearchFilters
        semesters={semesters.map((s) => ({ id: s.id, label: s.nameAr }))}
        units={unitsForSemester.map((u) => ({
          id: u.id,
          label: `الوحدة ${u.number} — ${u.nameAr}`,
        }))}
        types={Object.entries(FILE_TYPE_META).map(([v, m]) => ({
          id: v,
          label: m.labelAr,
        }))}
        defaults={{ q, semester, unit, type }}
      />

      {!filtersActive ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center text-sm text-[var(--text-muted)]">
          اختر فلتراً أو اكتب كلمة بحث لعرض النتائج.
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center">
          <FileText size={28} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            لا توجد ملفات مطابقة — جرّب فلتراً آخر.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--text-muted)]">{files.length} نتيجة</p>
          <ul className="romi-tab-in grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((f) => (
              <li key={f.id}>
                <FileCard file={f} bookmarked={bookmarkedIds.has(f.id)} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
