import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowRight, Download, ExternalLink, FileText } from "lucide-react";
import { db, schema } from "@/lib/db";
import { getFileTypeMeta, formatSize, type FileType } from "@/lib/files";

type Params = { fileId: string };

export default async function PreviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { fileId } = await params;

  const [file] = await db
    .select()
    .from(schema.files)
    .where(eq(schema.files.id, fileId));

  if (!file || !file.isPublished || file.source === "youtube") {
    notFound();
  }

  const [unit] = file.unitId
    ? await db
        .select({ id: schema.units.id, number: schema.units.number, nameAr: schema.units.nameAr })
        .from(schema.units)
        .where(eq(schema.units.id, file.unitId))
    : [undefined];

  const meta = getFileTypeMeta(file.type as FileType);
  const previewUrl = `/api/download/${file.id}?preview=1`;
  const downloadUrl = `/api/download/${file.id}`;

  return (
    <div className="romi-preview-page mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Breadcrumb / back */}
      <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] sm:text-sm">
        <Link
          href="/files"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-1.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--romi-gold)] hover:text-[var(--text-primary)]"
        >
          <ArrowRight size={14} />
          رجوع إلى الملازم
        </Link>
        {unit && (
          <>
            <span className="text-[var(--border-strong)]">•</span>
            <Link
              href={`/unit/${unit.id}`}
              className="font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--romi-navy)]"
            >
              الوحدة {unit.number}: {unit.nameAr}
            </Link>
          </>
        )}
      </div>

      {/* Header block */}
      <div className="romi-preview-head mb-6 space-y-3 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold sm:text-xs ${meta.toneClass}`}
          >
            <FileText size={13} />
            {meta.labelAr}
          </span>
          {file.sizeBytes ? (
            <span className="text-[11px] text-[var(--text-muted)] sm:text-xs">
              {formatSize(file.sizeBytes)}
            </span>
          ) : null}
          <span className="text-[11px] text-[var(--text-muted)] sm:text-xs">
            {file.downloadCount.toLocaleString("ar-EG")} تحميل
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold leading-tight text-[var(--text-primary)] sm:text-3xl md:text-4xl">
          {file.titleAr}
          {file.examNumber ? ` — ${file.examNumber}` : ""}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] sm:text-base">
          معاينة مباشرة من داخل الموقع — يمكنك التحميل أو التصفّح بدون مغادرة الصفحة.
        </p>
      </div>

      {/* PDF frame — framed card with subtle gradient glow */}
      <div className="romi-preview-frame relative">
        <div
          aria-hidden
          className="absolute -inset-1 rounded-[calc(var(--radius-lg)+4px)] bg-[linear-gradient(135deg,var(--romi-gold)/40,transparent_60%,var(--romi-navy)/30)] opacity-60 blur-md"
        />
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white shadow-xl">
          <iframe
            src={previewUrl}
            title={file.titleAr}
            className="h-full w-full"
          />
        </div>

        {/* Mobile fallback — some mobile browsers don't render PDFs in iframes */}
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener"
          className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-default)] border border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--romi-gold)] hover:text-[var(--text-primary)] md:hidden"
        >
          <ExternalLink size={13} />
          فتح في تبويب جديد
        </a>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 sm:mt-8">
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-default)] bg-[var(--romi-navy)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--romi-navy-light)] sm:text-sm"
        >
          <Download size={14} />
          تحميل الملف
        </a>

        {unit && (
          <Link
            href={`/unit/${unit.id}`}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-default)] border border-[var(--border-default)] bg-[var(--surface-0)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--romi-gold)] hover:text-[var(--text-primary)] sm:text-sm"
          >
            إلى صفحة الوحدة
            <ArrowRight size={14} className="rotate-180" />
          </Link>
        )}
      </div>
    </div>
  );
}
