import { BookOpen, ClipboardCheck, LineChart } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "أوراق مُنظَّمة",
    body: "مجموعة شاملة من الملازم والاختبارات ونماذج الإجابة لكل وحدة من وحدات الفصل الدراسي الثاني، بصيغة PDF نظيفة وسهلة التحميل.",
  },
  {
    icon: ClipboardCheck,
    title: "اختبارات تفاعلية",
    body: "حل أسئلة اختيار من متعدد مأخوذة مباشرة من أوراق الأستاذ، مع تصحيح فوري وعرض الإجابة الصحيحة بعد الانتهاء.",
  },
  {
    icon: LineChart,
    title: "متابعة التقدم",
    body: "احتفظ بسجل اختباراتك ومواضعك، وشاهد نتائجك ومعدلاتك، واعرف الوحدات التي تحتاج إلى مراجعة إضافية.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mb-10 text-center md:mb-14">
        <h2 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
          كل ما تحتاجه للتفوق
        </h2>
        <p className="mt-3 text-[var(--text-secondary)]">
          منصّة مصممة لطلاب الصف الثاني عشر — المسار العلمي والتكنولوجي في دولة قطر.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="card card-accent-top p-6"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--romi-gold)_22%,transparent)] text-[var(--romi-gold-dark)]">
              <Icon size={22} />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
