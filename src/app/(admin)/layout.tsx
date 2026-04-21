import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, LayoutDashboard, Users, FileText, BookOpen, Megaphone, ClipboardCheck } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { logoutAction } from "@/lib/auth/logout";
import { AdminSidebarLink } from "@/components/admin/AdminSidebarLink";

const navItems = [
  { href: "/admin", label: "لوحة التحكّم", icon: LayoutDashboard, exact: true },
  { href: "/admin/students", label: "الطلّاب", icon: Users, exact: false },
  { href: "/admin/units", label: "الوحدات", icon: BookOpen, exact: false },
  { href: "/admin/files", label: "الملفات", icon: FileText, exact: false },
  { href: "/admin/quizzes", label: "الاختبارات", icon: ClipboardCheck, exact: false },
  { href: "/admin/announcements", label: "الإعلانات", icon: Megaphone, exact: false },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-[var(--surface-1)]">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-s border-[var(--border-subtle)] bg-[var(--surface-0)] md:flex">
        <div className="flex h-16 items-center border-b border-[var(--border-subtle)] px-5">
          <Logo size={36} />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <p className="px-3 pt-2 pb-1 font-latin text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Admin
          </p>
          {navItems.map((item) => (
            <AdminSidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<item.icon size={16} />}
              exact={item.exact}
            />
          ))}
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-[var(--radius-default)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--surface-0)_90%,transparent)] px-4 backdrop-blur sm:px-6 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <Logo size={32} />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:inline"
            >
              ← عودة إلى الموقع
            </Link>
            <ThemeToggle />
            <span className="hidden text-sm text-[var(--text-secondary)] sm:inline">
              {session.user.name}
            </span>
          </div>
        </header>

        {/* Mobile nav bar */}
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-0)] md:hidden">
          <div className="flex gap-1 overflow-x-auto px-2 py-2">
            {navItems.map((item) => (
              <AdminSidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={<item.icon size={14} />}
                exact={item.exact}
                compact
              />
            ))}
          </div>
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
