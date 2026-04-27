/**
 * Capture screenshots of the live site for the user guide PDFs.
 * Assumes dev server is running on http://localhost:3000.
 *
 * Run: npm run guide:shots
 */
import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import puppeteer, { type Browser, type Page } from "puppeteer";
import { db, schema } from "../src/lib/db";

const BASE = process.env.GUIDE_BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "docs", "guide-assets", "screenshots");

// Demo student used only for screenshots (existence is harmless)
const DEMO_STUDENT = {
  name: "طالب تجريبي",
  email: "demo.student@romi7.com",
  password: "demo12345",
};

async function ensureDemoStudent() {
  const [existing] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, DEMO_STUDENT.email));
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(DEMO_STUDENT.password, 12);
  const [created] = await db
    .insert(schema.users)
    .values({
      name: DEMO_STUDENT.name,
      email: DEMO_STUDENT.email,
      passwordHash,
      role: "student",
    })
    .returning();
  console.log(`✓ created demo student ${DEMO_STUDENT.email}`);
  return created;
}

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function shot(page: Page, url: string, name: string, opts?: { fullPage?: boolean; wait?: number }) {
  await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  // wait a bit for entrance animations to settle
  await new Promise((r) => setTimeout(r, opts?.wait ?? 900));
  const path = join(OUT, `${name}.png`) as `${string}.png`;
  await page.screenshot({
    path,
    fullPage: opts?.fullPage ?? true,
    type: "png",
  });
  console.log(`✓ ${name}.png`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await ensureDemoStudent();

  const browser: Browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1600, height: 1000, deviceScaleFactor: 1 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    // =========== STUDENT SHOTS ===========
    console.log("\n📸 STUDENT SHOTS\n");
    const studentCtx = await browser.createBrowserContext();
    const sp = await studentCtx.newPage();
    await sp.setViewport({ width: 1600, height: 1000 });

    await shot(sp, "/", "student-landing");
    await shot(sp, "/login", "login");
    await shot(sp, "/signup", "signup");

    await login(sp, DEMO_STUDENT.email, DEMO_STUDENT.password);

    await shot(sp, "/dashboard", "student-dashboard");
    await shot(sp, "/files", "student-files");
    await shot(sp, "/announcements", "student-announcements");
    await shot(sp, "/bookmarks", "student-bookmarks");
    await shot(sp, "/history", "student-history");

    // Get a video id and a pdf id for preview/video shots
    const [sampleVideo] = await db
      .select({ id: schema.files.id })
      .from(schema.files)
      .where(eq(schema.files.source, "youtube"))
      .limit(1);
    if (sampleVideo) {
      await shot(sp, `/video/${sampleVideo.id}`, "student-video-page");
    }
    const [samplePdf] = await db
      .select({ id: schema.files.id })
      .from(schema.files)
      .where(eq(schema.files.source, "repo"))
      .limit(1);
    if (samplePdf) {
      await shot(sp, `/preview/${samplePdf.id}`, "student-preview-page");
    }

    const [unit] = await db.select({ id: schema.units.id }).from(schema.units).limit(1);
    if (unit) {
      await shot(sp, `/unit/${unit.id}`, "student-unit");
      await shot(sp, `/quiz/${unit.id}`, "student-quiz-intro");
    }

    await studentCtx.close();

    // =========== ADMIN SHOTS ===========
    console.log("\n📸 ADMIN SHOTS\n");
    const adminCtx = await browser.createBrowserContext();
    const ap = await adminCtx.newPage();
    await ap.setViewport({ width: 1600, height: 1000 });

    const adminEmail = process.env.ADMIN_EMAIL!;
    const adminPassword = process.env.ADMIN_PASSWORD!;
    await login(ap, adminEmail, adminPassword);

    await shot(ap, "/admin", "admin-dashboard");
    await shot(ap, "/admin/students", "admin-students");
    await shot(ap, "/admin/units", "admin-units");
    await shot(ap, "/admin/files", "admin-files");
    await shot(ap, "/admin/quizzes", "admin-quizzes");
    await shot(ap, "/admin/announcements", "admin-announcements");

    const [anyUnit] = await db.select({ id: schema.units.id }).from(schema.units).limit(1);
    if (anyUnit) {
      await shot(ap, `/admin/quizzes/${anyUnit.id}`, "admin-quiz-unit");
    }

    await adminCtx.close();
  } finally {
    await browser.close();
  }

  console.log("\n✅ All screenshots captured.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
