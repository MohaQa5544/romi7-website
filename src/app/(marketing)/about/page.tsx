import { LogoMark } from "@/components/brand/LogoMark";
import { SocialLinks } from "@/components/common/SocialLinks";
import { SITE } from "@/lib/constants";

export const metadata = { title: "عن الأستاذ" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <div className="flex flex-col items-center gap-6 text-center">
        <LogoMark size={140} priority />
        <div>
          <p className="font-latin text-xs uppercase tracking-[0.3em] text-[var(--romi-gold-dark)]">
            {SITE.teacherNameEn}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            الأستاذ {SITE.teacherName}
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">{SITE.tagline}</p>
        </div>
      </div>

      <article className="mt-12 space-y-5 text-base leading-loose text-[var(--text-secondary)]">
        <p>
          يُشرف الأستاذ {SITE.teacherName} على تدريس مادة الرياضيات لطلاب الثانوية العامة
          في دولة قطر، وفق المنهاج القطري للمسار العلمي والتكنولوجي. تركّز
          سلسلته على بناء الأساس المفاهيمي للطالب، ثم التدرّج عبر أمثلة
          متنوعة تغطي جميع أنماط الأسئلة المتوقعة في الاختبارات النهائية.
        </p>
        <p>
          هذه المنصّة تجمع أعمال الأستاذ رميح في مكان واحد: ملازم الوحدات،
          نماذج الإجابة، اختبارات وحدة التكامل، وتطبيقات تفاعلية لحل الأسئلة
          مباشرة من المتصفح مع تصحيح فوري.
        </p>
        <p>
          للتواصل المباشر أو الاستفسار عن حصص خاصة أو مراجعات، يمكن التواصل
          عبر قناة تيليجرام الرسمية أو واتساب:
        </p>
      </article>

      <div className="mt-8 flex justify-center">
        <SocialLinks size="lg" />
      </div>
    </div>
  );
}
