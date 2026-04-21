import { asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { UnitDialog } from "@/components/admin/UnitDialog";
import { TogglePublishButton } from "@/components/admin/TogglePublishButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { toggleUnitPublished, deleteUnit } from "@/lib/admin/units-actions";

export const metadata = { title: "الوحدات — الإدارة" };

export default async function AdminUnitsPage() {
  await requireAdmin();

  const [semesters, units] = await Promise.all([
    db.select().from(schema.semesters).orderBy(asc(schema.semesters.order)),
    db
      .select({
        id: schema.units.id,
        semesterId: schema.units.semesterId,
        number: schema.units.number,
        nameAr: schema.units.nameAr,
        nameEn: schema.units.nameEn,
        description: schema.units.description,
        order: schema.units.order,
        iconKey: schema.units.iconKey,
        isPublished: schema.units.isPublished,
        colorHint: schema.units.colorHint,
        createdAt: schema.units.createdAt,
        semesterName: schema.semesters.nameAr,
        fileCount: sql<number>`(select count(*) from ${schema.files} where ${schema.files.unitId} = ${schema.units.id})`.as(
          "fileCount",
        ),
        questionCount: sql<number>`(select count(*) from ${schema.questions} where ${schema.questions.unitId} = ${schema.units.id})`.as(
          "questionCount",
        ),
      })
      .from(schema.units)
      .leftJoin(schema.semesters, eq(schema.units.semesterId, schema.semesters.id))
      .orderBy(asc(schema.units.order)),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            الوحدات الدراسية
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {units.length} وحدة
          </p>
        </div>
        <UnitDialog semesters={semesters} />
      </header>

      {units.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center text-sm text-[var(--text-muted)]">
          لا توجد وحدات بعد.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-1)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-2.5 text-start font-medium">#</th>
                <th className="px-4 py-2.5 text-start font-medium">الاسم</th>
                <th className="px-4 py-2.5 text-start font-medium">الفصل</th>
                <th className="px-4 py-2.5 text-start font-medium">ملفات</th>
                <th className="px-4 py-2.5 text-start font-medium">أسئلة</th>
                <th className="px-4 py-2.5 text-start font-medium">الحالة</th>
                <th className="px-4 py-2.5 text-start font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--surface-1)]">
                  <td className="px-4 py-2.5 text-[var(--text-muted)]">{u.number}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-[var(--text-primary)]">{u.nameAr}</div>
                    <div className="font-latin text-[11px] text-[var(--text-muted)]">
                      {u.nameEn}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{u.semesterName}</td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                    {Number(u.fileCount)}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                    {Number(u.questionCount)}
                  </td>
                  <td className="px-4 py-2.5">
                    <TogglePublishButton
                      id={u.id}
                      isPublished={u.isPublished}
                      action={toggleUnitPublished}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <UnitDialog semesters={semesters} unit={u} trigger="edit" />
                      <DeleteButton
                        id={u.id}
                        size="sm"
                        confirmMessage={`هل تريد حذف الوحدة «${u.nameAr}»؟`}
                        action={deleteUnit}
                      />
                    </div>
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
