import { LogoMark } from "@/components/brand/LogoMark";
import { SocialLinks } from "@/components/common/SocialLinks";
import { SITE } from "@/lib/constants";

export function TeacherBio() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="card card-accent-top grid items-center gap-8 p-8 md:grid-cols-[auto_1fr] md:p-12">
        <LogoMark size={120} variant="transparent" />
        <div>
          <p className="font-latin text-xs uppercase tracking-[0.3em] text-[var(--romi-gold-dark)]">
            Teacher
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            الأستاذ {SITE.teacherName}
          </h3>
          <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">
            سنوات من الخبرة في تدريس الرياضيات لطلاب الثانوية العامة في قطر،
            مع تركيز خاص على المسار العلمي والتكنولوجي. تهدف هذه المنصّة إلى جمع
            كل مواد الأستاذ في مكان واحد، مع اختبارات تفاعلية لتدريب الطلاب قبل
            الاختبارات النهائية.
          </p>
          <div className="mt-5">
            <SocialLinks />
          </div>
        </div>
      </div>
    </section>
  );
}
