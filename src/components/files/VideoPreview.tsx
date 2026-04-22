"use client";

import { useEffect } from "react";
import { ArrowRight, ExternalLink, Youtube } from "lucide-react";

type Props = {
  videoId: string;
  title: string;
  open: boolean;
  onClose: () => void;
};

/**
 * Full-screen video viewer.
 *
 * Behaves like a dedicated "tab" rather than a modal:
 *  - Solid dark backdrop (not click-to-close — too easy to lose place)
 *  - Sticky top bar with a clear back button + bold title
 *  - Centered 16:9 player, capped to a comfortable reading width
 *  - Footer with "Open on YouTube" escape hatch
 */
export function VideoPreview({ videoId, title, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col bg-[#0B0F1A]"
    >
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0B0F1A]/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-default)] border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90 transition-colors hover:border-[var(--romi-gold)] hover:bg-white/10 hover:text-white sm:text-sm"
        >
          <ArrowRight size={14} />
          رجوع
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Youtube size={18} className="shrink-0 text-[#EF4444]" />
          <h1 className="truncate font-display text-sm font-bold text-white sm:text-base">
            {title}
          </h1>
        </div>

        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener"
          className="hidden items-center gap-1.5 rounded-[var(--radius-default)] border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-[var(--romi-gold)] hover:bg-white/10 hover:text-white sm:inline-flex"
        >
          <ExternalLink size={13} />
          فتح على يوتيوب
        </a>
      </header>

      {/* Player */}
      <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-5xl">
          <div className="aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-black shadow-2xl">
            <iframe
              src={src}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>

          {/* Title block under player — gives the page a solid feel */}
          <div className="mt-4 space-y-1 text-white sm:mt-5">
            <h2 className="font-display text-lg font-bold leading-snug sm:text-xl">
              {title}
            </h2>
            <p className="text-xs text-white/60 sm:text-sm">
              فيديو شرح من قناة الأستاذ إبراهيم رميح
            </p>
          </div>

          {/* Mobile-only YouTube link (header has it on sm+) */}
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-default)] border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-[var(--romi-gold)] hover:bg-white/10 hover:text-white sm:hidden"
          >
            <ExternalLink size={13} />
            فتح على يوتيوب
          </a>
        </div>
      </div>
    </div>
  );
}
