import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "./index";

type FileSpec = {
  titleAr: string;
  type: "question_bank" | "answer_key" | "exam" | "exam_solution";
  path: string;
  examNumber?: number;
};

type UnitSpec = {
  number: number;
  nameAr: string;
  nameEn: string;
  description: string;
  iconKey: string;
  files: FileSpec[];
};

const UNIT_SPECS: UnitSpec[] = [
  {
    number: 4,
    nameAr: "التكامل",
    nameEn: "Integration",
    description: "أساسيات التكامل: التكامل غير المحدد والمحدد، وقوانين التكامل الأساسية، والطرق التطبيقية لحل مسائل التكامل.",
    iconKey: "integral",
    files: [
      { titleAr: "حل وحدة التكامل — رميح 2026", type: "answer_key", path: "/pdfs/semester-2/unit-4-integration/answers.pdf" },
      { titleAr: "تحديث 04 — التكامل 2026", type: "question_bank", path: "/pdfs/semester-2/unit-4-integration/update-04.pdf" },
      { titleAr: "اختبار التكامل (1)", type: "exam", examNumber: 1, path: "/pdfs/semester-2/unit-4-integration/exam-1.pdf" },
      { titleAr: "اختبار التكامل (2)", type: "exam", examNumber: 2, path: "/pdfs/semester-2/unit-4-integration/exam-2.pdf" },
      { titleAr: "اختبار التكامل (3)", type: "exam", examNumber: 3, path: "/pdfs/semester-2/unit-4-integration/exam-3.pdf" },
      { titleAr: "اختبار التكامل (4)", type: "exam", examNumber: 4, path: "/pdfs/semester-2/unit-4-integration/exam-4.pdf" },
      { titleAr: "اختبار التكامل (5)", type: "exam", examNumber: 5, path: "/pdfs/semester-2/unit-4-integration/exam-5.pdf" },
      { titleAr: "حل اختبار التكامل (1)", type: "exam_solution", examNumber: 1, path: "/pdfs/semester-2/unit-4-integration/exam-1-solution.pdf" },
    ],
  },
  {
    number: 5,
    nameAr: "تطبيقات التكامل",
    nameEn: "Applications of Integration",
    description: "تطبيقات التكامل على حساب المساحات والحجوم والأطوال، وتطبيقات فيزيائية أخرى.",
    iconKey: "integral-app",
    files: [
      { titleAr: "تطبيقات التكامل — رميح 2026", type: "question_bank", path: "/pdfs/semester-2/unit-5-integration-applications/main.pdf" },
      { titleAr: "نموذج إجابة تطبيقات التكامل", type: "answer_key", path: "/pdfs/semester-2/unit-5-integration-applications/answers.pdf" },
    ],
  },
  {
    number: 6,
    nameAr: "المتجهات",
    nameEn: "Vectors",
    description: "المتجهات في المستوى والفضاء، الضرب القياسي والاتجاهي، والمعادلات المتجهية للمستقيمات والمستويات.",
    iconKey: "vector",
    files: [
      { titleAr: "المتجهات — رميح 2026", type: "question_bank", path: "/pdfs/semester-2/unit-6-vectors/main.pdf" },
      { titleAr: "نموذج إجابة المتجهات — رميح 2026", type: "answer_key", path: "/pdfs/semester-2/unit-6-vectors/answers.pdf" },
    ],
  },
  {
    number: 7,
    nameAr: "الأعداد المركبة",
    nameEn: "Complex Numbers",
    description: "الأعداد المركبة: الصور الجبرية والقطبية والأسية، العمليات الحسابية، ونظرية دي موافر.",
    iconKey: "complex",
    files: [
      { titleAr: "الأعداد المركبة — رميح 2026", type: "question_bank", path: "/pdfs/semester-2/unit-7-complex-numbers/main.pdf" },
    ],
  },
];

const publicRoot = join(process.cwd(), "public");

function localPath(p: string) {
  return join(publicRoot, p.replace(/^\/+/, ""));
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "إبراهيم رميح";

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
  }

  console.log("🔐 Admin user…");
  let admin = (await db.select().from(schema.users).where(eq(schema.users.email, adminEmail)))[0];
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const [inserted] = await db
      .insert(schema.users)
      .values({ name: adminName, email: adminEmail, passwordHash, role: "admin" })
      .returning();
    admin = inserted;
    console.log(`  ✔ created admin ${adminEmail}`);
  } else {
    console.log(`  ✔ admin ${adminEmail} already exists (skipping)`);
  }

  console.log("📚 Semesters…");
  const existingSemesters = await db.select().from(schema.semesters);
  const bySemOrder = new Map(existingSemesters.map((s) => [s.order, s]));
  async function upsertSemester(order: number, nameAr: string, nameEn: string, isPublished: boolean) {
    const existing = bySemOrder.get(order);
    if (existing) return existing;
    const [row] = await db
      .insert(schema.semesters)
      .values({ order, nameAr, nameEn, isPublished })
      .returning();
    console.log(`  ✔ ${nameEn}`);
    return row;
  }
  await upsertSemester(1, "الفصل الدراسي الأول", "Semester 1", false);
  const sem2 = await upsertSemester(2, "الفصل الدراسي الثاني", "Semester 2", true);

  console.log("📐 Units…");
  const existingUnits = await db.select().from(schema.units);
  const byUnitNumber = new Map(existingUnits.map((u) => [`${u.semesterId}:${u.number}`, u]));

  for (const spec of UNIT_SPECS) {
    const key = `${sem2.id}:${spec.number}`;
    let unit = byUnitNumber.get(key);
    if (!unit) {
      const [row] = await db
        .insert(schema.units)
        .values({
          semesterId: sem2.id,
          number: spec.number,
          nameAr: spec.nameAr,
          nameEn: spec.nameEn,
          description: spec.description,
          iconKey: spec.iconKey,
          order: spec.number,
          isPublished: true,
        })
        .returning();
      unit = row;
      console.log(`  ✔ Unit ${spec.number} — ${spec.nameEn}`);
    } else {
      console.log(`  ✔ Unit ${spec.number} — ${spec.nameEn} (existing)`);
    }

    const existingFiles = await db
      .select()
      .from(schema.files)
      .where(eq(schema.files.unitId, unit.id));
    const byPath = new Map(existingFiles.map((f) => [f.path, f]));

    for (const f of spec.files) {
      const abs = localPath(f.path);
      if (!existsSync(abs)) {
        console.log(`    ✘ missing on disk, skipping: ${f.path}`);
        continue;
      }
      if (byPath.has(f.path)) {
        console.log(`    · file already registered: ${f.titleAr}`);
        continue;
      }
      const sizeBytes = statSync(abs).size;
      await db.insert(schema.files).values({
        unitId: unit.id,
        titleAr: f.titleAr,
        type: f.type,
        examNumber: f.examNumber,
        source: "repo",
        path: f.path,
        sizeBytes,
        uploadedBy: admin.id,
      });
      console.log(`    ✔ file: ${f.titleAr} (${(sizeBytes / 1024 / 1024).toFixed(2)} MB)`);
    }
  }

  console.log("📣 Sample announcement…");
  const existingAnnouncements = await db.select().from(schema.announcements);
  if (existingAnnouncements.length === 0) {
    await db.insert(schema.announcements).values({
      titleAr: "مرحباً بكم في منصة رميح للرياضيات",
      bodyAr:
        "تم إطلاق المنصّة لمتابعة أوراق الأستاذ إبراهيم رميح وحل الاختبارات التفاعلية.\n\nتمّت إضافة وحدات الفصل الدراسي الثاني: التكامل، تطبيقات التكامل، المتجهات، الأعداد المركبة.",
      severity: "info",
      isPinned: true,
      createdBy: admin.id,
    });
    console.log("  ✔ pinned welcome announcement");
  } else {
    console.log("  ✔ announcements already exist (skipping)");
  }

  console.log("\n✅ Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error("\n❌ Seed failed:", e);
  process.exit(1);
});
