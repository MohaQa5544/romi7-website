import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SocialLinks } from "@/components/common/SocialLinks";
import { SITE } from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[var(--border-subtle)] bg-[var(--surface-1)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-4">
          <Logo size={48} href={null} />
          <p className="max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
            {SITE.description}
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-display text-sm font-semibold text-[var(--text-primary)]">
            روابط
          </h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>
              <Link href="/" className="hover:text-[var(--text-primary)]">الرئيسية</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[var(--text-primary)]">عن الأستاذ</Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-[var(--text-primary)]">تسجيل الدخول</Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-[var(--text-primary)]">إنشاء حساب</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-display text-sm font-semibold text-[var(--text-primary)]">
            تواصل مع الأستاذ
          </h3>
          <p className="mb-3 font-latin text-sm text-[var(--text-secondary)]" dir="ltr">
            {SITE.socials.whatsappDisplay}
          </p>
          <SocialLinks size="sm" />
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-[var(--text-muted)] sm:flex-row sm:px-6">
          <p>© {year} {SITE.name}. جميع الحقوق محفوظة.</p>
          <p className="font-latin">ROMIH IN MATHS · Built with Next.js</p>
        </div>
      </div>
    </footer>
  );
}
