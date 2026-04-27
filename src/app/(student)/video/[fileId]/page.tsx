import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowRight, ExternalLink, Youtube } from "lucide-react";
import { db, schema } from "@/lib/db";
import { extractYoutubeId } from "@/lib/files";

type Params = { fileId: string };

export default async function VideoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { fileId } = await params;

  const [file] = await db
    .select()
    .from(schema.files)
    .where(eq(schema.files.id, fileId));

  if (!file || !file.isPublished || file.source !== "youtube") {
    notFound();
  }

  const videoId = extractYoutubeId(file.path);
  if (!videoId) notFound();

  const [unit] = file.unitId
    ? await db
        .select({ id: schema.units.id, number: schema.units.number, nameAr: schema.units.nameAr })
        .from(schema.units)
        .where(eq(schema.units.id, file.unitId))
    : [undefined];

  const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="romi-video-page mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
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
      <div className="romi-video-head mb-6 space-y-3 sm:mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,#EF4444_12%,transparent)] px-3 py-1 text-[11px] font-semibold text-[#DC2626] sm:text-xs">
          <Youtube size={13} />
          فيديو شرح
        </span>
        <h1 className="font-display text-2xl font-bold leading-tight text-[var(--text-primary)] sm:text-3xl md:text-4xl">
          {file.titleAr}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] sm:text-base">
          من قناة الأستاذ إبراهيم رميح — شاهد الشرح الكامل مباشرةً داخل الموقع.
        </p>
      </div>

      {/* Player — framed card with subtle gradient glow */}
      <div className="romi-video-frame relative">
        <div
          aria-hidden
          className="absolute -inset-1 rounded-[calc(var(--radius-lg)+4px)] bg-[linear-gradient(135deg,var(--romi-gold)/40,transparent_60%,var(--romi-navy)/30)] opacity-60 blur-md"
        />
        <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-black shadow-xl">
          <iframe
            src={src}
            title={file.titleAr}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 sm:mt-8">
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-default)] border border-[var(--border-default)] bg-[var(--surface-0)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[#EF4444] hover:text-[#DC2626] sm:text-sm"
        >
          <ExternalLink size={14} />
          فتح على يوتيوب
        </a>

        {unit && (
          <Link
            href={`/unit/${unit.id}`}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-default)] bg-[var(--romi-navy)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--romi-navy-light)] sm:text-sm"
          >
            إلى صفحة الوحدة
            <ArrowRight size={14} className="rotate-180" />
          </Link>
        )}
      </div>
    </div>
  );
}
