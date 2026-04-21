"use client";

import { useState } from "react";
import { Download, Eye, FileText } from "lucide-react";
import type { FileRow } from "@/lib/db/schema";
import { getFileTypeMeta, formatSize, getFileUrl } from "@/lib/files";
import { BookmarkButton } from "./BookmarkButton";
import { PdfPreview } from "./PdfPreview";

type Props = {
  file: FileRow;
  bookmarked: boolean;
  showBookmark?: boolean;
};

export function FileCard({ file, bookmarked, showBookmark = true }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const meta = getFileTypeMeta(file.type);
  const url = getFileUrl(file);

  return (
    <>
      <div className="card flex items-start gap-4 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-default)] bg-[var(--surface-1)] text-[var(--romi-navy)]">
          <FileText size={20} />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start gap-2">
            <h3 className="flex-1 truncate font-display text-sm font-semibold text-[var(--text-primary)]">
              {file.titleAr}
              {file.examNumber ? ` — ${file.examNumber}` : ""}
            </h3>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.toneClass}`}
            >
              {meta.labelAr}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)]">
            {file.sizeBytes ? <span>{formatSize(file.sizeBytes)}</span> : null}
            <span>{file.downloadCount.toLocaleString("ar-EG")} تحميل</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-default)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--romi-gold)] hover:text-[var(--text-primary)]"
            >
              <Eye size={14} />
              معاينة
            </button>
            <a
              href={`/api/download/${file.id}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-default)] bg-[var(--romi-navy)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--romi-navy-light)]"
            >
              <Download size={14} />
              تحميل
            </a>
            {showBookmark && (
              <BookmarkButton fileId={file.id} initial={bookmarked} size="sm" />
            )}
          </div>
        </div>
      </div>

      <PdfPreview
        src={url}
        title={file.titleAr}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
