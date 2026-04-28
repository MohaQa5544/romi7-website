"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { SEVERITY_META, type Severity } from "@/lib/announcements";

type Props = {
  id: string;
  title: string;
  body: string | null;
  imageUrl?: string | null;
  severity: Severity;
};

export function AnnouncementBanner({ id, title, body, imageUrl, severity }: Props) {
  const [dismissed, setDismissed] = useState(true); // start dismissed to avoid SSR flicker
  const meta = SEVERITY_META[severity];

  useEffect(() => {
    try {
      const key = "romi7:dismissed_announcements";
      const raw = window.localStorage.getItem(key);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setDismissed(list.includes(id));
    } catch {
      setDismissed(false);
    }
  }, [id]);

  function onDismiss() {
    try {
      const key = "romi7:dismissed_announcements";
      const raw = window.localStorage.getItem(key);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(id)) list.push(id);
      window.localStorage.setItem(key, JSON.stringify(list));
    } catch {}
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 ${meta.container}`}
    >
      <Megaphone size={20} className={`mt-0.5 shrink-0 ${meta.iconColor}`} />
      <div className="flex-1 space-y-1.5">
        <h2 className="font-display text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        {body && (
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{body}</p>
        )}
        {imageUrl && (
          <a
            href={`/api/announcement-image/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 mx-auto block overflow-hidden rounded-[var(--radius-default)]"
            style={{ width: "fit-content", maxWidth: "240px" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/announcement-image/${id}`}
              alt={title}
              className="block h-auto w-full object-contain"
              style={{ maxHeight: "300px" }}
              loading="lazy"
            />
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="إخفاء الإعلان"
        className="shrink-0 rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
      >
        <X size={16} />
      </button>
    </div>
  );
}
