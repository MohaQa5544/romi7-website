import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AnnouncementBanner } from "./AnnouncementBanner";

export async function PinnedHomeBanner() {
  const [pinned] = await db
    .select()
    .from(schema.announcements)
    .where(
      and(
        eq(schema.announcements.isPublished, true),
        eq(schema.announcements.isPinned, true),
      ),
    )
    .orderBy(desc(schema.announcements.createdAt))
    .limit(1);

  if (!pinned) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <AnnouncementBanner
        id={pinned.id}
        title={pinned.titleAr}
        body={pinned.bodyAr}
        imageUrl={pinned.imageUrl}
        severity={pinned.severity}
      />
    </div>
  );
}
