import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { SITE } from "@/lib/constants";
import { SocialLinks } from "@/components/common/SocialLinks";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1.1fr_1fr]">
      {/* Navy brand panel */}
      <aside className="hero-navy relative hidden flex-col justify-between p-10 md:flex">
        <Link href="/" className="inline-flex items-center gap-3 text-white/90 transition-colors hover:text-white">
          <LogoMark size={40} priority />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold">رميح في الرياضيات</span>
            <span className="font-latin text-[0.65rem] tracking-[0.3em] text-[var(--romi-gold-light)]">
              ROMIH IN MATHS
            </span>
          </span>
        </Link>

        <div className="max-w-md space-y-5">
          <p className="font-latin text-xs uppercase tracking-[0.4em] text-[var(--romi-gold-light)]">
            Success is not final
          </p>
          <h2 className="font-display text-3xl font-bold leading-snug text-white">
            «النجاح ليس وجهةً، بل هو عادةٌ يوميّةٌ من المراجعة والتمارين.»
          </h2>
          <p className="text-sm leading-relaxed text-white/70">
            انضمّ إلى طلاب الأستاذ {SITE.teacherName} للتحضير لاختبارات الثانوية العامة —
            المسار العلمي والتكنولوجي.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-latin text-xs text-white/50">© {new Date().getFullYear()} Romi7 Maths</p>
          <SocialLinks size="sm" variant="ghost" showLabels={false} />
        </div>
      </aside>

      {/* Form side */}
      <section className="flex flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4 md:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <LogoMark size={32} />
            <span className="font-display text-sm font-semibold">رميح في الرياضيات</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </div>
  );
}
