import Link from "next/link";
import { BookOpen, Bookmark, History, Megaphone } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export const metadata = { title: "لوحتي" };

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? "الطالب";

  const semesters = await db
    .select()
    .from(schema.semesters)
    .orderBy(schema.semesters.order);

  const pinnedAnnouncement = (
    await db
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.isPinned, true))
      .orderBy(desc(schema.announcements.createdAt))
      .limit(1)
  )[0];

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="font-latin text-xs uppercase tracking-[0.35em] text-[var(--romi-gold-dark)]">
          Welcome back
        </p>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
          أهلاً، {userName} 👋
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          تابع تقدّمك في المنهج، وابدأ مذاكرتك من حيث توقّفت.
        </p>
      </header>

      {pinnedAnnouncement && (
        <section className="rounded-[var(--radius-lg)] border border-[var(--romi-gold)]/30 bg-[var(--romi-gold)]/8 p-5">
          <div className="flex items-start gap-3">
            <Megaphone size={20} className="mt-0.5 shrink-0 text-[var(--romi-gold-dark)]" />
            <div className="space-y-1">
              <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">
                {pinnedAnnouncement.titleAr}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {pinnedAnnouncement.bodyAr}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
          الفصول الدراسية
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {semesters.map((s) => (
            <Link
              key={s.id}
              href={`/semester/${s.id}`}
              className="group rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-0)] p-5 transition-all hover:border-[var(--romi-gold)] hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-default)] bg-[var(--romi-navy)]/8 text-[var(--romi-navy)]">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--romi-navy)]">
                    {s.nameAr}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">استعرض الوحدات والملفات</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <QuickLink href="/bookmarks" icon={<Bookmark size={18} />} label="المحفوظات" />
        <QuickLink href="/history" icon={<History size={18} />} label="سجلّ الاختبارات" />
      </section>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[var(--radius-default)] border border-[var(--border-default)] bg-[var(--surface-0)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--romi-gold)] hover:text-[var(--text-primary)]"
    >
      <span className="text-[var(--romi-gold-dark)]">{icon}</span>
      {label}
    </Link>
  );
}
