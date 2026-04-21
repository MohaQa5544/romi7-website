import Link from "next/link";
import { FileQuestion, Users } from "lucide-react";

type Tab = "questions" | "attempts";

export function QuizAdminTabs({ unitId, active }: { unitId: string; active: Tab }) {
  const tabs = [
    { id: "questions" as const, href: `/admin/quizzes/${unitId}`, label: "الأسئلة", icon: FileQuestion },
    { id: "attempts" as const, href: `/admin/quizzes/${unitId}/attempts`, label: "محاولات الطلّاب", icon: Users },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-[var(--radius-default)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-1">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href}
            className={`inline-flex items-center gap-1.5 rounded-[calc(var(--radius-default)-4px)] px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-[var(--romi-navy)] text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
