import Link from "next/link";
import { and, count, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { Users, Download, ClipboardCheck, TrendingUp, Upload, Megaphone } from "lucide-react";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { formatDateAr } from "@/lib/announcements";

export const metadata = { title: "لوحة التحكّم — الإدارة" };

const EVENT_LABEL: Record<string, string> = {
  login: "تسجيل دخول",
  signup: "حساب جديد",
  file_download: "تحميل ملف",
  quiz_start: "بدء اختبار",
  quiz_complete: "إنهاء اختبار",
  bookmark_add: "حفظ ملف",
  page_view: "زيارة صفحة",
};

export default async function AdminHome() {
  await requireAdmin();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [studentsRow, downloadsTodayRow, quizzesRow, avgScoreRow, recentActivity] =
    await Promise.all([
      db
        .select({ c: count() })
        .from(schema.users)
        .where(eq(schema.users.role, "student")),
      db
        .select({ c: count() })
        .from(schema.activityLog)
        .where(
          and(
            eq(schema.activityLog.eventType, "file_download"),
            gte(schema.activityLog.createdAt, startOfToday),
          ),
        ),
      db
        .select({ c: count() })
        .from(schema.quizAttempts)
        .where(isNotNull(schema.quizAttempts.completedAt)),
      db
        .select({ avg: sql<number>`avg(${schema.quizAttempts.scorePercent})`.as("avg") })
        .from(schema.quizAttempts)
        .where(isNotNull(schema.quizAttempts.completedAt)),
      db
        .select({
          id: schema.activityLog.id,
          eventType: schema.activityLog.eventType,
          createdAt: schema.activityLog.createdAt,
          userName: schema.users.name,
        })
        .from(schema.activityLog)
        .leftJoin(schema.users, eq(schema.activityLog.userId, schema.users.id))
        .orderBy(desc(schema.activityLog.createdAt))
        .limit(15),
    ]);

  const students = Number(studentsRow[0]?.c ?? 0);
  const downloadsToday = Number(downloadsTodayRow[0]?.c ?? 0);
  const quizzes = Number(quizzesRow[0]?.c ?? 0);
  const avg = avgScoreRow[0]?.avg ? Math.round(Number(avgScoreRow[0].avg)) : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="font-latin text-xs uppercase tracking-[0.3em] text-[var(--romi-gold-dark)]">
            Admin dashboard
          </p>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            نظرة عامّة
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/files" className="btn-outline text-sm">
            <Upload size={14} className="me-1.5 inline" /> رفع ملف
          </Link>
          <Link href="/admin/announcements" className="btn-gold text-sm">
            <Megaphone size={14} className="me-1.5 inline" /> إعلان جديد
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard label="عدد الطلّاب" value={students} icon={<Users size={18} />} />
        <StatCard label="تحميلات اليوم" value={downloadsToday} icon={<Download size={18} />} />
        <StatCard label="اختبارات أُنجزت" value={quizzes} icon={<ClipboardCheck size={18} />} />
        <StatCard
          label="متوسّط النتيجة"
          value={avg !== null ? `${avg}٪` : "—"}
          icon={<TrendingUp size={18} />}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
          أحدث النشاطات
        </h2>
        {recentActivity.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-8 text-center text-sm text-[var(--text-muted)]">
            لا توجد نشاطات مسجّلة بعد.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-1)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-2.5 text-start font-medium">الحدث</th>
                  <th className="px-4 py-2.5 text-start font-medium">المستخدم</th>
                  <th className="px-4 py-2.5 text-start font-medium">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {recentActivity.map((a) => (
                  <tr key={a.id} className="hover:bg-[var(--surface-1)]">
                    <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">
                      {EVENT_LABEL[a.eventType] ?? a.eventType}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                      {a.userName ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text-muted)]">
                      {formatRelativeAr(a.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

function formatRelativeAr(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "قبل لحظات";
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 86400 * 7) return `قبل ${Math.floor(diff / 86400)} يوم`;
  return formatDateAr(date);
}
