"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type Size = "md" | "lg" | "xl";

const SIZE_CLASS: Record<Size, string> = {
  md: "sm:max-w-lg", // ~512px
  lg: "sm:max-w-xl", // ~576px
  xl: "sm:max-w-3xl", // ~768px
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: Size;
  /** When true, close (overlay click / X / Esc) is blocked. */
  busy?: boolean;
  /** Form fields / body content. */
  children: ReactNode;
  /** Action buttons rendered in the sticky-feeling footer bar. */
  footer: ReactNode;
};

/**
 * Shared modal shell for all admin dialogs.
 *
 * Layout pattern:
 *  - Overlay is the scrolling element (overflow-y-auto)
 *  - Inner wrapper uses flex + min-h-full so the card centers when
 *    short and scrolls with the overlay when tall.
 *  - Card has a clear header / body / footer split with bordered
 *    sections — no more "cramped narrow box".
 *  - On mobile (< sm) the card snaps to the bottom edge as a
 *    bottom-sheet with rounded top corners only.
 */
export function DialogShell({
  open,
  onClose,
  title,
  size = "lg",
  busy = false,
  children,
  footer,
}: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  const tryClose = () => {
    if (!busy) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 overflow-y-auto bg-[color-mix(in_oklab,#000_55%,transparent)] backdrop-blur-sm"
      onClick={tryClose}
    >
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`flex w-full ${SIZE_CLASS[size]} flex-col rounded-t-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-2xl sm:rounded-[var(--radius-lg)]`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-4">
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            <button
              type="button"
              onClick={tryClose}
              aria-label="إغلاق"
              disabled={busy}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">{children}</div>

          {/* Footer */}
          <div className="flex flex-wrap justify-end gap-2 rounded-b-[var(--radius-lg)] border-t border-[var(--border-subtle)] bg-[var(--surface-1)] px-6 py-3.5">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
