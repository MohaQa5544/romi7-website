import { History } from "lucide-react";

export const metadata = { title: "سجلّ الاختبارات" };

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          سجلّ الاختبارات
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          ستظهر هنا كلّ محاولاتك في الاختبارات التفاعلية.
        </p>
      </header>

      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-muted)]">
          <History size={22} />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          ميزة الاختبارات التفاعلية قادمة قريباً.
        </p>
      </div>
    </div>
  );
}
