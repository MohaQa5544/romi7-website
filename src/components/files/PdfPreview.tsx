"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Props = {
  src: string;
  title: string;
  open: boolean;
  onClose: () => void;
};

export function PdfPreview({ src, title, open, onClose }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (isMobile) {
      // On mobile, open in new tab
      window.open(src, "_blank", "noopener");
      onClose();
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, isMobile, src, onClose]);

  if (!open || isMobile) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-[color-mix(in_oklab,#000_70%,transparent)] backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3 text-white">
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
        className="flex min-h-0 flex-1 px-2 pb-4 sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={src}
          title={title}
          className="h-full min-h-0 w-full rounded-[var(--radius-default)] border border-white/10 bg-white"
        />
      </div>
    </div>
  );
}
