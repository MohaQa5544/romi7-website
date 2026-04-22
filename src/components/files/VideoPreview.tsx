"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  videoId: string;
  title: string;
  open: boolean;
  onClose: () => void;
};

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col bg-[color-mix(in_oklab,#000_75%,transparent)] backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-6">
        <h3 className="truncate font-display text-base font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="rounded-[var(--radius-default)] border border-white/20 p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
      <div
        className="flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-[var(--radius-lg)] bg-black shadow-2xl">
          <iframe
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
