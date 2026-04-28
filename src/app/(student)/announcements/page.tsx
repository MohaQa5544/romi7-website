import { desc, eq } from "drizzle-orm";
import { Megaphone, Pin } from "lucide-react";
import { db, schema } from "@/lib/db";
import { SEVERITY_META, formatDateAr } from "@/lib/announcements";

export const metadata = { title: "الإعلانات" };

export default async function AnnouncementsPage() {
  const rows = await db
    .select()
    .from(schema.announcements)
    .where(eq(schema.announcements.isPublished, true))
    .orderBy(desc(schema.announcements.isPinned), desc(schema.announcements.createdAt));

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          الإعلانات
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          كلّ المستجدّات من الأستاذ رميح في مكان واحد.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-muted)]">
            <Megaphone size={22} />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">لا توجد إعلانات حالياً.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((a) => {
            const meta = SEVERITY_META[a.severity];
            return (
              <li
                key={a.id}
                className={`rounded-[var(--radius-lg)] border p-5 ${meta.container}`}
              >
                <div className="flex items-start gap-3">
                  <Megaphone size={20} className={`mt-0.5 shrink-0 ${meta.iconColor}`} />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                      <span className={meta.accent}>{meta.label}</span>
                      {a.isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-0)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                          <Pin size={10} /> مثبّت
                        </span>
                      )}
                      <span className="text-[var(--text-muted)]">
                        {formatDateAr(a.createdAt)}
                      </span>
                    </div>
                    <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">
                      {a.titleAr}
                    </h2>
                    {a.bodyAr && (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                        {a.bodyAr}
                      </p>
                    )}
                    {a.imageUrl && (
                      <a
                        href={`/api/announcement-image/${a.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 block overflow-hidden rounded-[var(--radius-default)] border border-[var(--border-subtle)] bg-[var(--surface-0)]"
                        style={{ width: "fit-content", maxWidth: "260px" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/announcement-image/${a.id}`}
                          alt={a.titleAr}
                          className="block h-auto w-full object-contain"
                          style={{ maxHeight: "340px" }}
                          loading="lazy"
                        />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
