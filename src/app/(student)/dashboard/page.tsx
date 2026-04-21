import Link from "next/link";
import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import { BookOpen, Bookmark, Clock, FileStack, History, Megaphone } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { db, schema } from "@/lib/db";
import { UnitCard } from "@/components/units/UnitCard";
import { FILE_TYPE_META } from "@/lib/files";
import { AnnouncementBanner } from "@/components/announcements/AnnouncementBanner";
import { formatDateAr } from "@/lib/announcements";

export const metadata = { title: "لوحتي" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const userName = session.user.name ?? "الطالب";

  // Parallel data fetch
  const [semesters, units, fileCountRows, bookmarkCountRow, quizStatsRow, recentFiles, pinned] =
    await Promise.all([
      db
        .select()
        .from(schema.semesters)
        .where(eq(schema.semesters.isPublished, true))
        .orderBy(schema.semesters.order),
      db
        .select()
        .from(schema.units)
        .where(eq(schema.units.isPublished, true))
        .orderBy(schema.units.order),
      db
        .select({ c: count() })
        .from(schema.files)
        .where(eq(schema.files.isPublished, true)),
      db
        .select({ c: count() })
        .from(schema.bookmarks)
        .where(eq(schema.bookmarks.userId, userId)),
      db
        .select({
          completed: count(),
          avg: sql<number>`avg(${schema.quizAttempts.scorePercent})`.as("avg"),
        })
        .from(schema.quizAttempts)
        .where(
          and(
            eq(schema.quizAttempts.userId, userId),
            isNotNull(schema.quizAttempts.completedAt),
          ),
        ),
      db
        .select()
        .from(schema.files)
        .where(eq(schema.files.isPublished, true))
        .orderBy(desc(schema.files.createdAt))
        .limit(5),
      db
        .select()
        .from(schema.announcements)
        .where(
          and(
            eq(schema.announcements.isPublished, true),
            eq(schema.announcements.isPinned, true),
          ),
        )
        .orderBy(desc(schema.announcements.createdAt))
        .limit(1)
        .then((r) => r[0] ?? null),
    ]);

  const totalFiles = Number(fileCountRows[0]?.c ?? 0);
  const totalBookmarks = Number(bookmarkCountRow[0]?.c ?? 0);
  const quizzesCompleted = Number(quizStatsRow[0]?.completed ?? 0);
  const avgScore = quizStatsRow[0]?.avg ? Math.round(Number(quizStatsRow[0].avg)) : null;

  const now = new Date();
  const gregorian = formatDateAr(now);
  const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="font-latin text-xs uppercase tracking-[0.35em] text-[var(--romi-gold-dark)]">
          Welcome back
        </p>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
          أهلاً، {userName}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {hijri} · {gregorian}
        </p>
      </header>

      {pinned && (
        <AnnouncementBanner
          id={pinned.id}
          title={pinned.titleAr}
          body={pinned.bodyAr}
          severity={pinned.severity}
        />
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard label="الأوراق المتاحة" value={totalFiles} icon={<FileStack size={18} />} />
        <StatCard label="المحفوظات" value={totalBookmarks} icon={<Bookmark size={18} />} />
        <StatCard
          label="اختبارات أُنجزت"
          value={quizzesCompleted}
          icon={<History size={18} />}
        />
        <StatCard
          label="المتوسّط"
          value={avgScore !== null ? `${avgScore}٪` : "—"}
          icon={<Clock size={18} />}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
            الوحدات الدراسية
          </h2>
          {semesters.length > 0 && (
            <Link
              href={`/semester/${semesters[0].id}`}
              className="text-xs font-medium text-[var(--romi-navy)] hover:text-[var(--romi-navy-light)]"
            >
              كلّ الفصول ←
            </Link>
          )}
        </div>
        {units.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-8 text-center text-sm text-[var(--text-muted)]">
            لا توجد وحدات منشورة بعد.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {units.map((u) => (
              <UnitCard key={u.id} unit={u} />
            ))}
          </div>
        )}
      </section>

      {recentFiles.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
            المضاف مؤخراً
          </h2>
          <ul className="divide-y divide-[var(--border-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)]">
            {recentFiles.map((f) => {
              const meta = FILE_TYPE_META[f.type];
              return (
                <li key={f.id}>
                  <Link
                    href={`/unit/${f.unitId}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-1)]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-default)] bg-[var(--surface-1)] text-[var(--romi-navy)]">
                      <BookOpen size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {f.titleAr}
                        {f.examNumber ? ` — ${f.examNumber}` : ""}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {formatDateAr(f.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.toneClass}`}
                    >
                      {meta.labelAr}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickLink href="/bookmarks" icon={<Bookmark size={18} />} label="المحفوظات" />
        <QuickLink href="/history" icon={<History size={18} />} label="سجلّ الاختبارات" />
        <QuickLink href="/announcements" icon={<Megaphone size={18} />} label="الإعلانات" />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
        <span className="text-[var(--romi-gold-dark)]">{icon}</span>
      </div>
      <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
        {typeof value === "number" ? value.toLocaleString("ar-EG") : value}
      </span>
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
