/**
 * Sample placeholder questions for each unit — ALL marked `needsReview: true`
 * so they do NOT appear to students. Mr. Romih should review each one, fix
 * any math notation differences, and flip off `needsReview` to publish, or
 * replace with questions extracted from his own PDFs.
 *
 * Per the project spec: quiz questions should come from the provided PDFs.
 * These exist only so the quiz UI has something to render during UAT; they
 * are gated behind the `needsReview` filter on the student side.
 */

import { eq, and } from "drizzle-orm";
import { db, schema } from "./index";

type Q = {
  lessonCode?: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctIndex: number;
};

type UnitSeed = {
  unitNumber: number;
  questions: Q[];
};

const SEEDS: UnitSeed[] = [
  {
    unitNumber: 4,
    questions: [
      {
        lessonCode: "U4.1",
        difficulty: "easy",
        question: "أوجد: $\\int x^2\\, dx$",
        options: ["$\\dfrac{x^3}{3} + C$", "$2x + C$", "$x^3 + C$", "$\\dfrac{x^2}{2} + C$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U4.1",
        difficulty: "easy",
        question: "أوجد: $\\int (3x^2 - 4x + 1)\\, dx$",
        options: [
          "$x^3 - 2x^2 + x + C$",
          "$3x^3 - 4x^2 + x + C$",
          "$x^3 - 2x^2 + C$",
          "$6x - 4 + C$",
        ],
        correctIndex: 0,
      },
      {
        lessonCode: "U4.2",
        difficulty: "medium",
        question: "أوجد قيمة التكامل المحدّد: $\\int_{0}^{1} x^2\\, dx$",
        options: ["$\\dfrac{1}{3}$", "$1$", "$\\dfrac{1}{2}$", "$\\dfrac{2}{3}$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U4.2",
        difficulty: "medium",
        question: "أوجد: $\\int \\cos(x)\\, dx$",
        options: ["$\\sin(x) + C$", "$-\\sin(x) + C$", "$\\cos(x) + C$", "$-\\cos(x) + C$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U4.3",
        difficulty: "medium",
        question: "أوجد: $\\int e^{2x}\\, dx$",
        options: [
          "$\\dfrac{1}{2} e^{2x} + C$",
          "$2 e^{2x} + C$",
          "$e^{2x} + C$",
          "$\\dfrac{1}{2x} e^{2x} + C$",
        ],
        correctIndex: 0,
      },
      {
        lessonCode: "U4.3",
        difficulty: "hard",
        question: "بالتعويض، أوجد: $\\int 2x\\,(x^2+1)^5\\, dx$",
        options: [
          "$\\dfrac{(x^2+1)^6}{6} + C$",
          "$(x^2+1)^6 + C$",
          "$\\dfrac{(x^2+1)^5}{5} + C$",
          "$\\dfrac{x^2(x^2+1)^6}{12} + C$",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    unitNumber: 5,
    questions: [
      {
        lessonCode: "U5.1",
        difficulty: "easy",
        question: "المساحة المحصورة بين المنحنى $y = x^2$ والمحور $x$ على الفترة $[0,\\,2]$ تساوي:",
        options: ["$\\dfrac{8}{3}$", "$4$", "$2$", "$8$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U5.1",
        difficulty: "medium",
        question:
          "المساحة المحصورة بين المنحنيين $y = x$ و $y = x^2$ على الفترة $[0,\\,1]$ تساوي:",
        options: ["$\\dfrac{1}{6}$", "$\\dfrac{1}{2}$", "$\\dfrac{1}{3}$", "$1$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U5.2",
        difficulty: "medium",
        question:
          "حجم الجسم الناتج من دوران المنطقة المحصورة بـ $y = x$ و $x=1$ و $x=0$ حول المحور $x$ هو:",
        options: ["$\\dfrac{\\pi}{3}$", "$\\pi$", "$\\dfrac{\\pi}{2}$", "$\\dfrac{2\\pi}{3}$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U5.2",
        difficulty: "medium",
        question: "احسب: $\\int_{0}^{1} 2x\\, dx$ (يمثّل مساحة مثلّث قاعدته $1$ وارتفاعه $2$)",
        options: ["$1$", "$2$", "$\\dfrac{1}{2}$", "$4$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U5.3",
        difficulty: "hard",
        question:
          "حجم الجسم الناتج من دوران المنطقة المحصورة بـ $y = \\sqrt{x}$ و $x=4$ حول المحور $x$ هو:",
        options: ["$8\\pi$", "$4\\pi$", "$16\\pi$", "$2\\pi$"],
        correctIndex: 0,
      },
    ],
  },
  {
    unitNumber: 6,
    questions: [
      {
        lessonCode: "U6.1",
        difficulty: "easy",
        question:
          "إذا كان $\\vec{a} = (1,\\,2,\\,3)$ و $\\vec{b} = (4,\\,5,\\,6)$، فإنّ $\\vec{a} + \\vec{b}$ يساوي:",
        options: ["$(5,\\,7,\\,9)$", "$(3,\\,3,\\,3)$", "$(4,\\,10,\\,18)$", "$(5,\\,5,\\,5)$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U6.1",
        difficulty: "easy",
        question: "طول المتجه $\\vec{v} = (3,\\,4)$ يساوي:",
        options: ["$5$", "$7$", "$\\sqrt{7}$", "$25$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U6.2",
        difficulty: "medium",
        question:
          "الضرب القياسي: إذا كان $\\vec{a} = (1,\\,2,\\,3)$ و $\\vec{b} = (4,\\,-1,\\,2)$، فإنّ $\\vec{a}\\cdot\\vec{b}$ يساوي:",
        options: ["$8$", "$14$", "$0$", "$-8$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U6.2",
        difficulty: "medium",
        question:
          "إذا كان $\\vec{a}\\cdot\\vec{b} = 0$ ولم يكن أحدهما صفراً، فإنّ المتجهين:",
        options: ["متعامدان", "متوازيان", "متساويان", "في اتجاه واحد"],
        correctIndex: 0,
      },
      {
        lessonCode: "U6.3",
        difficulty: "hard",
        question:
          "الزاوية بين $\\vec{a} = (1,\\,0)$ و $\\vec{b} = (1,\\,1)$ تساوي:",
        options: ["$45^{\\circ}$", "$30^{\\circ}$", "$60^{\\circ}$", "$90^{\\circ}$"],
        correctIndex: 0,
      },
    ],
  },
  {
    unitNumber: 7,
    questions: [
      {
        lessonCode: "U7.1",
        difficulty: "easy",
        question: "القيمة: $i^2$ تساوي:",
        options: ["$-1$", "$1$", "$i$", "$0$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U7.1",
        difficulty: "easy",
        question: "مرافق العدد المركّب $z = 3 + 4i$ هو:",
        options: ["$3 - 4i$", "$-3 + 4i$", "$-3 - 4i$", "$4 + 3i$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U7.2",
        difficulty: "medium",
        question: "مقياس العدد المركّب $z = 3 + 4i$ يساوي:",
        options: ["$5$", "$7$", "$25$", "$\\sqrt{7}$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U7.2",
        difficulty: "medium",
        question: "ناتج $(2 + i)(2 - i)$ يساوي:",
        options: ["$5$", "$3$", "$4 - i^2$", "$4 + i$"],
        correctIndex: 0,
      },
      {
        lessonCode: "U7.3",
        difficulty: "hard",
        question:
          "بتطبيق نظرية دي موافر: $(\\cos\\theta + i\\sin\\theta)^n$ يساوي:",
        options: [
          "$\\cos(n\\theta) + i\\sin(n\\theta)$",
          "$n\\cos\\theta + in\\sin\\theta$",
          "$\\cos(\\theta^n) + i\\sin(\\theta^n)$",
          "$\\cos\\theta + i^n\\sin\\theta$",
        ],
        correctIndex: 0,
      },
    ],
  },
];

async function main() {
  console.log("📝 Seeding placeholder questions (all marked needsReview=true)…");

  const semesters = await db.select().from(schema.semesters);
  const sem2 = semesters.find((s) => s.order === 2);
  if (!sem2) throw new Error("Run the main seed first — semester 2 not found.");

  const units = await db
    .select()
    .from(schema.units)
    .where(eq(schema.units.semesterId, sem2.id));

  let totalAdded = 0;
  for (const seed of SEEDS) {
    const unit = units.find((u) => u.number === seed.unitNumber);
    if (!unit) {
      console.log(`  ✘ Unit ${seed.unitNumber} not found, skipping.`);
      continue;
    }

    for (const q of seed.questions) {
      // dedupe: skip if a question with the exact same text already exists for this unit
      const existing = await db
        .select({ id: schema.questions.id })
        .from(schema.questions)
        .where(
          and(
            eq(schema.questions.unitId, unit.id),
            eq(schema.questions.questionText, q.question),
          ),
        );
      if (existing.length > 0) {
        continue;
      }

      const [inserted] = await db
        .insert(schema.questions)
        .values({
          unitId: unit.id,
          lessonCode: q.lessonCode ?? null,
          questionText: q.question,
          difficulty: q.difficulty,
          needsReview: true,
          isPublished: true,
        })
        .returning({ id: schema.questions.id });

      await db.insert(schema.questionOptions).values(
        q.options.map((text, idx) => ({
          questionId: inserted.id,
          optionText: text,
          isCorrect: idx === q.correctIndex,
          order: idx,
        })),
      );
      totalAdded++;
    }
    console.log(
      `  ✔ Unit ${seed.unitNumber}: ${seed.questions.length} questions processed`,
    );
  }

  console.log(`\n✅ Done. ${totalAdded} new questions added (all needsReview=true).`);
  console.log("   Review them at /admin/quizzes — they will NOT appear to students");
  console.log("   until you uncheck «بحاجة إلى مراجعة».");
  process.exit(0);
}

main().catch((e) => {
  console.error("\n❌ Seed failed:", e);
  process.exit(1);
});
