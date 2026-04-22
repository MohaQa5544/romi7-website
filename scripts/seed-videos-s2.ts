/**
 * Seed semester-2 explanation videos (فيديوهات شرح) from
 * Mr. Ibrahim Romih's YouTube channel, mapped to their units.
 *
 * Unified title format: "X.Y — اسم الدرس"
 * Idempotent: skips rows whose `path` (YouTube URL) already exists.
 *
 * Run: npm run db:seed-videos-s2
 */
import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../src/lib/db";

type VideoSpec = {
  unitNumber: number;
  code: string; // e.g. "4.1"
  title: string; // short lesson title (without code prefix)
  youtubeId: string;
};

const VIDEOS: VideoSpec[] = [
  // Unit 4 — التكامل غير المحدود
  { unitNumber: 4, code: "4.1", title: "التكامل غير المحدود", youtubeId: "5B2JSmk-CVg" },
  { unitNumber: 4, code: "4.2", title: "قواعد التكامل", youtubeId: "zV0q8uxooiU" },
  { unitNumber: 4, code: "4.3", title: "التكامل بالتعويض", youtubeId: "qGFWD4KG6fs" },
  { unitNumber: 4, code: "4.4", title: "التكامل بالأجزاء", youtubeId: "kuA5YETd7jw" },
  { unitNumber: 4, code: "4.5", title: "التكامل بالكسور الجزئية", youtubeId: "yPFCjCjb3yE" },

  // Unit 5 — تطبيقات التكامل
  { unitNumber: 5, code: "5.1", title: "التكامل المحدود", youtubeId: "-gv_tO34tLY" },
  { unitNumber: 5, code: "5.2", title: "المساحة تحت المنحنى", youtubeId: "e43186TWRQs" },
  { unitNumber: 5, code: "5.3", title: "المساحة بين منحنيين", youtubeId: "Nl1XJW85XQ8" },
  { unitNumber: 5, code: "5.4", title: "الحجوم الدورانية", youtubeId: "JNOhCka5aSc" },
  { unitNumber: 5, code: "5.5", title: "تطبيقات التكامل المحدود", youtubeId: "XTceiFmNBv4" },
  { unitNumber: 5, code: "5.6", title: "حل المعادلات التفاضلية", youtubeId: "a0Z62aikcdY" },

  // Unit 6 — المتجهات
  { unitNumber: 6, code: "6.1", title: "مدخل في المتجهات", youtubeId: "Rg6rF4--jKg" },
  { unitNumber: 6, code: "6.2", title: "العمليات على المتجهات", youtubeId: "RvrovxKAsIo" },
  { unitNumber: 6, code: "6.3", title: "المتجهات في الفضاء ثلاثي الأبعاد", youtubeId: "JlNcLmEJfQY" },

  // Unit 7 — الأعداد المركبة
  { unitNumber: 7, code: "7.1", title: "الأعداد المركبة والعمليات عليها", youtubeId: "ygowKA2WpPQ" },
  { unitNumber: 7, code: "7.2", title: "المستوى المركب", youtubeId: "meJ-0jlJQ9w" },
  { unitNumber: 7, code: "7.3", title: "الصورة القطبية للعدد المركب", youtubeId: "ZkQxVVN1u8I" },
];

async function main() {
  console.log(`📼 Seeding ${VIDEOS.length} video lessons...\n`);

  // Find an admin user to attribute uploads to (nullable, but nicer)
  const [admin] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.role, "admin"))
    .limit(1);
  const uploadedBy = admin?.id ?? null;

  // Cache unit lookups (unit number → id)
  const units = await db
    .select({ id: schema.units.id, number: schema.units.number, nameAr: schema.units.nameAr })
    .from(schema.units);
  const byNumber = new Map(units.map((u) => [u.number, u]));

  let inserted = 0;
  let skipped = 0;
  let missing = 0;

  for (const v of VIDEOS) {
    const unit = byNumber.get(v.unitNumber);
    if (!unit) {
      console.warn(`⚠️  No unit with number=${v.unitNumber} — skipping ${v.code}`);
      missing++;
      continue;
    }

    const titleAr = `${v.code} — ${v.title}`;
    const path = `https://www.youtube.com/watch?v=${v.youtubeId}`;

    // Idempotency: skip if already present (by unit + path)
    const existing = await db
      .select({ id: schema.files.id })
      .from(schema.files)
      .where(
        and(eq(schema.files.unitId, unit.id), eq(schema.files.path, path)),
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(`↻  Already exists — ${titleAr}`);
      skipped++;
      continue;
    }

    await db.insert(schema.files).values({
      unitId: unit.id,
      titleAr,
      type: "video",
      source: "youtube",
      path,
      uploadedBy,
      isPublished: true,
    });

    console.log(`✓  ${titleAr}  →  الوحدة ${unit.number}: ${unit.nameAr}`);
    inserted++;
  }

  console.log(
    `\nDone. inserted=${inserted}  skipped=${skipped}  missingUnits=${missing}\n`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
