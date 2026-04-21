import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Bookmark } from "lucide-react";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { FileCard } from "@/components/files/FileCard";

export const metadata = { title: "المحفوظات" };

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user) return null;

  const rows = await db
    .select({ file: schema.files, bookmarkedAt: schema.bookmarks.createdAt })
    .from(schema.bookmarks)
    .innerJoin(schema.files, eq(schema.bookmarks.fileId, schema.files.id))
    .where(eq(schema.bookmarks.userId, session.user.id))
    .orderBy(desc(schema.bookmarks.createdAt));

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          المحفوظات
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          الملفات التي حفظتها للرجوع إليها لاحقاً.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-muted)]">
            <Bookmark size={22} />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            لم تحفظ أيّ ملفّ بعد. تصفّح الوحدات واضغط أيقونة الحفظ.
          </p>
          <Link href="/dashboard" className="btn-outline text-sm">
            اذهب إلى لوحتي
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {rows.map((r) => (
            <FileCard key={r.file.id} file={r.file} bookmarked />
          ))}
        </div>
      )}
    </div>
  );
}
