import { and, asc, desc, eq, isNull, like, type SQL } from "drizzle-orm";
import { FileText, Search } from "lucide-react";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import {
  FILE_TYPE_META,
  MOCK_UNIT_KEY,
  MOCK_UNIT_LABEL,
  formatSize,
  getFileTypeMeta,
} from "@/lib/files";
import { FileUploadDialog } from "@/components/admin/FileUploadDialog";
import { TogglePublishButton } from "@/components/admin/TogglePublishButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { toggleFilePublished, deleteFile } from "@/lib/admin/files-actions";

export const metadata = { title: "الملفات — الإدارة" };

type SearchParams = Promise<{ q?: string; unit?: string; type?: string }>;

export default async function AdminFilesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const unit = (sp.unit ?? "").trim();
  const type = (sp.type ?? "").trim();

  const conditions: SQL[] = [];
  if (q) conditions.push(like(schema.files.titleAr, `%${q}%`));
  if (unit === MOCK_UNIT_KEY) {
    conditions.push(isNull(schema.files.unitId));
  } else if (unit) {
    conditions.push(eq(schema.files.unitId, unit));
  }
  if (type)
    conditions.push(
      eq(
        schema.files.type,
        type as
          | "question_bank"
          | "answer_key"
          | "exam"
          | "exam_solution"
          | "review"
          | "video",
      ),
    );

  const [units, semesters, rows] = await Promise.all([
    db.select().from(schema.units).orderBy(asc(schema.units.order)),
    db.select().from(schema.semesters).orderBy(asc(schema.semesters.order)),
    db
      .select({
        id: schema.files.id,
        titleAr: schema.files.titleAr,
        type: schema.files.type,
        examNumber: schema.files.examNumber,
        source: schema.files.source,
        path: schema.files.path,
        sizeBytes: schema.files.sizeBytes,
        downloadCount: schema.files.downloadCount,
        isPublished: schema.files.isPublished,
        createdAt: schema.files.createdAt,
        unitId: schema.files.unitId,
        unitNameAr: schema.units.nameAr,
        unitNumber: schema.units.number,
      })
      .from(schema.files)
      .leftJoin(schema.units, eq(schema.files.unitId, schema.units.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(schema.files.createdAt)),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            الملفات
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">{rows.length} ملف</p>
        </div>
        <FileUploadDialog units={units} semesters={semesters} />
      </header>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-3"
      >
        <label className="flex-1 min-w-[200px] space-y-1">
          <span className="block text-[11px] font-medium text-[var(--text-secondary)]">
            بحث بالعنوان
          </span>
          <div className="relative">
            <Search
              size={14}
              className="absolute top-1/2 -translate-y-1/2 end-3 text-[var(--text-muted)]"
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="اكتب للبحث…"
              className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 pe-9 text-sm outline-none focus:border-[var(--romi-gold)]"
            />
          </div>
        </label>
        <label className="space-y-1">
          <span className="block text-[11px] font-medium text-[var(--text-secondary)]">
            الوحدة
          </span>
          <select
            name="unit"
            defaultValue={unit}
            className="block rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 text-sm outline-none focus:border-[var(--romi-gold)]"
          >
            <option value="">الكل</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.number}. {u.nameAr}
              </option>
            ))}
            <option value={MOCK_UNIT_KEY}>{MOCK_UNIT_LABEL}</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-[11px] font-medium text-[var(--text-secondary)]">
            النوع
          </span>
          <select
            name="type"
            defaultValue={type}
            className="block rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 text-sm outline-none focus:border-[var(--romi-gold)]"
          >
            <option value="">الكل</option>
            {Object.entries(FILE_TYPE_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.labelAr}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-gold text-sm">
            تصفية
          </button>
          {(q || unit || type) && (
            <Link href="/admin/files" className="btn-outline text-sm">
              مسح
            </Link>
          )}
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center">
          <FileText size={28} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">لا توجد ملفات مطابقة.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-1)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-2.5 text-start font-medium">العنوان</th>
                <th className="px-4 py-2.5 text-start font-medium">الوحدة</th>
                <th className="px-4 py-2.5 text-start font-medium">النوع</th>
                <th className="px-4 py-2.5 text-start font-medium">الحجم</th>
                <th className="px-4 py-2.5 text-start font-medium">التنزيلات</th>
                <th className="px-4 py-2.5 text-start font-medium">المصدر</th>
                <th className="px-4 py-2.5 text-start font-medium">الحالة</th>
                <th className="px-4 py-2.5 text-start font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {rows.map((f) => {
                const meta = getFileTypeMeta(f.type);
                return (
                  <tr key={f.id} className="hover:bg-[var(--surface-1)]">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-[var(--text-primary)]">
                        {f.titleAr}
                      </div>
                      {f.examNumber !== null && f.examNumber !== undefined && (
                        <div className="text-[11px] text-[var(--text-muted)]">
                          اختبار #{f.examNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                      {f.unitId
                        ? `${f.unitNumber}. ${f.unitNameAr}`
                        : MOCK_UNIT_LABEL}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.toneClass}`}
                      >
                        {meta.labelAr}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text-muted)]">
                      {formatSize(f.sizeBytes)}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                      {f.downloadCount}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-[var(--text-muted)]">
                      {f.source === "blob" ? "Vercel Blob" : "مستودع"}
                    </td>
                    <td className="px-4 py-2.5">
                      <TogglePublishButton
                        id={f.id}
                        isPublished={f.isPublished}
                        action={toggleFilePublished}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <DeleteButton
                          id={f.id}
                          size="sm"
                          confirmMessage={`هل تريد حذف «${f.titleAr}»؟`}
                          action={deleteFile}
                        />
                      </div>
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
