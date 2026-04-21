import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { SITE } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="hero-navy relative overflow-hidden">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28 md:py-32">
        <LogoMark size={112} priority className="ring-4 ring-[rgba(245,197,24,0.25)]" />

        <div className="space-y-4">
          <p className="font-latin text-xs uppercase tracking-[0.35em] text-[var(--romi-gold-light)]">
            ROMIH IN MATHS
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            الرياضيات للثانوية العامة
          </h1>
          <p className="mx-auto max-w-2xl text-base text-white/80 sm:text-lg">
            {SITE.tagline} — سلسلة الأستاذ {SITE.teacherName}.
          </p>
        </div>

        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/login" className="btn-gold min-w-40 text-center">
            تسجيل الدخول
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-w-40 items-center justify-center rounded-[var(--radius-default)] border-2 border-white/30 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
          >
            إنشاء حساب
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-white/70">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--romi-gold)]" />
            الفصل الدراسي الثاني
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--romi-gold)]" />
            المسار العلمي والتكنولوجي
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--romi-gold)]" />
            اختبارات تفاعلية
          </span>
        </div>
      </div>
    </section>
  );
}
