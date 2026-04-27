/**
 * Render the two user-guide HTML templates into polished PDFs
 * using headless Chrome via puppeteer.
 *
 * Output:
 *  - docs/guides/دليل-الطالب.pdf
 *  - docs/guides/دليل-الأستاذ.pdf
 *
 * Run: npm run guide:pdf
 */
import "dotenv/config";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import puppeteer from "puppeteer";
import { renderStudentGuide, renderAdminGuide } from "./guide-templates";

const ROOT = process.cwd();
const SHOTS_DIR = join(ROOT, "docs", "guide-assets", "screenshots");
const OUT_DIR = join(ROOT, "docs", "guides");
const LOGO_PATH = join(ROOT, "public", "logo-round.png");

async function toDataUri(absPath: string, mime = "image/png") {
  const buf = await readFile(absPath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function buildAssetBundle() {
  const names = [
    "student-landing",
    "login",
    "signup",
    "student-dashboard",
    "student-files",
    "student-announcements",
    "student-bookmarks",
    "student-history",
    "student-video-page",
    "student-preview-page",
    "student-unit",
    "student-quiz-intro",
    "admin-dashboard",
    "admin-students",
    "admin-units",
    "admin-files",
    "admin-quizzes",
    "admin-announcements",
    "admin-quiz-unit",
  ];
  const shots: Record<string, string> = {};
  for (const n of names) {
    try {
      shots[n] = await toDataUri(join(SHOTS_DIR, `${n}.png`));
    } catch {
      console.warn(`⚠ missing screenshot: ${n}.png`);
    }
  }
  const logo = await toDataUri(LOGO_PATH);
  return { shots, logo };
}

async function htmlToPdf(html: string, outPath: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 120000 });
    // give fonts a moment to load
    await new Promise((r) => setTimeout(r, 1500));
    await page.emulateMediaType("print");
    await page.pdf({
      path: outPath as `${string}.pdf`,
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const assets = await buildAssetBundle();

  const adminEmail = process.env.ADMIN_EMAIL || "romih@admin.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "romih";

  const studentHtml = renderStudentGuide(assets);
  const adminHtml = renderAdminGuide({ ...assets, adminEmail, adminPassword });

  // Also write the HTML for debugging / manual review
  await writeFile(join(OUT_DIR, "_student.html"), studentHtml, "utf8");
  await writeFile(join(OUT_DIR, "_admin.html"), adminHtml, "utf8");

  console.log("📄 Rendering دليل الطالب…");
  await htmlToPdf(studentHtml, join(OUT_DIR, "دليل-الطالب.pdf"));
  console.log("📄 Rendering دليل الأستاذ…");
  await htmlToPdf(adminHtml, join(OUT_DIR, "دليل-الأستاذ.pdf"));

  console.log("\n✅ PDFs written to docs/guides/");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
