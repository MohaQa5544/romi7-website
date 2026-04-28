import { desc } from "drizzle-orm";
import { Megaphone } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { SEVERITY_META, formatDateAr } from "@/lib/announcements";
import { AnnouncementDialog } from "@/components/admin/AnnouncementDialog";
import { TogglePublishButton } from "@/components/admin/TogglePublishButton";
import { PinToggle } from "@/components/admin/PinToggle";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  togglePinAnnouncement,
  toggleAnnouncementPublished,
  deleteAnnouncement,
} from "@/lib/admin/announcements-actions";

export const metadata = { title: "الإعلانات — الإدارة" };

export default async function AdminAnnouncementsPage() {
  await requireAdmin();

  const rows = await db
    .select()
    .from(schema.announcements)
    .orderBy(desc(schema.announcements.isPinned), desc(schema.announcements.createdAt));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            الإعلانات
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">{rows.length} إعلان</p>
        </div>
        <AnnouncementDialog />
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center">
          <Megaphone size={28} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">لا إعلانات بعد.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((a) => {
            const meta = SEVERITY_META[a.severity];
            return (
              <li
                key={a.id}
                className={`rounded-[var(--radius-lg)] border p-4 ${meta.container}`}
              >
                <div className="flex flex-wrap items-start gap-4">
                  {a.imageUrl && (
                    <a
                      href={`/api/announcement-image/${a.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-default)] border border-[var(--border-subtle)] bg-[var(--surface-0)]"
                      title="فتح الصورة بالحجم الكامل"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/announcement-image/${a.id}`}
                        alt={a.titleAr}
                        className="block h-full w-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  )}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                      <span className={meta.accent}>{meta.label}</span>
                      <span className="text-[var(--text-muted)]">
                        {formatDateAr(a.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                      {a.titleAr}
                    </h3>
                    {a.bodyAr && (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                        {a.bodyAr}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <TogglePublishButton
                      id={a.id}
                      isPublished={a.isPublished}
                      action={toggleAnnouncementPublished}
                    />
                    <PinToggle
                      id={a.id}
                      pinned={a.isPinned}
                      action={togglePinAnnouncement}
                    />
                    <AnnouncementDialog announcement={a} trigger="edit" />
                    <DeleteButton
                      id={a.id}
                      size="sm"
                      confirmMessage={`هل تريد حذف إعلان «${a.titleAr}»؟`}
                      action={deleteAnnouncement}
                    />
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
