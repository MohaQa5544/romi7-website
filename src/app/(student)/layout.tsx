import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { logoutAction } from "@/lib/auth/logout";

const navLinks = [
  { href: "/dashboard", label: "لوحتي" },
  { href: "/bookmarks", label: "المحفوظات" },
  { href: "/history", label: "سجلّ الاختبارات" },
  { href: "/announcements", label: "الإعلانات" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--surface-0)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo size={40} />

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {session.user.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-default)] border border-[var(--romi-gold)] bg-[color-mix(in_oklab,var(--romi-gold)_12%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--romi-gold-dark)] transition-colors hover:bg-[color-mix(in_oklab,var(--romi-gold)_20%,transparent)]"
                aria-label="لوحة الإدارة"
              >
                <Shield size={14} />
                <span className="hidden sm:inline">لوحة الإدارة</span>
              </Link>
            )}
            <ThemeToggle />
            <Link
              href="/profile"
              className="hidden text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:inline-flex"
            >
              {session.user.name ?? "حسابي"}
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-default)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--danger)] hover:text-[var(--danger)]"
                aria-label="تسجيل الخروج"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
