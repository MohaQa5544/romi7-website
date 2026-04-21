# ROMI7 — Arabic Math Study Platform

## Build Prompt for Claude Code

---

## 1. PROJECT OVERVIEW

You are building a production-ready, professional **Arabic math study platform** for **Mr. Ibrahim Romih (Romi7)**, a math teacher in Qatar who prepares Grade 12 students for the Qatari national curriculum (Scientific & Technological track — المسار العلمي والتكنولوجي).

The site will host his PDF study papers (question banks, answer keys, and mini-exams), let students take interactive quizzes built from questions in those PDFs, and give him an admin dashboard to manage everything.

**The UI is Arabic, RTL, with modern professional design.** The code comments and variable names are in English.

**Live URL (for now):** free Vercel subdomain (e.g. `romi7.vercel.app`). A custom domain may be added later — make all configuration domain-agnostic.

---

## 2. BRAND IDENTITY

Mr. Romih already has a strong brand called **Romi7** (ROMIH IN MATHS). Match it exactly.

### Logo
- User will place their logo file at `/public/logo.png` (circular badge: navy background, red "7" with checkmark, gold stars, "ROMIH IN MATHS" ring text).
- Also create `/public/logo-transparent.png` placeholder and `/public/favicon.ico` generated from the logo.
- Logo appears: top-right of header (RTL), login/signup page hero, footer, PDF cover pages, PWA icon.

### Color Palette
Use exactly these colors as CSS variables in `globals.css`:

```css
:root {
  /* Primary navy — from the PDF cover */
  --romi-navy: #0A1A4A;
  --romi-navy-light: #152258;
  --romi-navy-dark: #050E2E;

  /* Signature gold/yellow accent */
  --romi-gold: #F5C518;
  --romi-gold-light: #FFD84D;
  --romi-gold-dark: #D4A500;

  /* Red (from the checkmark) — use sparingly */
  --romi-red: #E63946;

  /* Surfaces */
  --surface-0: #FFFFFF;
  --surface-1: #F7F8FB;
  --surface-2: #EEF1F7;

  /* Text */
  --text-primary: #0A1A4A;
  --text-secondary: #4A5578;
  --text-muted: #8892B0;

  /* Semantic */
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;

  /* Borders */
  --border-subtle: rgba(10, 26, 74, 0.08);
  --border-default: rgba(10, 26, 74, 0.15);
}

.dark {
  --surface-0: #050E2E;
  --surface-1: #0A1A4A;
  --surface-2: #152258;
  --text-primary: #F0F3FA;
  --text-secondary: #BCC5DC;
  --text-muted: #7A84A0;
  --border-subtle: rgba(245, 197, 24, 0.08);
  --border-default: rgba(245, 197, 24, 0.18);
}
```

### Typography (Arabic)
Load these fonts via `next/font/google`:

- **Display / Headings:** `Readex Pro` (weights 400, 500, 600, 700) — modern, geometric, feels premium
- **Body:** `IBM Plex Sans Arabic` (weights 400, 500, 600) — highly readable
- **Secondary option:** `Cairo` — fallback

Latin text (English math symbols, numbers) should use `Inter` for cleanliness.

Math equations rendered via **KaTeX** — load `katex/dist/katex.min.css`.

### Design Principles
- **Professional & academic**, not childish. Students are 17–18 years old.
- Generous whitespace, clear hierarchy, rounded corners (0.75rem default), soft shadows
- Subtle motion (framer-motion) on hover/page transitions — never bouncy or distracting
- Every card has a slight accent (thin gold top border, or gold icon)
- The navy + gold combination should feel like a luxury academic institution, not a bootcamp

---

## 3. TECH STACK (NON-NEGOTIABLE)

Use exactly these technologies:

| Layer | Choice |
|---|---|
| Framework | **Next.js 15** (App Router, TypeScript, Server Actions) |
| Styling | **Tailwind CSS v4** + CSS variables |
| UI primitives | **shadcn/ui** (initialize with `npx shadcn@latest init`) |
| Icons | **Lucide React** |
| Database | **Turso (libSQL)** |
| ORM | **Drizzle ORM** with `drizzle-kit` |
| Auth | **Auth.js v5** (NextAuth) with Credentials provider |
| Password hashing | **bcryptjs** |
| File storage (admin uploads) | **Vercel Blob** |
| Initial PDFs | Committed to `/public/pdfs/` in the repo |
| Math rendering | **KaTeX** via `react-katex` |
| Animations | **framer-motion** |
| Forms | **react-hook-form** + **zod** |
| Toasts | **sonner** |
| Charts (analytics) | **Recharts** |
| PWA | **next-pwa** (or `@ducanh2912/next-pwa`) |
| Deployment | **Vercel** |
| Version control | **GitHub** |

---

## 4. PROJECT STRUCTURE

Create this exact folder structure:

```
/
├── public/
│   ├── logo.png
│   ├── logo-transparent.png
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── manifest.json
│   └── pdfs/
│       └── semester-2/
│           ├── unit-4-integration/
│           │   ├── main.pdf
│           │   ├── answers.pdf
│           │   ├── exam-1.pdf
│           │   ├── exam-2.pdf
│           │   ├── exam-3.pdf
│           │   ├── exam-4.pdf
│           │   ├── exam-5.pdf
│           │   ├── exam-1-solution.pdf
│           │   └── update-04.pdf
│           ├── unit-5-integration-applications/
│           │   ├── main.pdf
│           │   └── answers.pdf
│           ├── unit-6-vectors/
│           │   ├── main.pdf
│           │   └── answers.pdf
│           └── unit-7-complex-numbers/
│               └── main.pdf
│
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                 # Landing/home
│   │   │   ├── about/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (student)/
│   │   │   ├── dashboard/page.tsx       # Student home after login
│   │   │   ├── semester/[id]/page.tsx
│   │   │   ├── unit/[id]/page.tsx
│   │   │   ├── quiz/[unitId]/page.tsx
│   │   │   ├── quiz/[unitId]/results/[attemptId]/page.tsx
│   │   │   ├── bookmarks/page.tsx
│   │   │   ├── history/page.tsx         # Quiz history
│   │   │   ├── announcements/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── layout.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx                 # Dashboard overview
│   │   │   ├── analytics/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   ├── units/page.tsx
│   │   │   ├── units/[id]/page.tsx
│   │   │   ├── files/page.tsx           # PDF management
│   │   │   ├── quizzes/page.tsx
│   │   │   ├── quizzes/[unitId]/page.tsx
│   │   │   ├── announcements/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── upload/route.ts          # PDF upload → Vercel Blob
│   │   │   ├── download/[fileId]/route.ts  # Track download + serve
│   │   │   └── analytics/track/route.ts
│   │   ├── layout.tsx                    # Root layout (fonts, dir="rtl", lang="ar")
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn primitives
│   │   ├── brand/
│   │   │   ├── Logo.tsx
│   │   │   ├── LogoMark.tsx
│   │   │   └── BrandHeader.tsx
│   │   ├── layout/
│   │   │   ├── SiteHeader.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   ├── SidebarNav.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── RecentlyAdded.tsx
│   │   │   └── AnnouncementBanner.tsx
│   │   ├── units/
│   │   │   ├── UnitCard.tsx
│   │   │   ├── FileCard.tsx
│   │   │   ├── FileTypeBadge.tsx
│   │   │   └── PdfViewer.tsx
│   │   ├── quiz/
│   │   │   ├── QuizRunner.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── OptionButton.tsx
│   │   │   ├── QuizProgress.tsx
│   │   │   ├── QuizResults.tsx
│   │   │   └── MathRenderer.tsx
│   │   ├── admin/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── AnalyticsChart.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   ├── UnitEditor.tsx
│   │   │   ├── QuestionEditor.tsx
│   │   │   ├── AnnouncementEditor.tsx
│   │   │   └── StudentsTable.tsx
│   │   └── common/
│   │       ├── SearchBar.tsx
│   │       ├── BookmarkButton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── LoadingState.tsx
│   │       └── SocialLinks.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts                # Drizzle schema
│   │   │   ├── index.ts                 # DB client
│   │   │   └── seed.ts                  # Seed script
│   │   ├── auth/
│   │   │   ├── config.ts                # Auth.js config
│   │   │   └── utils.ts
│   │   ├── storage/
│   │   │   └── blob.ts                  # Vercel Blob helpers
│   │   ├── analytics/
│   │   │   └── track.ts
│   │   ├── fonts.ts
│   │   ├── constants.ts                 # Site config, social links
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useBookmarks.ts
│   │   └── useQuiz.ts
│   │
│   └── types/
│       └── index.ts
│
├── drizzle.config.ts
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── .env.local.example
└── README.md
```

---

## 5. DATABASE SCHEMA (Drizzle + Turso)

Create `src/lib/db/schema.ts`:

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

// USERS
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['student', 'admin'] }).notNull().default('student'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  lastActiveAt: integer('last_active_at', { mode: 'timestamp' }),
});

// SEMESTERS
export const semesters = sqliteTable('semesters', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  nameAr: text('name_ar').notNull(),   // "الفصل الدراسي الثاني"
  nameEn: text('name_en').notNull(),   // "Semester 2"
  order: integer('order').notNull(),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
});

// UNITS
export const units = sqliteTable('units', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  semesterId: text('semester_id').notNull().references(() => semesters.id),
  number: integer('number').notNull(),  // 4, 5, 6, 7
  nameAr: text('name_ar').notNull(),    // "التكامل", "المتجهات", etc.
  nameEn: text('name_en').notNull(),
  description: text('description'),
  iconKey: text('icon_key'),            // e.g. "integral", "vector", "complex"
  colorHint: text('color_hint'),        // Optional accent color per unit
  order: integer('order').notNull(),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// FILES (PDFs)
export const files = sqliteTable('files', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  unitId: text('unit_id').notNull().references(() => units.id),
  titleAr: text('title_ar').notNull(),
  type: text('type', {
    enum: ['question_bank', 'answer_key', 'exam', 'exam_solution', 'summary', 'update', 'other']
  }).notNull(),
  examNumber: integer('exam_number'),   // For exam type: 1, 2, 3, 4, 5
  source: text('source', { enum: ['repo', 'blob'] }).notNull(),
  path: text('path').notNull(),         // repo: "/pdfs/semester-2/unit-4/main.pdf"; blob: full URL
  sizeBytes: integer('size_bytes'),
  downloadCount: integer('download_count').notNull().default(0),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  uploadedBy: text('uploaded_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// QUESTIONS (for quizzes)
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  unitId: text('unit_id').notNull().references(() => units.id),
  lessonCode: text('lesson_code'),       // e.g. "6.1", "6.2"
  questionText: text('question_text').notNull(),    // Arabic + LaTeX math allowed
  questionImage: text('question_image'),            // Optional image URL for diagram questions
  difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }).default('medium'),
  sourceFileId: text('source_file_id').references(() => files.id),
  sourceQuestionNumber: integer('source_question_number'),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// QUESTION OPTIONS
export const questionOptions = sqliteTable('question_options', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  optionText: text('option_text').notNull(),        // Arabic + LaTeX allowed
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
  order: integer('order').notNull(),                // 0, 1, 2, 3
});

// QUIZ ATTEMPTS
export const quizAttempts = sqliteTable('quiz_attempts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  unitId: text('unit_id').notNull().references(() => units.id),
  questionCount: integer('question_count').notNull(),
  correctCount: integer('correct_count').notNull().default(0),
  scorePercent: real('score_percent'),
  timeSpentSeconds: integer('time_spent_seconds'),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// QUIZ ANSWERS (one row per question per attempt)
export const quizAnswers = sqliteTable('quiz_answers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  attemptId: text('attempt_id').notNull().references(() => quizAttempts.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => questions.id),
  selectedOptionId: text('selected_option_id').references(() => questionOptions.id),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
  answeredAt: integer('answered_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// BOOKMARKS
export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileId: text('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ANNOUNCEMENTS
export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  titleAr: text('title_ar').notNull(),
  bodyAr: text('body_ar').notNull(),
  severity: text('severity', { enum: ['info', 'success', 'warning', 'urgent'] }).notNull().default('info'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});

// ACTIVITY LOG (for analytics)
export const activityLog = sqliteTable('activity_log', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id),
  eventType: text('event_type', {
    enum: ['login', 'signup', 'file_download', 'quiz_start', 'quiz_complete', 'bookmark_add', 'page_view']
  }).notNull(),
  entityId: text('entity_id'),           // File/Unit/Quiz ID related to the event
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
```

Run `drizzle-kit push` after schema is written.

---

## 6. SEED DATA

Create `src/lib/db/seed.ts` that seeds:

1. **Admin user**: name "Ibrahim Romih", email from env `ADMIN_EMAIL`, password from env `ADMIN_PASSWORD`, role `admin`
2. **Semester 2** (published): nameAr "الفصل الدراسي الثاني", nameEn "Semester 2"
3. Also insert a placeholder **Semester 1** (unpublished) for future expansion
4. **Units** under Semester 2:
   - Unit 4: "التكامل" / "Integration", iconKey: `integral`
   - Unit 5: "تطبيقات التكامل" / "Applications of Integration", iconKey: `integral-app`
   - Unit 6: "المتجهات" / "Vectors", iconKey: `vector`
   - Unit 7: "الأعداد المركبة" / "Complex Numbers", iconKey: `complex`
5. **Files** — register the PDFs already in `/public/pdfs/semester-2/...` (source: `repo`) with correct titles:
   - Unit 4: main "التكامل - الوحدة الرابعة", answers "حل الوحدة الرابعة", 5 exams "اختبار التكامل (1) ... (5)", exam solutions "حل اختبار التكامل (1) ... (5)", update "تحديث 04"
   - Unit 5: main "تطبيقات التكامل", answers "نموذج إجابة تطبيقات التكامل"
   - Unit 6: main "المتجهات", answers "نموذج إجابة المتجهات"
   - Unit 7: main "الأعداد المركبة"
6. **Sample announcement**: "مرحباً بكم في منصة رميح للرياضيات" / severity `info`, pinned.

Run seed via `npm run db:seed`.

---

## 7. PAGES & ROUTES (detail)

### 7.1 Public marketing pages

**`/` (home)**
- Full-bleed hero section: navy gradient background, logo top-center, main headline "الرياضيات للثانوية العامة" in huge Readex Pro bold, subheading "المسار العلمي والتكنولوجي — سلسلة رميح"
- Two CTAs: "تسجيل الدخول" (primary gold) + "إنشاء حساب" (outline)
- Features grid (3 cards): PDFs مُنظَّمة, اختبارات تفاعلية, متابعة التقدم
- "المضاف مؤخراً" section (if logged out, show 3 most recent files with a "سجّل الدخول للوصول" overlay)
- Teacher bio snippet with logo, name, Telegram + WhatsApp buttons
- Footer with socials, copyright, credits

**`/about`**
- About Mr. Romih, his approach, his students
- Big logo, biographical paragraph (placeholder text: admin can edit later via settings if time permits — otherwise hardcode)
- Socials

### 7.2 Auth pages

**`/login`**
- Split layout: left side navy with logo + motivational Arabic quote; right side white form
- Form: email, password. "تذكرني" checkbox. "نسيت كلمة المرور؟" link (placeholder — not functional yet)
- Sign up link at bottom

**`/signup`**
- Same split layout
- Form: الاسم الكامل, البريد الإلكتروني, كلمة المرور (min 8 chars), تأكيد كلمة المرور
- Client-side validation via zod + react-hook-form, Arabic error messages
- On success, auto-log in and redirect to `/dashboard`

### 7.3 Student pages

**`/dashboard` (student home)**
- Top: welcome banner "أهلاً، {name} 👋" (no emoji if you can't ensure it renders well), current date in Hijri + Gregorian
- Pinned announcement banner if any
- Quick stats: total papers available, papers bookmarked, quizzes completed, average score
- "الوحدات الدراسية" grid (4 unit cards with nice icons)
- "المضاف مؤخراً" carousel (last 5 files)
- "متابعة تعلّمك" — resume last quiz / continue last viewed unit

**`/semester/[id]`**
- List of units with completion progress, file counts, quiz availability

**`/unit/[id]`**
- Header with unit name, description, hero icon
- Tabs: "الأوراق" (papers) | "الاختبارات" (mini-exams) | "إجابات" (answer keys) | "اختبار تفاعلي" (interactive quiz)
- Each tab lists relevant files with type badge, size, download count, bookmark button, "معاينة" (preview inline) and "تحميل" (download) buttons
- Floating action: "ابدأ اختبار سريع" starts a quiz for this unit

**`/quiz/[unitId]`**
- Quiz runner: one question at a time, smooth slide transitions
- Progress bar at top, question counter "سؤال 3 من 15"
- Question rendered with KaTeX for math
- 4 option buttons, large, tappable on mobile
- "السابق" / "التالي" buttons
- Timer (optional, default 20 min for 15 questions — can be disabled in settings)
- On finish → results page

**`/quiz/[unitId]/results/[attemptId]`**
- Big score circle (percentage), green/yellow/red
- Breakdown by question — which correct, which wrong, correct answer highlighted
- "إعادة المحاولة" + "العودة للوحدة"
- If score > 80%: subtle celebratory animation (confetti from top, brief)

**`/bookmarks`** — grid of bookmarked files
**`/history`** — list of quiz attempts with scores and dates
**`/announcements`** — full announcement feed
**`/profile`** — user can edit name, change password, see stats, toggle dark mode, toggle quiz timer default

### 7.4 Admin pages

**`/admin`** (dashboard overview)
- 4 stat cards: عدد الطلاب, تحميلات اليوم, اختبارات أُنجزت, متوسط النتيجة
- Activity chart (last 30 days, logins + downloads + quiz completions)
- "أحدث النشاطات" table
- Quick actions: رفع ملف, إضافة إعلان

**`/admin/analytics`**
- Detailed charts: active users over time, top-downloaded files, quiz performance by unit, common wrong answers (helpful for teaching!)
- Date range filter

**`/admin/students`**
- Searchable/sortable table: name, email, signup date, last active, quizzes taken, avg score
- Row actions: view profile, reset password, suspend account

**`/admin/units`**
- List of units with inline edit (name, description, publish toggle, order)
- "إضافة وحدة جديدة" button
- Per unit: count of files, count of questions

**`/admin/units/[id]`**
- Edit unit details, reorder files, bulk publish/unpublish

**`/admin/files`**
- Searchable table of all files
- Actions: edit title/type, publish/unpublish, replace, delete
- "رفع ملف جديد" — modal with drag-drop upload to Vercel Blob, pick unit, pick type, set title

**`/admin/quizzes/[unitId]`**
- List all questions for the unit
- Inline editor: question text (with LaTeX support preview), 4 options, mark correct one, difficulty, publish toggle
- "إضافة سؤال" + bulk import (JSON paste — see §10)

**`/admin/announcements`**
- Timeline of announcements, quick toggle publish/pin, edit/delete
- Rich editor (simple — just bold/italic/links, no complex toolbar)

**`/admin/settings`**
- Site settings (phone number, telegram link, about text)
- Admin profile
- Dangerous actions (re-seed, clear activity log >1 year old)

---

## 8. AUTHENTICATION

Use **Auth.js v5 (beta)** with Credentials provider and JWT sessions.

- `/api/auth/[...nextauth]/route.ts` configures the handler
- `src/lib/auth/config.ts` exports `auth`, `signIn`, `signOut`, `handlers`
- Validate email/password against `users` table, compare with `bcrypt`
- Session includes `id`, `name`, `email`, `role`
- Middleware (`middleware.ts` in root of src) protects `/dashboard/*`, `/unit/*`, `/quiz/*`, `/bookmarks`, `/history`, `/announcements`, `/profile` for authenticated users and `/admin/*` for role === `'admin'`
- Unauthenticated redirect → `/login?callbackUrl=...`
- Admin-role check server-side on every admin page and API route

Sign-up flow:
1. Validate input (zod) — email regex, password ≥ 8 chars, name ≥ 2 chars
2. Check if email exists → return Arabic error "هذا البريد مسجّل بالفعل"
3. Hash password with bcrypt (12 rounds)
4. Insert user with role `student`
5. Auto sign-in and redirect to `/dashboard`
6. Log `signup` event to `activityLog`

---

## 9. PDF MANAGEMENT (Hybrid Storage)

### Strategy
- PDFs already in `/public/pdfs/` are served directly by Vercel's CDN at URL `/pdfs/semester-2/unit-4/main.pdf`
- New uploads via admin dashboard go to Vercel Blob
- Database `files` table has `source` column: `'repo'` or `'blob'`; `path` holds either the public path or full Blob URL
- Helper function `getFileUrl(file)` returns the right URL

### Download Tracking
- Replace direct `<a href="...">` with a server route `/api/download/[fileId]`
- The route: increments `downloadCount`, logs `file_download` to `activityLog`, then redirects to actual URL
- Client-side shows a small toast "جاري التحميل..." then redirect opens in new tab

### PDF Preview
- Use native browser PDF viewer via `<object>` or `<iframe>` (no heavy PDF.js needed unless you want annotations)
- Mobile: open in new tab instead of inline iframe

---

## 10. QUIZ SYSTEM

### Question Storage
Every question has Arabic text (possibly with LaTeX math between `$...$` delimiters), optional image URL, and exactly 4 options with one marked correct.

### Question Extraction (initial seed)
During Phase 5 (see §16), you (Claude Code) will read through the multiple-choice sections of each unit's PDF and extract questions into a JSON file at `src/lib/db/seed-questions.json`. The structure:

```json
{
  "unitNumber": 6,
  "questions": [
    {
      "lessonCode": "6.1",
      "questionText": "ليكن $R(2, -3)$ و $S(1, 2)$. أكتب المتجه $\\vec{RS}$ في الصورة التركيبية.",
      "difficulty": "easy",
      "sourceQuestionNumber": 1,
      "options": [
        { "text": "$\\langle 3, -5 \\rangle$", "isCorrect": false },
        { "text": "$\\langle 3, 1 \\rangle$", "isCorrect": false },
        { "text": "$\\langle -1, -5 \\rangle$", "isCorrect": true },
        { "text": "$\\langle -1, 5 \\rangle$", "isCorrect": false }
      ]
    }
  ]
}
```

**IMPORTANT: Extract questions ONLY from the provided PDFs. Do NOT invent new questions.** For correct answers, compute them yourself mathematically (since the MCQs don't mark which is correct) — if uncertain, mark `"isCorrect": false` on all four and leave a comment `"needsReview": true` in the JSON so Mr. Romih can fix it in admin panel later.

Support `needsReview` field so admin UI can filter "questions needing answer verification" prominently.

### Quiz Generation
- Random selection: pull 10–15 published questions from the unit, balanced by difficulty
- Shuffle question order AND option order per attempt
- Store the exact shuffled sequence in `quizAttempts.metadata` so results page shows same order

### Math Rendering
- Use `react-katex` (`InlineMath`, `BlockMath`)
- Wrap with `MathRenderer` component that parses `$...$` and `$$...$$` delimiters
- All question text, option text, and result explanations support KaTeX

### Interactive Test Randomization
To satisfy Mr. Romih's "different test forms so students get random tests" — the quiz system already randomizes on every attempt. No separate "test forms" needed; every attempt is a fresh randomized subset.

---

## 11. ANALYTICS

### What to track
Every significant student action writes a row to `activityLog`:
- `login` / `signup`
- `file_download` (with fileId)
- `quiz_start` / `quiz_complete` (with unitId, score)
- `bookmark_add`
- `page_view` (only for unit pages, to see popularity — not every navigation)

### Dashboard visualizations
Using Recharts:
- **Line chart** — active users over last 30 days
- **Bar chart** — downloads per unit
- **Pie chart** — quiz attempts distribution per unit
- **Horizontal bar** — top 10 most-downloaded files
- **Horizontal bar** — top 10 questions with highest wrong-answer rate (GOLD for Mr. Romih — he can see exactly where students struggle)

### Performance
- Index `activityLog` on `userId`, `eventType`, `createdAt` for fast queries
- Aggregate via SQL (not in JS) using Drizzle's query builder

---

## 12. ANNOUNCEMENTS

- Admin creates announcements with title, body (simple Markdown supported), severity, optional expiry
- Homepage + student dashboard show the most recent pinned announcement as a banner
- Full feed at `/announcements`
- Banner dismissible per-user per-announcement (store dismissed IDs in localStorage)
- Colors by severity:
  - `info` — navy/blue
  - `success` — green
  - `warning` — gold
  - `urgent` — red

---

## 13. STYLING GUIDELINES

### RTL & Arabic
- `<html lang="ar" dir="rtl">` in root layout
- Tailwind's logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) instead of `ml-*` / `mr-*`
- All UI strings in Arabic. Keep code/variable names English
- Numbers: use Western Arabic numerals (1, 2, 3) — standard for math in Qatari schools
- Don't translate math symbols/LaTeX

### Dark Mode
- Use `next-themes` package
- Toggle in header (sun/moon icon) and in `/profile`
- Smooth 200ms transition on color changes
- Test both modes thoroughly — gold/yellow needs adjustment to not burn eyes in dark mode

### Components
- **Cards**: white (light) or `--surface-1` (dark), rounded-xl, shadow-sm, hover:shadow-md, 1px `--border-subtle` border
- **Buttons primary**: gold gradient (`--romi-gold` to `--romi-gold-dark`), navy text, bold
- **Buttons secondary**: navy solid, white text
- **Buttons ghost**: transparent, navy text, hover navy/5 bg
- **Inputs**: rounded-lg, 1.5px border, focus ring gold
- **Badges (file types)**: soft pill backgrounds with matching icon
  - question_bank → blue-ish
  - answer_key → green-ish
  - exam → red-ish
  - exam_solution → purple-ish
  - update → amber

### Motion
- Page transitions: fade + 8px upward slide, 200ms
- Card hovers: subtle lift (translateY -2px)
- Quiz option selection: gold border pulse, then expand to fill
- Avoid any bouncy springs — keep all easing `ease-out`

### Imagery / icons per unit
- Unit 4 (Integration) — ∫ integral symbol in gold
- Unit 5 (Applications) — ∫ with curves
- Unit 6 (Vectors) — arrow vector icon
- Unit 7 (Complex Numbers) — i symbol or complex plane

Use Lucide where possible, custom inline SVG for math symbols.

---

## 14. PWA SETUP

Using `@ducanh2912/next-pwa`:
- Configure in `next.config.mjs`
- `public/manifest.json` with:
  ```json
  {
    "name": "رميح في الرياضيات",
    "short_name": "رميح",
    "description": "منصة رميح للرياضيات — الصف الثاني عشر",
    "lang": "ar",
    "dir": "rtl",
    "start_url": "/dashboard",
    "display": "standalone",
    "background_color": "#0A1A4A",
    "theme_color": "#0A1A4A",
    "icons": [
      { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
  }
  ```
- Service worker caches static assets + PDF list + offline fallback page showing "لا يوجد اتصال بالإنترنت — بعض المحتوى قد لا يكون متاحاً"
- DO NOT cache PDFs themselves (too large), only their listing page

---

## 15. SOCIAL LINKS

Hardcode these in `src/lib/constants.ts`:

```typescript
export const SITE = {
  name: 'رميح في الرياضيات',
  nameEn: 'Romi7 Maths',
  teacherName: 'إبراهيم رميح',
  teacherNameEn: 'Ibrahim Romih',
  tagline: 'الرياضيات للثانوية العامة — المسار العلمي والتكنولوجي',
  socials: {
    telegram: 'https://t.me/IBRAHIM_ROMIH',
    whatsapp: 'https://wa.me/97430303452',
    whatsappDisplay: '+974 3030 3452',
  },
};
```

Place social buttons:
- Footer (both)
- `/about` page (both, prominent)
- Student dashboard sidebar ("تواصل مع المعلم")
- Login/signup pages (footer, small)

WhatsApp button opens `https://wa.me/97430303452` with pre-filled message `السلام عليكم أستاذ، لدي سؤال...` via `?text=` param.

---

## 16. PHASED BUILD ORDER

**BUILD IN STRICT ORDER.** Do not start a later phase until earlier ones work end-to-end. After each phase, commit to GitHub with a meaningful message.

### Phase 0 — Setup (foundation)
1. `create-next-app` with TypeScript, Tailwind, App Router
2. Install all dependencies from §3
3. Set up Tailwind config with CSS variables from §2
4. Configure fonts (Readex Pro + IBM Plex Sans Arabic + Inter)
5. Set up `<html lang="ar" dir="rtl">`, root layout with font loading, theme provider
6. Create brand components: `Logo`, `LogoMark`
7. Create basic `SiteHeader`, `SiteFooter`
8. Build landing page `/` with hero + features + CTAs (no data yet, hardcoded copy)
9. Create `.env.local.example` with all required vars
10. Initialize git, push to GitHub, deploy to Vercel — **confirm it renders before proceeding**

### Phase 1 — Database & Auth
1. Set up Turso, get connection URL + auth token, add to `.env.local`
2. Write Drizzle schema (§5), config, client
3. `drizzle-kit push` to Turso
4. Write `seed.ts` (§6) — seed without PDFs' filesystem check first, just register metadata
5. Implement Auth.js v5 with credentials provider
6. Build `/login` and `/signup` pages with split layout
7. Middleware protection for `/dashboard`, `/admin`
8. Manually confirm: can sign up, log in, log out, access dashboard, admin blocked for students

### Phase 2 — Content Browsing
1. Build `/dashboard` (student home) with welcome + unit cards
2. Build `/unit/[id]` with tabbed file list
3. Build file download route with tracking
4. Integrate PDF preview (iframe for desktop, new tab for mobile)
5. Build bookmark button + `/bookmarks` page
6. Build `/announcements` + homepage banner
7. Test end-to-end: student can browse → preview → download → bookmark PDFs

### Phase 3 — Admin Dashboard (core)
1. Build admin layout with sidebar nav
2. `/admin` overview with stat cards and activity table
3. `/admin/students` table with search
4. `/admin/files` table with upload modal → Vercel Blob
5. `/admin/units` CRUD
6. `/admin/announcements` CRUD
7. Confirm: admin can upload a new PDF, assign to unit, publish/unpublish, students see changes

### Phase 4 — Quiz System
1. Extract MCQs from provided PDFs (Unit 4, 5, 6, 7) into `seed-questions.json`. **Only extract from provided PDFs, do not invent questions.** Compute correct answers mathematically; mark `needsReview: true` when uncertain.
2. Add questions seeding to `seed.ts` from the JSON
3. Build `MathRenderer` component with KaTeX
4. Build quiz runner `/quiz/[unitId]`
5. Build results page `/quiz/[unitId]/results/[attemptId]`
6. Build `/history` page
7. Build `/admin/quizzes/[unitId]` editor with option to fix `needsReview` questions

### Phase 5 — Analytics
1. Wire activity logging on all significant events
2. Build `/admin/analytics` with Recharts
3. Add top-wrong-answers report (high value for Mr. Romih)

### Phase 6 — Polish & PWA
1. Dark mode polish (test every page)
2. PWA setup (manifest, service worker, offline page)
3. Search bar in header (searches file titles by unit)
4. `framer-motion` page transitions
5. Accessibility pass — aria labels, keyboard navigation, focus visibility
6. Loading states and empty states on every data fetch
7. Error boundaries
8. Mobile polish — verify all admin tables scroll horizontally on small screens
9. Performance — Lighthouse ≥ 90 on mobile for public pages
10. Write README with setup instructions

---

## 17. ENVIRONMENT VARIABLES

Create `.env.local.example`:

```
# Turso Database
TURSO_CONNECTION_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=...

# Auth.js
AUTH_SECRET=generate_with_openssl_rand_base64_32
AUTH_URL=http://localhost:3000

# Vercel Blob (for admin uploads)
BLOB_READ_WRITE_TOKEN=...

# Admin seed (used only on first seed run)
ADMIN_EMAIL=ibrahim@romi7.example
ADMIN_PASSWORD=ChangeMeOnFirstLogin!
ADMIN_NAME=إبراهيم رميح

# Optional
NEXT_PUBLIC_SITE_URL=https://romi7.vercel.app
```

Document in README how to get each value.

---

## 18. ADDITIONAL NOTES FOR YOU (CLAUDE CODE)

- **NEVER invent quiz questions.** Only extract from the provided PDFs. When in doubt about a correct answer, mark `needsReview: true`.
- **NEVER auto-translate Mr. Romih's content.** If Arabic text is in the PDFs, use it as-is.
- **Always show Arabic error messages to end users** (code errors to console can be English).
- Commit frequently with clear messages: `feat(auth): credential sign-in flow`, `fix(quiz): option shuffle seed`, etc.
- **Test on an Arabic-RTL viewport mentally after every UI change** — are icons on the right side of labels? Does the arrow point back correctly in RTL?
- Avoid any third-party analytics (no Google Analytics, no Mixpanel) — all analytics stay in our own DB for privacy.
- No ads, no sponsored content, ever.
- When in doubt about UX, choose **clear over clever**. These are 17-year-old students cramming for final exams — friction kills them.

---

## 19. DEFINITION OF DONE

The project is complete when:

✅ A new student can sign up, log in, and immediately browse all units
✅ They can download any PDF and the download count increments
✅ They can bookmark files and find them at `/bookmarks`
✅ They can take an interactive quiz with math-rendered questions, get a score, and see results
✅ They can see their quiz history with scores
✅ Announcements are visible on their dashboard
✅ Mr. Romih can log in as admin, upload a new PDF, post an announcement, and see a dashboard of student activity
✅ He can see top-downloaded files and top-wrong-answers
✅ Dark mode works everywhere
✅ PWA installs on mobile
✅ All pages are fully Arabic RTL
✅ Deployed to Vercel with zero errors
✅ Lighthouse mobile score ≥ 90 on landing page

---

## 20. START HERE

Begin by running Phase 0 step-by-step. After scaffolding the Next.js app and committing the initial setup, stop and summarize what's done before moving to Phase 1. This is a large project — small, verifiable increments are safer than big leaps.

Good luck. Build this like it's your own teacher's platform. — **يا رب التوفيق**.
