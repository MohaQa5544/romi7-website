import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type SiteHeaderProps = {
  variant?: "marketing" | "app";
};

const marketingLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "عن الأستاذ" },
];

export function SiteHeader({ variant = "marketing" }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--surface-0)_88%,transparent)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo size={40} />

        {variant === "marketing" && (
          <nav className="hidden items-center gap-6 md:flex">
            {marketingLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {variant === "marketing" && (
            <>
              <Link href="/login" className="btn-outline hidden text-sm sm:inline-flex">
                تسجيل الدخول
              </Link>
              <Link href="/signup" className="btn-gold hidden text-sm md:inline-flex">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
