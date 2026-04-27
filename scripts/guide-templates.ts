/**
 * HTML templates for the two user guides.
 * Rendered to PDF by scripts/build-guide-pdfs.ts.
 *
 * Design: editorial magazine style — full-bleed cover, gold accents,
 * Mr. Romih's brand palette, Readex Pro + IBM Plex Sans Arabic.
 */

type Assets = { shots: Record<string, string>; logo: string };
type AdminAssets = Assets & { adminEmail: string; adminPassword: string };

/* ============================================================
 *  SHARED CSS — editorial, brand-aligned, print-tuned
 * ============================================================ */
const sharedCss = `
@import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');

@page {
  size: A4;
  margin: 0;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy: #0A1A4A;
  --navy-light: #152258;
  --navy-dark: #050E2E;
  --gold: #F5C518;
  --gold-light: #FFD84D;
  --gold-dark: #D4A500;
  --red: #E63946;
  --ink: #0A1A4A;
  --ink-2: #2F3A5F;
  --muted: #6B7499;
  --surface: #FFFFFF;
  --surface-1: #F7F8FB;
  --surface-2: #EEF1F7;
  --border: #E5E9F2;
  --radius: 14px;
  --radius-lg: 20px;
}

html, body {
  font-family: 'IBM Plex Sans Arabic', 'Readex Pro', system-ui, sans-serif;
  color: var(--ink);
  background: #fff;
  direction: rtl;
  font-size: 11pt;
  line-height: 1.75;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

h1, h2, h3, h4 {
  font-family: 'Readex Pro', 'IBM Plex Sans Arabic', system-ui, sans-serif;
  color: var(--navy);
  line-height: 1.25;
  font-weight: 700;
}

p { color: var(--ink-2); }

/* ============= PAGE ============= */
.page {
  width: 210mm;
  height: 297mm;
  padding: 14mm 18mm 16mm;
  page-break-after: always;
  page-break-inside: avoid;
  break-inside: avoid;
  position: relative;
  background: #fff;
  overflow: hidden;
}
.page:last-child { page-break-after: auto; }

/* ============= COVER ============= */
.cover {
  padding: 0;
  display: flex;
  flex-direction: column;
  color: #fff;
  background:
    radial-gradient(1200px 700px at 85% 15%, rgba(245, 197, 24, 0.28), transparent 55%),
    radial-gradient(900px 600px at 10% 90%, rgba(230, 57, 70, 0.18), transparent 60%),
    linear-gradient(140deg, var(--navy-dark) 0%, var(--navy) 55%, var(--navy-light) 100%);
}
.cover .ornament {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.04) 0, transparent 35%),
    radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 0, transparent 40%);
  pointer-events: none;
}
.cover::before {
  content: '';
  position: absolute; inset: 18mm;
  border: 1px solid rgba(245, 197, 24, 0.35);
  border-radius: 8px;
  pointer-events: none;
}
.cover-inner {
  flex: 1;
  padding: 28mm 24mm;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}
.cover-logo {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: auto;
}
.cover-logo img {
  width: 88px; height: 88px;
  border-radius: 50%;
  filter: drop-shadow(0 6px 22px rgba(245,197,24,0.35)) drop-shadow(0 2px 8px rgba(0,0,0,0.35));
  object-fit: contain;
}
.cover-logo .brand {
  font-family: 'Readex Pro';
  font-weight: 700; font-size: 14pt;
  color: #fff; letter-spacing: 0.02em;
}
.cover-logo .brand small {
  display: block; color: var(--gold-light);
  font-size: 9.5pt; font-weight: 400;
  letter-spacing: 0.25em; margin-top: 2px;
}
.cover-kicker {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(245,197,24,0.15);
  border: 1px solid rgba(245,197,24,0.45);
  border-radius: 999px;
  color: var(--gold-light);
  font-size: 9.5pt; font-weight: 600;
  letter-spacing: 0.12em;
  margin-bottom: 24px;
  align-self: flex-start;
}
.cover h1 {
  color: #fff;
  font-size: 54pt;
  line-height: 1.05;
  font-weight: 800;
  margin-bottom: 18px;
  letter-spacing: -0.01em;
}
.cover h1 .accent { color: var(--gold); }
.cover .tagline {
  font-family: 'Readex Pro';
  color: rgba(255,255,255,0.8);
  font-size: 15pt; font-weight: 300;
  line-height: 1.55;
  max-width: 140mm;
  margin-bottom: 36px;
}
.cover .rule {
  height: 2px;
  width: 120px;
  background: linear-gradient(90deg, var(--gold), transparent);
  margin-bottom: 24px;
}
.cover-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.12);
}
.cover-footer .left {
  font-family: 'Readex Pro';
  font-size: 11pt; color: rgba(255,255,255,0.85); font-weight: 500;
}
.cover-footer .left small {
  display: block; color: rgba(255,255,255,0.55);
  font-size: 9pt; margin-top: 4px; font-weight: 400;
}
.cover-footer .right {
  font-size: 9.5pt; color: var(--gold-light);
  letter-spacing: 0.2em; text-transform: uppercase;
}

/* ============= HEADER / FOOTER on interior pages ============= */
.head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6mm;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
.head .brand {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Readex Pro';
  color: var(--navy);
  font-weight: 600;
  font-size: 10pt;
}
.head .brand img { width: 22px; height: 22px; border-radius: 50%; object-fit: contain; }
.head .section-tag {
  font-size: 8.5pt;
  letter-spacing: 0.22em;
  color: var(--muted);
  text-transform: uppercase;
}

/* ============= TYPOGRAPHY ============= */
.h-chapter {
  color: var(--navy);
  font-size: 10pt;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 600;
}
.h-chapter::before {
  content: '';
  display: inline-block;
  width: 28px; height: 2px;
  background: var(--gold);
  vertical-align: middle;
  margin-left: 10px;
}
h2.chapter-title {
  font-size: 26pt;
  color: var(--navy);
  margin-bottom: 8px;
  line-height: 1.1;
  font-weight: 800;
}
.chapter-lede {
  color: var(--ink-2);
  font-size: 11.5pt;
  line-height: 1.6;
  max-width: 160mm;
  margin-bottom: 12px;
}
h3.section-title {
  font-size: 14pt;
  color: var(--navy);
  margin: 14px 0 6px;
  font-weight: 700;
}
h3.section-title .num {
  display: inline-block;
  min-width: 32px;
  height: 32px; line-height: 32px;
  text-align: center;
  background: var(--gold);
  color: var(--navy);
  border-radius: 8px;
  font-size: 12pt;
  font-weight: 800;
  margin-left: 12px;
  padding: 0 10px;
}
p.body {
  font-size: 10.5pt;
  line-height: 1.7;
  margin-bottom: 6px;
  color: var(--ink-2);
}
p.body strong { color: var(--navy); font-weight: 600; }
ul.steps {
  list-style: none;
  counter-reset: step;
  padding: 0;
  margin: 8px 0 10px;
}
ul.steps li {
  position: relative;
  padding-right: 38px;
  margin-bottom: 6px;
  font-size: 10.5pt;
  line-height: 1.6;
  color: var(--ink-2);
}
ul.steps li::before {
  counter-increment: step;
  content: counter(step);
  position: absolute;
  right: 0; top: 2px;
  width: 26px; height: 26px;
  line-height: 26px; text-align: center;
  background: var(--surface-2);
  color: var(--navy);
  font-family: 'Readex Pro';
  font-weight: 700;
  border-radius: 7px;
  font-size: 10pt;
}
ul.bullets {
  list-style: none;
  padding: 0;
  margin: 6px 0 10px;
}
ul.bullets li {
  position: relative;
  padding-right: 20px;
  margin-bottom: 5px;
  font-size: 10.5pt;
  color: var(--ink-2);
  line-height: 1.6;
}
ul.bullets li::before {
  content: '';
  position: absolute; right: 4px; top: 9px;
  width: 7px; height: 7px;
  background: var(--gold);
  border-radius: 50%;
}

/* ============= SCREENSHOT CARDS ============= */
figure.shot {
  margin: 8px 0 12px;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 8px;
  box-shadow:
    0 1px 2px rgba(10,26,74,0.04),
    0 10px 28px rgba(10,26,74,0.08);
  page-break-inside: avoid;
  max-width: 100%;
}
figure.shot img {
  width: 100%;
  max-width: 100%;
  max-height: 95mm;
  height: auto;
  display: block;
  margin: 0 auto;
  border-radius: 10px;
  border: 1px solid var(--border);
  object-fit: contain;
}
figure.shot.sm img { max-height: 70mm; }
figure.shot.lg img { max-height: 130mm; }
figure.shot figcaption {
  padding: 6px 8px 2px;
  font-size: 9pt;
  color: var(--muted);
  text-align: center;
}

/* ============= BOXES ============= */
.callout {
  padding: 10px 14px;
  border-radius: var(--radius);
  margin: 8px 0;
  font-size: 10pt;
  line-height: 1.6;
  page-break-inside: avoid;
}
.callout .ico {
  font-weight: 700;
  color: var(--navy);
  margin-left: 8px;
}
.callout.tip {
  background: linear-gradient(180deg, rgba(245,197,24,0.08), rgba(245,197,24,0.04));
  border: 1px solid rgba(245,197,24,0.35);
}
.callout.info {
  background: rgba(59,130,246,0.06);
  border: 1px solid rgba(59,130,246,0.25);
}
.callout.warn {
  background: rgba(230,57,70,0.06);
  border: 1px solid rgba(230,57,70,0.25);
}

/* ============= CREDENTIAL CARD (admin guide) ============= */
.cred-card {
  background:
    radial-gradient(600px 300px at 80% 0%, rgba(245,197,24,0.12), transparent 60%),
    linear-gradient(135deg, var(--navy-dark), var(--navy));
  color: #fff;
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  margin: 20px 0 10px;
  position: relative;
  overflow: hidden;
  page-break-inside: avoid;
  border: 1px solid rgba(245,197,24,0.3);
}
.cred-card .label {
  color: var(--gold-light);
  font-size: 9pt;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-bottom: 4px;
  font-weight: 600;
}
.cred-card .value {
  font-family: 'Readex Pro', monospace;
  font-size: 16pt;
  color: #fff;
  font-weight: 700;
  margin-bottom: 14px;
  letter-spacing: 0.02em;
  direction: ltr;
  text-align: right;
}
.cred-card .warn-line {
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid rgba(245,197,24,0.3);
  color: rgba(255,255,255,0.85);
  font-size: 9.5pt;
}

/* ============= TOC ============= */
.toc h2 {
  font-size: 28pt;
  color: var(--navy);
  margin-bottom: 20px;
  font-weight: 800;
}
.toc ol {
  list-style: none;
  counter-reset: toc;
  padding: 0;
}
.toc ol li {
  counter-increment: toc;
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px dashed var(--border);
  font-size: 12pt;
  color: var(--ink);
}
.toc ol li::before {
  content: counter(toc, decimal-leading-zero);
  font-family: 'Readex Pro';
  color: var(--gold-dark);
  font-weight: 800;
  font-size: 12pt;
  min-width: 32px;
}
.toc .dots {
  flex: 1;
  border-bottom: 1px dotted #cdd3e0;
  margin: 0 8px;
  transform: translateY(-4px);
}

/* ============= KEY FACTS / STATS ============= */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 10px 0 14px;
}
.stat {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
}
.stat .k {
  font-family: 'Readex Pro';
  color: var(--navy);
  font-size: 22pt;
  font-weight: 800;
  line-height: 1;
}
.stat .l {
  color: var(--muted);
  font-size: 9.5pt;
  margin-top: 6px;
  letter-spacing: 0.06em;
}

/* ============= PAGE NUMBERING ============= */
.pageno {
  position: absolute;
  bottom: 10mm; right: 20mm;
  font-size: 9pt;
  color: var(--muted);
  font-family: 'Readex Pro';
}
.pageno-brand {
  position: absolute;
  bottom: 10mm; left: 20mm;
  font-size: 9pt;
  color: var(--muted);
  font-family: 'Readex Pro';
  letter-spacing: 0.08em;
}

/* ============= CLOSING ============= */
.closing {
  background: linear-gradient(160deg, var(--surface-1), #fff);
  border-radius: var(--radius-lg);
  padding: 22px;
  text-align: center;
  margin-top: 8mm;
  border: 1px solid var(--border);
}
.closing h3 {
  font-size: 22pt;
  color: var(--navy);
  margin-bottom: 10px;
}
.closing p {
  color: var(--ink-2);
  font-size: 12pt;
  line-height: 1.7;
}
.sig {
  margin-top: 18px;
  font-family: 'Readex Pro';
  color: var(--gold-dark);
  font-weight: 700;
  font-size: 11pt;
  letter-spacing: 0.1em;
}
`;

/* ============================================================
 *  BUILDING BLOCKS
 * ============================================================ */
function cover({
  logo, kicker, title, titleAccent, tagline, audience,
}: { logo: string; kicker: string; title: string; titleAccent: string; tagline: string; audience: string }) {
  return `
<section class="page cover">
  <div class="ornament"></div>
  <div class="cover-inner">
    <div class="cover-logo">
      <img src="${logo}" alt="Logo" />
      <div class="brand">رميح في الرياضيات<small>ROMI · MATH ACADEMY</small></div>
    </div>

    <div style="margin-top: auto">
      <span class="cover-kicker">${kicker}</span>
      <div class="rule"></div>
      <h1>${title}<br/><span class="accent">${titleAccent}</span></h1>
      <p class="tagline">${tagline}</p>
    </div>

    <div class="cover-footer">
      <div class="left">
        الأستاذ إبراهيم رميح
        <small>Mr. Ibrahim Romih · الثانوية العامة · قطر</small>
      </div>
      <div class="right">${audience}</div>
    </div>
  </div>
</section>`;
}

function pageHeader(logo: string, section: string) {
  return `
<div class="head">
  <div class="brand"><img src="${logo}" alt=""/>رميح في الرياضيات</div>
  <div class="section-tag">${section}</div>
</div>`;
}

function shot(src: string | undefined, caption: string) {
  if (!src) return `<div class="callout warn">صورة مفقودة: ${caption}</div>`;
  return `
<figure class="shot">
  <img src="${src}" alt="${caption}" />
  <figcaption>${caption}</figcaption>
</figure>`;
}

function section(num: number, title: string, body: string) {
  return `
<h3 class="section-title"><span class="num">${num}</span>${title}</h3>
${body}`;
}

/* ============================================================
 *  STUDENT GUIDE
 * ============================================================ */
export function renderStudentGuide({ shots: S, logo }: Assets): string {
  const pages: string[] = [];

  // --- COVER
  pages.push(cover({
    logo,
    kicker: "دليل استخدام — النسخة الأولى",
    title: "دليل الطالب",
    titleAccent: "في موقع رميح",
    tagline: "كلّ ما تحتاج معرفته لاستخدام الموقع بكفاءة: الملازم، فيديوهات الشرح، الاختبارات، المحفوظات، والسجلّ — خطوة بخطوة.",
    audience: "FOR STUDENTS",
  }));

  // --- TOC
  pages.push(`
<section class="page toc">
  ${pageHeader(logo, "المحتوى")}
  <div class="h-chapter">جدول المحتويات</div>
  <h2>ابدأ من هنا</h2>
  <ol>
    <li>ما هو موقع رميح <span class="dots"></span><span>03</span></li>
    <li>إنشاء حساب جديد <span class="dots"></span><span>04</span></li>
    <li>تسجيل الدخول <span class="dots"></span><span>05</span></li>
    <li>الصفحة الرئيسية — لوحتي <span class="dots"></span><span>06</span></li>
    <li>الوحدات الدراسية <span class="dots"></span><span>07</span></li>
    <li>الملازم والملفات <span class="dots"></span><span>08</span></li>
    <li>معاينة ملفات PDF <span class="dots"></span><span>09</span></li>
    <li>فيديوهات الشرح <span class="dots"></span><span>10</span></li>
    <li>الاختبارات الإلكترونية <span class="dots"></span><span>11</span></li>
    <li>المحفوظات <span class="dots"></span><span>12</span></li>
    <li>سجلّ الاختبارات <span class="dots"></span><span>13</span></li>
    <li>الإعلانات <span class="dots"></span><span>14</span></li>
    <li>نصائح وحيل مفيدة <span class="dots"></span><span>15</span></li>
  </ol>
  <div class="pageno">02</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- INTRO (page 3)
  pages.push(`
<section class="page">
  ${pageHeader(logo, "مقدّمة")}
  <div class="h-chapter">الفصل الأول</div>
  <h2 class="chapter-title">ما هو موقع رميح؟</h2>
  <p class="chapter-lede">
    موقع <strong>رميح في الرياضيات</strong> هو منصّتك الشخصية لدراسة مادّة الرياضيات
    للثانوية العامة في دولة قطر، من إعداد الأستاذ <strong>إبراهيم رميح</strong>.
    كلّ ما تحتاجه — ملازم، اختبارات، فيديوهات شرح، إعلانات — في مكان واحد منظّم.
  </p>

  <div class="stats">
    <div class="stat"><div class="k">٨</div><div class="l">وحدات دراسية</div></div>
    <div class="stat"><div class="k">+٥٠</div><div class="l">ملفّ ومُلزمة</div></div>
    <div class="stat"><div class="k">+١٧</div><div class="l">فيديو شرح</div></div>
  </div>

  <h3 class="section-title">ماذا ستجد داخل الموقع؟</h3>
  <ul class="bullets">
    <li><strong>ملازم كاملة:</strong> بنوك أسئلة وحلولها، اختبارات، مراجعات لكل وحدة.</li>
    <li><strong>فيديوهات شرح:</strong> شرح الأستاذ رميح لكلّ درس تُشاهدها داخل الموقع مباشرةً.</li>
    <li><strong>اختبارات تفاعلية:</strong> تحلّها على هاتفك/حاسوبك ويصحّحها الموقع فوراً.</li>
    <li><strong>محفوظات خاصّة:</strong> احفظ الملفات والفيديوهات المهمة لك للرجوع إليها لاحقاً.</li>
    <li><strong>سجلّ كامل:</strong> تتبّع كلّ اختبار حلّيته، درجتك، وتحسّنك مع الوقت.</li>
    <li><strong>إعلانات مباشرة:</strong> تنبيهات الأستاذ وتواريخ الامتحانات أوّل ما ترى.</li>
  </ul>

  ${shot(S["student-landing"], "الصفحة الرئيسية للموقع — تظهر قبل تسجيل الدخول")}

  <div class="pageno">03</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- SIGNUP (page 4)
  pages.push(`
<section class="page">
  ${pageHeader(logo, "البداية")}
  <div class="h-chapter">الفصل الثاني</div>
  <h2 class="chapter-title">إنشاء حساب جديد</h2>
  <p class="chapter-lede">
    لو هذه أوّل مرّة تزور فيها الموقع، تحتاج لإنشاء حساب حتى يتعرّف عليك الموقع ويحفظ
    تقدّمك الدراسي، محفوظاتك، ونتائج اختباراتك.
  </p>

  <ul class="steps">
    <li>ادخل إلى الموقع على الرابط الذي زوّدك به الأستاذ، ستصل مباشرةً إلى صفحة الترحيب.</li>
    <li>اضغط على زرّ <strong>«إنشاء حساب»</strong> أو «تسجيل الآن».</li>
    <li>أدخل اسمك الكامل كما هو في المدرسة، بريدك الإلكتروني، وكلمة سرّ قويّة (٨ خانات فأكثر).</li>
    <li>اضغط على <strong>«إنشاء الحساب»</strong> — ستنتقل مباشرةً إلى لوحتك الشخصية.</li>
  </ul>

  ${shot(S["signup"], "صفحة إنشاء الحساب — املأ بيانات صحيحة")}

  <div class="callout tip">
    <span class="ico">💡 نصيحة:</span>
    استخدم بريداً إلكترونياً تتذكّره جيّداً — سيكون بطاقة دخولك للموقع.
  </div>

  <div class="pageno">04</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- LOGIN (page 5)
  pages.push(`
<section class="page">
  ${pageHeader(logo, "البداية")}
  <div class="h-chapter">الفصل الثالث</div>
  <h2 class="chapter-title">تسجيل الدخول</h2>
  <p class="chapter-lede">
    بعد ما تنشئ حسابك مرّة واحدة، تدخل بعدها دائماً عبر صفحة تسجيل الدخول.
  </p>

  ${shot(S["login"], "صفحة تسجيل الدخول")}

  <ul class="steps">
    <li>اضغط على <strong>«تسجيل الدخول»</strong> في الصفحة الرئيسية.</li>
    <li>أدخل بريدك الإلكتروني وكلمة السرّ التي أنشأتها.</li>
    <li>اضغط على زرّ <strong>«دخول»</strong>.</li>
  </ul>

  <div class="callout info">
    <span class="ico">ℹ️ ملاحظة:</span>
    الموقع يحفظ جلستك — ما تحتاج تسجّل الدخول في كلّ مرّة من نفس الجهاز.
  </div>

  <div class="pageno">05</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- DASHBOARD
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الواجهة")}
  <div class="h-chapter">الفصل الرابع</div>
  <h2 class="chapter-title">لوحتي — الصفحة الرئيسية</h2>
  <p class="chapter-lede">
    أوّل ما تدخل الموقع بعد التسجيل، تجد <strong>«لوحتي»</strong>. هذه صفحتك
    الشخصية — تختصر لك كلّ شيء في مكان واحد.
  </p>

  ${shot(S["student-dashboard"], "لوحة الطالب — بطاقات الوحدات، الإعلانات، الإنجاز")}

  <h3 class="section-title">ماذا تحتوي اللوحة؟</h3>
  <ul class="bullets">
    <li><strong>ترحيب شخصي:</strong> باسمك، مع ملخّص سريع لمستوى تقدّمك.</li>
    <li><strong>الوحدات:</strong> مجموعة من البطاقات، كلّ بطاقة تمثّل وحدة دراسية — اضغط عليها للدخول.</li>
    <li><strong>الإعلانات المهمّة:</strong> أحدث تنبيهات الأستاذ تظهر في الأعلى.</li>
    <li><strong>نشاطك الأخير:</strong> آخر الاختبارات التي حلّيتها وآخر الملفّات التي فتحتها.</li>
  </ul>

  <div class="pageno">06</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- UNITS
  pages.push(`
<section class="page">
  ${pageHeader(logo, "المحتوى")}
  <div class="h-chapter">الفصل الخامس</div>
  <h2 class="chapter-title">الوحدات الدراسية</h2>
  <p class="chapter-lede">
    كلّ وحدة هي فصل كامل من المنهج — داخلها تجد جميع ملفّاتها، اختباراتها،
    وفيديوهات شرحها منظّمة في تبويبات.
  </p>

  ${shot(S["student-unit"], "صفحة وحدة دراسية — تبويبات بنك الأسئلة، الاختبارات، المراجعة، الفيديوهات")}

  <h3 class="section-title">التبويبات داخل الوحدة</h3>
  <ul class="bullets">
    <li><strong>بنك الأسئلة:</strong> الملزمة الأساسية + حلولها النموذجية.</li>
    <li><strong>الاختبارات:</strong> اختبارات الوحدة السابقة مع حلولها.</li>
    <li><strong>مراجعة:</strong> ملخّصات سريعة قبل الامتحان.</li>
    <li><strong>فيديوهات شرح:</strong> شرح الأستاذ رميح لكل درس — شاهدها داخل الموقع.</li>
  </ul>

  <div class="callout tip">
    <span class="ico">💡 نصيحة:</span>
    ابدأ بالفيديوهات لفهم الدرس، ثم انتقل إلى بنك الأسئلة، ثم الاختبارات لقياس مستواك.
  </div>

  <div class="pageno">07</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- FILES PAGE
  pages.push(`
<section class="page">
  ${pageHeader(logo, "المحتوى")}
  <div class="h-chapter">الفصل السادس</div>
  <h2 class="chapter-title">الملازم والملفّات</h2>
  <p class="chapter-lede">
    صفحة <strong>«الملازم»</strong> تعرض جميع ملفّات الموقع دفعةً واحدة، مع فلاتر
    وبحث قويّ تُساعدك في العثور على ما تريد بسرعة.
  </p>

  ${shot(S["student-files"], "صفحة الملازم — بحث وفلاتر حسب النوع والوحدة")}

  <h3 class="section-title">الأدوات المتاحة</h3>
  <ul class="bullets">
    <li><strong>شريط البحث:</strong> اكتب جزءاً من اسم الملف أو عنوانه ليظهر لك فوراً.</li>
    <li><strong>فلاتر النوع:</strong> اختر بنك أسئلة، اختبارات، مراجعة، أو فيديوهات.</li>
    <li><strong>فلاتر الوحدة:</strong> اعرض ملفّات وحدة معيّنة فقط.</li>
    <li><strong>زرّ «معاينة»:</strong> يفتح الملف داخل الموقع بدون تحميل.</li>
    <li><strong>زرّ «تحميل»:</strong> يحفظ الملف على جهازك.</li>
    <li><strong>أيقونة المحفوظات:</strong> 🔖 احفظ الملف لتجده بسرعة لاحقاً.</li>
  </ul>

  <div class="pageno">08</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- PDF PREVIEW
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الملفات")}
  <div class="h-chapter">الفصل السابع</div>
  <h2 class="chapter-title">معاينة ملفات PDF</h2>
  <p class="chapter-lede">
    عند الضغط على <strong>«معاينة»</strong> لأيّ ملف، تنقلك إلى صفحة مُخصّصة
    تعرض الملف بتصميم مريح — بدون مغادرة الموقع.
  </p>

  ${shot(S["student-preview-page"], "صفحة معاينة ملف PDF بتصميم نظيف")}

  <h3 class="section-title">ماذا تحتوي صفحة المعاينة؟</h3>
  <ul class="bullets">
    <li><strong>عنوان الملف</strong> بخط عريض مع شارة ملوّنة تدلّ على نوعه.</li>
    <li><strong>حجم الملف</strong> وعدد التحميلات.</li>
    <li><strong>إطار مريح</strong> يعرض الملف بنسبة كبيرة — يمكنك التمرير والتكبير داخله.</li>
    <li><strong>زرّ «تحميل»</strong> في الأسفل لحفظ الملف على جهازك.</li>
    <li><strong>زرّ «رجوع إلى الملازم»</strong> للعودة بسرعة.</li>
  </ul>

  <div class="callout info">
    <span class="ico">📱 على الموبايل:</span>
    لو كان جهازك لا يعرض PDF داخل الصفحة، استخدم زرّ <strong>«فتح في تبويب جديد»</strong> الموجود تحت الإطار.
  </div>

  <div class="pageno">09</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- VIDEO PAGE
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الفيديوهات")}
  <div class="h-chapter">الفصل الثامن</div>
  <h2 class="chapter-title">فيديوهات الشرح</h2>
  <p class="chapter-lede">
    فيديوهات الأستاذ رميح الأصلية — مدمجة داخل الموقع، تشاهدها بدون مغادرة
    صفحة الموقع وبدون إعلانات مزعجة.
  </p>

  ${shot(S["student-video-page"], "صفحة مشاهدة الفيديو — عنوان بارز، مشغّل مريح")}

  <h3 class="section-title">طريقة المشاهدة</h3>
  <ul class="steps">
    <li>ادخل إلى أيّ وحدة، ثمّ اختر تبويب <strong>«فيديوهات شرح»</strong>.</li>
    <li>اضغط على زرّ <strong>«مشاهدة»</strong> الأحمر المقابل للدرس.</li>
    <li>سينقلك الموقع إلى صفحة الفيديو المخصّصة — المشغّل مُعدّ للتشغيل مباشرةً.</li>
    <li>اضغط على <strong>«رجوع إلى الملازم»</strong> لإنهاء المشاهدة.</li>
  </ul>

  <div class="callout tip">
    <span class="ico">💡 نصيحة:</span>
    كلّ فيديو عنوانه يبدأ برقم الدرس (مثل <strong>4.1</strong>، <strong>5.2</strong>) ليُطابق نفس رقم الدرس في الكتاب المدرسي — فتعرف مباشرةً أيّ فيديو تحتاج.
  </div>

  <div class="pageno">10</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- QUIZZES
  pages.push(`
<section class="page">
  ${pageHeader(logo, "التفاعل")}
  <div class="h-chapter">الفصل التاسع</div>
  <h2 class="chapter-title">الاختبارات الإلكترونية</h2>
  <p class="chapter-lede">
    اختبارات تُصحَّح فوراً وتعطيك نتيجة فورية مع مراجعة لكل سؤال حلّيته.
  </p>

  ${shot(S["student-quiz-intro"], "صفحة البدء في اختبار وحدة")}

  <h3 class="section-title">كيف تبدأ اختباراً؟</h3>
  <ul class="steps">
    <li>ادخل إلى الوحدة التي تريدها، ثم اضغط على <strong>«ابدأ الاختبار»</strong>.</li>
    <li>ستظهر لك شاشة تمهيد فيها: عدد الأسئلة، مدّة الاختبار، وتعليمات سريعة.</li>
    <li>اضغط <strong>«ابدأ»</strong> — ستبدأ الأسئلة واحداً تلو الآخر.</li>
    <li>لكل سؤال، اختر الإجابة الصحيحة من بين الخيارات الظاهرة.</li>
    <li>اضغط <strong>«التالي»</strong> — يمكنك التنقّل بين الأسئلة والرجوع.</li>
    <li>في آخر سؤال اضغط <strong>«إنهاء وتسليم»</strong> لرؤية نتيجتك.</li>
  </ul>

  <h3 class="section-title">النتيجة والمراجعة</h3>
  <ul class="bullets">
    <li><strong>درجتك النهائية</strong> بالنسبة المئوية والعدد الصحيح.</li>
    <li><strong>مراجعة كل سؤال:</strong> ترى الإجابة الصحيحة مقابل إجابتك.</li>
    <li><strong>الحفظ التلقائي</strong> في <em>سجلّ الاختبارات</em> للرجوع لاحقاً.</li>
  </ul>

  <div class="pageno">11</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- BOOKMARKS
  pages.push(`
<section class="page">
  ${pageHeader(logo, "شخصي")}
  <div class="h-chapter">الفصل العاشر</div>
  <h2 class="chapter-title">المحفوظات</h2>
  <p class="chapter-lede">
    هل هناك ملف أو فيديو تحتاجه بشكل متكرّر؟ احفظه في <strong>«المحفوظات»</strong>
    ليكون على بُعد نقرة واحدة دائماً.
  </p>

  ${shot(S["student-bookmarks"], "صفحة المحفوظات — ملفاتك الشخصية المفضّلة")}

  <h3 class="section-title">كيفية الحفظ</h3>
  <ul class="steps">
    <li>في أيّ بطاقة ملف أو فيديو، ستجد أيقونة <strong>🔖 الحفظ</strong>.</li>
    <li>اضغط عليها — ستتلوّن بلون ذهبي لتؤكّد أنّه أُضيف.</li>
    <li>اضغط عليها مرة ثانية لإزالة الملف من محفوظاتك.</li>
    <li>ادخل إلى صفحة <strong>«المحفوظات»</strong> من شريط التنقّل العلوي لرؤية كلّ ما حفظته.</li>
  </ul>

  <div class="callout tip">
    <span class="ico">💡 نصيحة:</span>
    احفظ ملفّات المراجعة والاختبارات قبل الامتحان — ستجدها في مكان واحد دون البحث.
  </div>

  <div class="pageno">12</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- HISTORY
  pages.push(`
<section class="page">
  ${pageHeader(logo, "شخصي")}
  <div class="h-chapter">الفصل الحادي عشر</div>
  <h2 class="chapter-title">سجلّ الاختبارات</h2>
  <p class="chapter-lede">
    كلّ اختبار تحلّيه يُسجَّل تلقائياً — صفحة السجلّ تعرض لك كلّ نتائجك
    ومدى تطوّرك في كلّ وحدة.
  </p>

  ${shot(S["student-history"], "سجلّ الاختبارات — كل محاولاتك مع درجاتها")}

  <h3 class="section-title">ماذا يُظهر السجلّ؟</h3>
  <ul class="bullets">
    <li><strong>تاريخ كلّ محاولة</strong> وساعة التسليم.</li>
    <li><strong>اسم الوحدة</strong> التي اختبرتَها.</li>
    <li><strong>درجتك</strong> بالنسبة المئوية.</li>
    <li><strong>زرّ «مراجعة»</strong> لترى كلّ سؤال مع إجابتك والإجابة الصحيحة.</li>
  </ul>

  <div class="pageno">13</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- ANNOUNCEMENTS
  pages.push(`
<section class="page">
  ${pageHeader(logo, "تواصل")}
  <div class="h-chapter">الفصل الثاني عشر</div>
  <h2 class="chapter-title">الإعلانات</h2>
  <p class="chapter-lede">
    صفحة <strong>«الإعلانات»</strong> هي مكان الأستاذ لنشر كلّ ما يهمّك — تواريخ
    الامتحانات، ملفّات جديدة، أخبار، وإشعارات عاجلة.
  </p>

  ${shot(S["student-announcements"], "صفحة الإعلانات — مرتبة حسب الأهمّية")}

  <h3 class="section-title">أنواع الإعلانات</h3>
  <ul class="bullets">
    <li><strong>🔵 إعلان عام:</strong> معلومات عامة حول الموقع أو الحصص.</li>
    <li><strong>🟢 خبر سارّ:</strong> ميزة جديدة، محتوى مضاف، أو تهنئة.</li>
    <li><strong>🟡 تنبيه:</strong> موعد امتحان قريب أو موعد تسليم.</li>
    <li><strong>🔴 عاجل:</strong> إشعار هامّ يجب عليك قراءته فوراً.</li>
  </ul>

  <div class="callout info">
    <span class="ico">📌 ملاحظة:</span>
    الإعلانات المُثبّتة تظهر أيضاً في لوحتي الرئيسية ليصعُب تجاهلها.
  </div>

  <div class="pageno">14</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  // --- TIPS CLOSING
  pages.push(`
<section class="page">
  ${pageHeader(logo, "نصائح")}
  <div class="h-chapter">الفصل الأخير</div>
  <h2 class="chapter-title">نصائح للاستخدام الأمثل</h2>

  <ul class="bullets">
    <li><strong>ابدأ بالفيديوهات</strong> قبل حلّ الأسئلة — الشرح أوّلاً يُسهّل الحلّ كثيراً.</li>
    <li><strong>احلّ اختبارات كلّ وحدة</strong> مباشرةً بعد الانتهاء منها، لا تُأجّلها.</li>
    <li><strong>احفظ الملازم المهمّة</strong> في <em>المحفوظات</em> قبل الامتحان.</li>
    <li><strong>راجع سجلّ اختباراتك</strong> — الأسئلة التي أخطأت فيها هي أهمّ ما تُعيد دراسته.</li>
    <li><strong>افتح الإعلانات بانتظام</strong> — التنبيهات العاجلة مهمّة جدّاً.</li>
    <li><strong>استخدم البحث</strong> في صفحة الملازم بدل التصفّح الطويل.</li>
    <li><strong>الموقع يعمل على هاتفك</strong> بنفس جودة الحاسوب — راجع من أيّ مكان.</li>
  </ul>

  <div class="closing">
    <h3>بالتوفيق 🌟</h3>
    <p>
      الموقع صُمّم خصّيصاً لك لتحصل على أعلى درجة ممكنة في امتحان الثانوية.
      استخدمه باستمرار، اسأل أستاذك عند الحاجة، وتذكّر أنّ النجاح ثمرة اجتهاد يومي.
    </p>
    <div class="sig">— الأستاذ إبراهيم رميح</div>
  </div>

  <div class="pageno">15</div>
  <div class="pageno-brand">دليل الطالب</div>
</section>`);

  return wrapHtml("دليل الطالب — رميح في الرياضيات", pages.join("\n"));
}

/* ============================================================
 *  ADMIN GUIDE
 * ============================================================ */
export function renderAdminGuide({ shots: S, logo, adminEmail, adminPassword }: AdminAssets): string {
  const pages: string[] = [];

  // --- COVER
  pages.push(cover({
    logo,
    kicker: "دليل المشرف — النسخة الأولى",
    title: "دليل الأستاذ",
    titleAccent: "لإدارة الموقع",
    tagline: "كلّ ما تحتاج معرفته لإدارة موقعك الإلكتروني: رفع الملفّات، إضافة الفيديوهات، إدارة الاختبارات، نشر الإعلانات، ومتابعة طلّابك.",
    audience: "FOR ADMIN",
  }));

  // --- TOC
  pages.push(`
<section class="page toc">
  ${pageHeader(logo, "المحتوى")}
  <div class="h-chapter">جدول المحتويات</div>
  <h2>دليل إدارة الموقع</h2>
  <ol>
    <li>مقدّمة — ما هي لوحة الإدارة <span class="dots"></span><span>03</span></li>
    <li>بيانات الدخول الخاصّة بك <span class="dots"></span><span>04</span></li>
    <li>لوحة التحكّم الرئيسية <span class="dots"></span><span>05</span></li>
    <li>إدارة الطلّاب <span class="dots"></span><span>06</span></li>
    <li>إدارة الوحدات الدراسية <span class="dots"></span><span>07</span></li>
    <li>إدارة الملفّات ورفعها <span class="dots"></span><span>08</span></li>
    <li>إضافة فيديوهات شرح <span class="dots"></span><span>10</span></li>
    <li>إدارة الاختبارات <span class="dots"></span><span>11</span></li>
    <li>إضافة وتعديل الأسئلة <span class="dots"></span><span>12</span></li>
    <li>إدارة الإعلانات <span class="dots"></span><span>13</span></li>
    <li>نصائح عمليّة <span class="dots"></span><span>14</span></li>
  </ol>
  <div class="pageno">02</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- INTRO
  pages.push(`
<section class="page">
  ${pageHeader(logo, "مقدّمة")}
  <div class="h-chapter">الفصل الأوّل</div>
  <h2 class="chapter-title">مرحباً بك في لوحة الإدارة</h2>
  <p class="chapter-lede">
    لوحة الإدارة هي <strong>عقل الموقع</strong>. منها تتحكّم في كلّ شيء يراه طلّابك:
    الوحدات، الملفّات، الفيديوهات، الاختبارات، والإعلانات. هذه النسخة مُعدّة
    خصّيصاً لك، وهذا الدليل يشرح كلّ ميزة بالصور والخطوات.
  </p>

  <h3 class="section-title">ما يمكنك فعله كمُشرف</h3>
  <ul class="bullets">
    <li><strong>إدارة كاملة للمحتوى:</strong> رفع ملفّات PDF جديدة، حذف، تعديل، نشر.</li>
    <li><strong>إضافة فيديوهات شرح</strong> من يوتيوب مباشرةً بلصق الرابط.</li>
    <li><strong>بناء الاختبارات</strong> بنفسك — إضافة أسئلة برياضيّات مكتوبة بـ KaTeX.</li>
    <li><strong>نشر الإعلانات</strong> التي تظهر فوراً عند كلّ الطلّاب.</li>
    <li><strong>متابعة الطلّاب:</strong> رؤية من سجّل، من حلّ، ومن أخذ أيّ درجة.</li>
    <li><strong>إدارة الوحدات:</strong> إضافة وحدات جديدة أو تعديل القائمة الحالية.</li>
  </ul>

  <div class="callout warn">
    <span class="ico">⚠ تحذير مهمّ:</span>
    كل تغيير تُجريه هنا يظهر مباشرةً عند جميع الطلّاب. تأكّد قبل النشر.
  </div>

  <div class="pageno">03</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- CREDENTIALS
  pages.push(`
<section class="page">
  ${pageHeader(logo, "حسابك")}
  <div class="h-chapter">الفصل الثاني</div>
  <h2 class="chapter-title">بيانات الدخول الخاصّة بك</h2>
  <p class="chapter-lede">
    هذه هي البيانات التي تستخدمها لتسجيل الدخول كمُشرف. احتفظ بها في مكان آمن —
    من لديه هذه البيانات يستطيع الدخول إلى لوحة الإدارة.
  </p>

  <div class="cred-card">
    <div class="label">البريد الإلكتروني</div>
    <div class="value">${adminEmail}</div>

    <div class="label">كلمة السرّ</div>
    <div class="value">${adminPassword}</div>

    <div class="warn-line">
      ⚠ لا تُشارك هذه البيانات مع أيّ شخص. غيّر كلمة السرّ فوراً لو شككت بتسرّبها.
    </div>
  </div>

  <h3 class="section-title">خطوات الدخول</h3>
  <ul class="steps">
    <li>افتح الموقع في المتصفّح واضغط <strong>«تسجيل الدخول»</strong>.</li>
    <li>أدخل البريد وكلمة السرّ الظاهرَين أعلاه.</li>
    <li>بمجرّد الدخول، ستظهر لك <strong>أيقونة لوحة الإدارة</strong> — اضغطها.</li>
    <li>ستنتقل إلى لوحة التحكّم الكاملة.</li>
  </ul>

  <div class="callout tip">
    <span class="ico">🔐 نصيحة أمنية:</span>
    احفظ هذه الصفحة في مكان لا يصل إليه الآخرون. يُفضّل طباعتها وحفظها في ملفّ شخصي.
  </div>

  <div class="pageno">04</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- ADMIN DASHBOARD
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الواجهة")}
  <div class="h-chapter">الفصل الثالث</div>
  <h2 class="chapter-title">لوحة التحكّم الرئيسية</h2>
  <p class="chapter-lede">
    أوّل شاشة تراها بعد الدخول كمُشرف — ملخّص سريع لكلّ ما يجري في موقعك.
  </p>

  ${shot(S["admin-dashboard"], "لوحة التحكّم الرئيسية — إحصائيّات وإجراءات سريعة")}

  <h3 class="section-title">محتوى اللوحة</h3>
  <ul class="bullets">
    <li><strong>إحصائيّات فورية:</strong> عدد الطلّاب المسجّلين، عدد الملفّات، عدد الاختبارات، عدد الإعلانات.</li>
    <li><strong>نشاط اليوم:</strong> من سجّل جديداً ومن حلّ اختباراً في آخر ٢٤ ساعة.</li>
    <li><strong>إجراءات سريعة:</strong> أزرار لرفع ملف، إضافة إعلان، أو إضافة سؤال.</li>
    <li><strong>قائمة جانبية:</strong> تنتقل منها لكلّ أقسام الإدارة.</li>
  </ul>

  <div class="pageno">05</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- STUDENTS
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الطلّاب")}
  <div class="h-chapter">الفصل الرابع</div>
  <h2 class="chapter-title">إدارة الطلّاب</h2>
  <p class="chapter-lede">
    صفحة الطلّاب تعرض لك قائمة بكلّ من سجّل في موقعك، مع معلومات كاملة عن نشاطه.
  </p>

  ${shot(S["admin-students"], "قائمة الطلّاب المسجّلين")}

  <h3 class="section-title">الأعمدة المعروضة</h3>
  <ul class="bullets">
    <li><strong>الاسم:</strong> اسم الطالب كما أدخله عند التسجيل.</li>
    <li><strong>البريد الإلكتروني:</strong> يُستخدم للتواصل معه.</li>
    <li><strong>تاريخ التسجيل:</strong> متى أنشأ حسابه أوّل مرّة.</li>
    <li><strong>آخر نشاط:</strong> متى زار الموقع آخر مرّة.</li>
    <li><strong>عدد الاختبارات المحلولة.</strong></li>
  </ul>

  <div class="callout tip">
    <span class="ico">💡 نصيحة:</span>
    راجع هذه الصفحة مرّة في الأسبوع لرؤية من لم يتفاعل مع الموقع مؤخراً.
  </div>

  <div class="pageno">06</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- UNITS
  pages.push(`
<section class="page">
  ${pageHeader(logo, "المحتوى")}
  <div class="h-chapter">الفصل الخامس</div>
  <h2 class="chapter-title">إدارة الوحدات الدراسية</h2>
  <p class="chapter-lede">
    الوحدات هي الهيكل الأساسي للموقع — كلّ ملف وفيديو واختبار ينتمي لوحدة.
  </p>

  ${shot(S["admin-units"], "قائمة الوحدات الدراسية مع أزرار التعديل")}

  <h3 class="section-title">إضافة وحدة جديدة</h3>
  <ul class="steps">
    <li>اضغط على زرّ <strong>«وحدة جديدة»</strong> في أعلى الصفحة.</li>
    <li>اختر الفصل الدراسي (الأوّل أو الثاني).</li>
    <li>أدخل رقم الوحدة (مثلاً ٤ أو ٥)، اسمها بالعربية، واسمها بالإنجليزية.</li>
    <li>أضف وصفاً مختصراً (اختياري) واختر أيقونة مناسبة.</li>
    <li>حدّد <strong>الترتيب</strong> (رقم أقلّ = يظهر أوّلاً) ثم اضغط <strong>«حفظ»</strong>.</li>
  </ul>

  <h3 class="section-title">تعديل أو إخفاء وحدة</h3>
  <ul class="bullets">
    <li>اضغط على أيقونة ✎ القلم المقابلة لأيّ وحدة لتعديل بياناتها.</li>
    <li>أزِل علامة <strong>«منشور»</strong> لإخفاء الوحدة مؤقّتاً دون حذفها.</li>
    <li>استخدم الإخفاء بدل الحذف — الحذف يُزيل جميع ملفّاتها وأسئلتها.</li>
  </ul>

  <div class="pageno">07</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- FILES MANAGEMENT (page 1)
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الملفّات")}
  <div class="h-chapter">الفصل السادس</div>
  <h2 class="chapter-title">إدارة الملفّات ورفعها</h2>
  <p class="chapter-lede">
    قلب الموقع — هنا ترفع المُلازم، الاختبارات، الحلول، والمراجعات. كلّ ما يُرفع
    يظهر مباشرةً عند الطلّاب.
  </p>

  ${shot(S["admin-files"], "قائمة الملفّات الكاملة — مع فلاتر وإجراءات")}

  <h3 class="section-title">رفع ملف PDF جديد</h3>
  <ul class="steps">
    <li>اضغط على زرّ <strong>«رفع ملف»</strong> في أعلى الصفحة.</li>
    <li>اختر <strong>نوع المحتوى</strong>: بنك أسئلة، حل بنك، اختبار، حل اختبار، مراجعة، أو فيديو.</li>
    <li>اسحب ملف PDF وأفلِته (أو اضغط لاختياره) — الحد الأقصى ٥٠ ميغا.</li>
    <li>أدخل عنواناً واضحاً للملف بالعربية.</li>
    <li>اختر <strong>الوحدة</strong> التي ينتمي لها الملف.</li>
    <li>إذا كان اختباراً، أدخل رقمه (١، ٢، ٣…) للترتيب.</li>
    <li>اضغط <strong>«رفع وحفظ»</strong> — الملف يُرفع مشفّراً على Vercel Blob.</li>
  </ul>

  <div class="callout warn">
    <span class="ico">⚠ انتبه:</span>
    الملفّات تُرفع بالحجم الكامل (حتى ٥٠MB). احرص أن تكون PDF محسّنة قبل الرفع لتوفير الوقت والذاكرة.
  </div>

  <div class="pageno">08</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- FILES (page 2 - types guide)
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الملفّات")}
  <h3 class="section-title">أنواع المحتوى وأماكن ظهورها</h3>
  <p class="body">كلّ نوع يظهر في <strong>تبويب مختلف</strong> للطالب. اختيار النوع الصحيح مهم جداً.</p>

  <ul class="bullets">
    <li><strong>بنك الأسئلة:</strong> الملزمة الرئيسية للوحدة → تبويب «بنك الأسئلة».</li>
    <li><strong>حل بنك الأسئلة:</strong> الحل النموذجي → نفس التبويب بلون أخضر.</li>
    <li><strong>الاختبارات:</strong> نماذج اختبارات سابقة → تبويب «الاختبارات».</li>
    <li><strong>حل الاختبارات:</strong> إجاباتها النموذجية → نفس التبويب بلون بنفسجي.</li>
    <li><strong>مراجعة:</strong> ملخّصات سريعة → تبويب «مراجعة».</li>
    <li><strong>فيديوهات شرح:</strong> فيديو يوتيوب → تبويب «فيديوهات شرح».</li>
  </ul>

  <h3 class="section-title">تعديل أو حذف ملف موجود</h3>
  <ul class="bullets">
    <li>اضغط على أيقونة ✎ لتعديل العنوان، النوع، أو الوحدة.</li>
    <li>اضغط على أيقونة 🗑 للحذف — <strong>الحذف نهائي ولا يمكن التراجع عنه</strong>.</li>
    <li>لإخفاء ملف مؤقّتاً دون حذفه، أزِل علامة <strong>«منشور»</strong>.</li>
  </ul>

  <div class="callout tip">
    <span class="ico">💡 نصيحة:</span>
    استخدم مربّع البحث في أعلى الصفحة لإيجاد ملف معيّن بسرعة بدلاً من التمرير.
  </div>

  <div class="pageno">09</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- ADD VIDEO
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الفيديوهات")}
  <div class="h-chapter">الفصل السابع</div>
  <h2 class="chapter-title">إضافة فيديو شرح من يوتيوب</h2>
  <p class="chapter-lede">
    إضافة الفيديوهات بسيطة جداً — لا تحتاج رفع ملفّات، فقط لصق رابط يوتيوب.
    الموقع يستخرج معرّف الفيديو تلقائياً ويعرضه بنسخة بدون إعلانات.
  </p>

  <h3 class="section-title">الخطوات</h3>
  <ul class="steps">
    <li>من صفحة الملفّات، اضغط <strong>«رفع ملف»</strong>.</li>
    <li>من القائمة، اختر نوع المحتوى: <strong>«فيديوهات شرح»</strong>.</li>
    <li>ستتبدّل الواجهة — ستختفي خانة الملف وتظهر <strong>خانة رابط يوتيوب</strong>.</li>
    <li>الصق رابط الفيديو بأيّ صيغة (يدعم: <code>youtube.com/watch?v=...</code>، <code>youtu.be/...</code>، <code>/shorts/...</code>).</li>
    <li>أدخل عنوان الفيديو بصيغة <strong>«X.Y — اسم الدرس»</strong> (مثلاً: <em>4.1 — التكامل غير المحدود</em>).</li>
    <li>اختر الوحدة المناسبة.</li>
    <li>اضغط <strong>«حفظ الفيديو»</strong> — يظهر فوراً تحت تبويب «فيديوهات شرح» في الوحدة.</li>
  </ul>

  <div class="callout tip">
    <span class="ico">💡 صيغة العنوان الموحّدة:</span>
    التزم بصيغة <strong>رقم الدرس — اسم الدرس</strong> (مثلاً <em>5.3 — المساحة بين منحنيين</em>) ليسهل على الطالب مطابقة الفيديو بالكتاب المدرسي.
  </div>

  <div class="callout info">
    <span class="ico">ℹ ملاحظة تقنيّة:</span>
    الموقع يستخدم <strong>youtube-nocookie</strong> لعرض الفيديوهات — لا إعلانات تشغيل تلقائية ولا تتبّع للطالب.
  </div>

  <div class="pageno">10</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- QUIZZES
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الاختبارات")}
  <div class="h-chapter">الفصل الثامن</div>
  <h2 class="chapter-title">إدارة الاختبارات</h2>
  <p class="chapter-lede">
    الاختبارات التفاعلية من أقوى ميزات الموقع. تضع الأسئلة مرّة واحدة،
    ويحلّها الطلّاب لعدد غير محدود من المرّات مع تصحيح فوري.
  </p>

  ${shot(S["admin-quizzes"], "قائمة الاختبارات مقسّمة حسب الوحدة")}

  <h3 class="section-title">البنية العامة</h3>
  <ul class="bullets">
    <li>كلّ <strong>وحدة</strong> لها اختبار واحد مفتوح للطلّاب.</li>
    <li>عند الدخول لوحدة معيّنة، ترى قائمة كلّ أسئلتها.</li>
    <li>تستطيع إضافة، تعديل، أو حذف أيّ سؤال في أيّ وقت.</li>
    <li>كلّ طالب يحلّ اختبار كلّ وحدة بشكل مستقل.</li>
  </ul>

  ${shot(S["admin-quiz-unit"], "شاشة إدارة أسئلة وحدة — قائمة الأسئلة الحالية")}

  <div class="pageno">11</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- QUESTIONS
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الاختبارات")}
  <div class="h-chapter">الفصل التاسع</div>
  <h2 class="chapter-title">إضافة وتعديل الأسئلة</h2>
  <p class="chapter-lede">
    الموقع يدعم كتابة الأسئلة بـ <strong>الرياضيات الكاملة</strong> عبر KaTeX —
    كلّ ما تكتبه بين علامتي <code>$...$</code> يُعرض كصيغة رياضيّة منسّقة.
  </p>

  <h3 class="section-title">إضافة سؤال جديد</h3>
  <ul class="steps">
    <li>ادخل لوحدة، ثم اضغط <strong>«إضافة سؤال»</strong>.</li>
    <li>اكتب نصّ السؤال — استخدم <code>$\\int_0^1 x^2\\,dx$</code> لأيّ رياضيات.</li>
    <li>استخدم <strong>شريط الرياضيات</strong> الأصفر تحت نصّ السؤال لإضافة الكسور، التكاملات، الجذور... بنقرة واحدة.</li>
    <li>ستظهر <strong>معاينة حيّة</strong> للسؤال — تراه كما يراه الطالب.</li>
    <li>أدخل ٤ خيارات افتراضيّاً (يمكن إضافة حتى ٦).</li>
    <li>حدّد الإجابة الصحيحة بوضع علامة ● في الزرّ الدائري المقابل لها.</li>
    <li>اختر مستوى <strong>الصعوبة</strong> (سهل / متوسّط / صعب).</li>
    <li>اختياريّاً: رمز الدرس ورقم السؤال في الملف الأصلي.</li>
    <li>اضغط <strong>«حفظ»</strong>.</li>
  </ul>

  <div class="callout tip">
    <span class="ico">🔢 صيغ رياضيّة شائعة:</span>
    <br/>• كسر: <code>$\\frac{a}{b}$</code>
    <br/>• تكامل: <code>$\\int_0^1 x\\,dx$</code>
    <br/>• جذر: <code>$\\sqrt{x^2+1}$</code>
    <br/>• أُسّ: <code>$x^{2}$</code>
    <br/>• متّجه: <code>$\\vec{v}$</code>
  </div>

  <div class="pageno">12</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- ANNOUNCEMENTS ADMIN
  pages.push(`
<section class="page">
  ${pageHeader(logo, "الإعلانات")}
  <div class="h-chapter">الفصل العاشر</div>
  <h2 class="chapter-title">إدارة الإعلانات</h2>
  <p class="chapter-lede">
    الإعلانات هي أسرع طريقة للتواصل مع كلّ طلّابك دفعةً واحدة. اكتب الإعلان
    مرّة، وتراه آلاف الأعين فوراً.
  </p>

  ${shot(S["admin-announcements"], "صفحة إدارة الإعلانات")}

  <h3 class="section-title">نشر إعلان جديد</h3>
  <ul class="steps">
    <li>اضغط <strong>«إعلان جديد»</strong>.</li>
    <li>اكتب عنواناً قصيراً وواضحاً.</li>
    <li>اكتب النصّ — يمكنك استخدام عدّة فقرات.</li>
    <li>اختر مستوى <strong>الأهمّية</strong>:
      <br/>• <em>إعلان عامّ (أزرق)</em> — معلومة عامة.
      <br/>• <em>خبر سارّ (أخضر)</em> — محتوى جديد أو تهنئة.
      <br/>• <em>تنبيه (أصفر)</em> — موعد أو مهمّة قريبة.
      <br/>• <em>عاجل (أحمر)</em> — أمر يجب على الطالب قراءته فوراً.</li>
    <li>فعّل <strong>«مثبّت في الصفحة الرئيسية»</strong> لإظهار الإعلان في لوحتي لكلّ طالب.</li>
    <li>اضغط <strong>«حفظ»</strong> — الإعلان يُعلَن مباشرةً.</li>
  </ul>

  <div class="callout warn">
    <span class="ico">⚠ انتبه:</span>
    «عاجل» استخدمه بحذر — كثرته تُضعف أثره. احفظه للأمور الحقيقيّة المهمّة.
  </div>

  <div class="pageno">13</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  // --- TIPS & CLOSING
  pages.push(`
<section class="page">
  ${pageHeader(logo, "خلاصة")}
  <div class="h-chapter">الفصل الأخير</div>
  <h2 class="chapter-title">نصائح عمليّة للاستخدام</h2>

  <h3 class="section-title">أفضل الممارسات</h3>
  <ul class="bullets">
    <li><strong>رتّب الأسماء:</strong> التزم بصيغة موحّدة للعناوين ("4.1 — التكامل"، "اختبار الوحدة 5 (1)") ليسهل على الطلّاب التنقّل.</li>
    <li><strong>أخفِ بدل الحذف:</strong> استخدم خيار «غير منشور» عند الشكّ — يمكنك إعادته لاحقاً.</li>
    <li><strong>اختبر من حساب طالب:</strong> سجّل حساباً تجريبياً لرؤية الموقع بعيني الطالب قبل إعلان ميزة جديدة.</li>
    <li><strong>راجع الإحصائيّات أسبوعياً:</strong> عدد التحميلات لكلّ ملف يُخبرك بالمحتوى الأكثر أهمّية.</li>
    <li><strong>حافظ على النسخ الاحتياطية:</strong> احفظ جميع ملفّات PDF على حاسوبك محلّياً — كنسخة احتياطيّة.</li>
    <li><strong>استخدم صيغة موحّدة للفيديوهات:</strong> <em>X.Y — اسم الدرس</em> — تُسهّل البحث والمطابقة مع الكتاب.</li>
  </ul>

  <h3 class="section-title">عند الحاجة للمساعدة</h3>
  <ul class="bullets">
    <li>الموقع مُصمَّم ليكون <strong>بدون صيانة يومية</strong> — يعمل تلقائياً.</li>
    <li>لو واجهت خطأً أو أردت إضافة ميزة، تواصل مع من بنى الموقع.</li>
    <li>قواعد البيانات والملفّات محفوظة في السحابة بأمان.</li>
  </ul>

  <div class="closing">
    <h3>موقعك جاهز 🎯</h3>
    <p>
      الموقع بين يديك — مصنوع بعناية ليكون سهلاً عليك، مفيداً لطلّابك،
      ومحدّثاً دائماً. استخدمه بثقة، وساهم في رفع مستوى تعليم الرياضيات في قطر.
    </p>
    <div class="sig">— Romi7 · منصّة رميح التعليمية</div>
  </div>

  <div class="pageno">14</div>
  <div class="pageno-brand">دليل الأستاذ</div>
</section>`);

  return wrapHtml("دليل الأستاذ — إدارة موقع رميح", pages.join("\n"));
}

/* ============================================================
 *  WRAPPER
 * ============================================================ */
function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>${sharedCss}</style>
</head>
<body>
${body}
</body>
</html>`;
}
