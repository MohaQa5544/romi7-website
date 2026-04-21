# Romi7 — رميح في الرياضيات

Arabic-first (RTL) study platform for Mr. **Ibrahim Romih** (رميح في الرياضيات), targeting Grade 12 students on the Qatari Scientific & Technological track (المسار العلمي والتكنولوجي).

> **Status:** Phase 0 — foundation. Landing page, brand, theming, font loading, and the PDF asset structure are in place. Later phases add auth, DB, file management, quizzes, and analytics.

## Brand

- **Navy** `#0A1A4A` · **Gold** `#F5C518` · **Red** `#E63946` (accent only)
- Fonts: Readex Pro (display), IBM Plex Sans Arabic (body), Inter (Latin)

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript, Server Actions) |
| Styling | Tailwind CSS v4 + CSS variables |
| UI primitives | shadcn/ui + Radix |
| Icons | Lucide React |
| Database | Turso (libSQL) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (Credentials) + bcryptjs |
| File storage | Vercel Blob (admin uploads); `/public/pdfs/*` for seeded PDFs |
| Math | KaTeX via `react-katex` |
| Animation | framer-motion |
| Forms | react-hook-form + zod |
| Charts | Recharts |
| PWA | `@ducanh2912/next-pwa` |
| Deploy | Vercel |

## Getting started

```bash
cp .env.local.example .env.local
# fill in values (see below)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Var | What it is | How to get it |
|---|---|---|
| `TURSO_CONNECTION_URL` | libSQL URL of your Turso DB | `turso db show <db>` → URL |
| `TURSO_AUTH_TOKEN` | Turso auth token | `turso db tokens create <db>` |
| `AUTH_SECRET` | Auth.js signing key | `openssl rand -base64 32` |
| `AUTH_URL` | Deployment URL | `http://localhost:3000` in dev |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob RW token | Vercel dashboard → Storage → Blob |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | First admin user (seed only) | You choose. Change password after first login. |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `https://romi7.vercel.app` |

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run start` | Run the prod build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Push Drizzle schema to Turso |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed users, units, files, sample announcement |

## Directory layout

Mirrors §4 of `docs/ROMI7_CLAUDE_CODE_PROMPT.md`. Highlights:

```
public/
  logo.png, logo-transparent.png, icon-192.png, icon-512.png, manifest.json
  pdfs/semester-2/
    unit-4-integration/      — main answers, 5 exams, 1 exam solution, update-04
    unit-5-integration-applications/  — main + answers
    unit-6-vectors/          — main + answers
    unit-7-complex-numbers/  — main
src/app/
  (marketing)/               — /, /about
  (auth)/                    — /login, /signup           (Phase 1)
  (student)/                 — /dashboard, /unit/[id], …  (Phase 2+)
  admin/                     — admin dashboard            (Phase 3+)
  api/                       — auth, upload, download, analytics
src/components/              — brand, layout, home, units, quiz, admin, common
src/lib/                     — db, auth, storage, analytics, constants, utils
```

## PDF source notes (for seeding)

Unit 4 (التكامل): no standalone main question-bank PDF was provided — only `answers.pdf` (حل وحدة التكامل), five exam PDFs, one exam solution (`exam-1-solution.pdf`), and an update (`update-04.pdf`). The seed script registers only files that exist. Mr. Romih can upload the missing main PDF via the admin panel once available.

## License

Private — all rights reserved by the author.
