"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

const optionInput = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1, "نص الخيار مطلوب"),
  isCorrect: z.boolean().optional(),
});

const questionInput = z.object({
  id: z.string().optional(),
  unitId: z.string().min(1),
  lessonCode: z.string().optional().nullable(),
  questionText: z.string().trim().min(2, "نص السؤال قصير جداً"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  needsReview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sourceFileId: z.string().optional().nullable(),
  sourceQuestionNumber: z.coerce.number().int().optional().nullable(),
  options: z.array(optionInput).min(2, "أضف خيارين على الأقل").max(6),
  correctIndex: z.coerce.number().int().min(0),
});

export type QuestionFormState =
  | { ok: true; id: string }
  | { ok: false; error: string }
  | null;

/**
 * Save a question with its options in a single server action.
 * Pass options as form entries `option[0]`, `option[1]`, … and `correctIndex`.
 */
export async function saveQuestion(
  _prev: QuestionFormState,
  fd: FormData,
): Promise<QuestionFormState> {
  await requireAdmin();

  // collect options — admin UI sends option_0, option_1, ... with option_*_id for existing
  const options: { id?: string; text: string; isCorrect?: boolean }[] = [];
  for (let i = 0; i < 10; i++) {
    const text = fd.get(`option_${i}`);
    if (text == null) continue;
    const trimmed = String(text).trim();
    if (!trimmed) continue;
    options.push({
      id: (fd.get(`option_${i}_id`) as string) || undefined,
      text: trimmed,
    });
  }

  const parsed = questionInput.safeParse({
    id: fd.get("id") || undefined,
    unitId: fd.get("unitId"),
    lessonCode: fd.get("lessonCode") || null,
    questionText: fd.get("questionText"),
    difficulty: fd.get("difficulty") || "medium",
    needsReview: fd.get("needsReview") === "on",
    isPublished: fd.get("isPublished") === "on",
    sourceFileId: fd.get("sourceFileId") || null,
    sourceQuestionNumber: fd.get("sourceQuestionNumber") || null,
    options,
    correctIndex: fd.get("correctIndex"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const d = parsed.data;
  if (d.correctIndex >= d.options.length) {
    return { ok: false, error: "لم يتم تحديد الإجابة الصحيحة" };
  }

  const markedOptions = d.options.map((o, i) => ({ ...o, isCorrect: i === d.correctIndex }));

  let questionId: string;
  if (d.id) {
    await db
      .update(schema.questions)
      .set({
        unitId: d.unitId,
        lessonCode: d.lessonCode ?? null,
        questionText: d.questionText,
        difficulty: d.difficulty,
        needsReview: d.needsReview ?? false,
        isPublished: d.isPublished ?? true,
        sourceFileId: d.sourceFileId ?? null,
        sourceQuestionNumber: d.sourceQuestionNumber ?? null,
      })
      .where(eq(schema.questions.id, d.id));
    questionId = d.id;
    // wipe old options + insert fresh (simplest correctness guarantee)
    await db.delete(schema.questionOptions).where(eq(schema.questionOptions.questionId, d.id));
  } else {
    const [row] = await db
      .insert(schema.questions)
      .values({
        unitId: d.unitId,
        lessonCode: d.lessonCode ?? null,
        questionText: d.questionText,
        difficulty: d.difficulty,
        needsReview: d.needsReview ?? false,
        isPublished: d.isPublished ?? true,
        sourceFileId: d.sourceFileId ?? null,
        sourceQuestionNumber: d.sourceQuestionNumber ?? null,
      })
      .returning({ id: schema.questions.id });
    questionId = row.id;
  }

  await db.insert(schema.questionOptions).values(
    markedOptions.map((o, i) => ({
      questionId,
      optionText: o.text,
      isCorrect: !!o.isCorrect,
      order: i,
    })),
  );

  revalidatePath(`/admin/quizzes/${d.unitId}`);
  revalidatePath(`/quiz/${d.unitId}`);
  return { ok: true, id: questionId };
}

export async function toggleQuestionPublished(id: string): Promise<void> {
  await requireAdmin();
  const [row] = await db.select().from(schema.questions).where(eq(schema.questions.id, id));
  if (!row) return;
  await db
    .update(schema.questions)
    .set({ isPublished: !row.isPublished })
    .where(eq(schema.questions.id, id));
  revalidatePath(`/admin/quizzes/${row.unitId}`);
  revalidatePath(`/quiz/${row.unitId}`);
}

export async function toggleQuestionNeedsReview(id: string): Promise<void> {
  await requireAdmin();
  const [row] = await db.select().from(schema.questions).where(eq(schema.questions.id, id));
  if (!row) return;
  await db
    .update(schema.questions)
    .set({ needsReview: !row.needsReview })
    .where(eq(schema.questions.id, id));
  revalidatePath(`/admin/quizzes/${row.unitId}`);
}

export async function deleteQuestion(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const [row] = await db.select().from(schema.questions).where(eq(schema.questions.id, id));
  if (!row) return { ok: false, error: "السؤال غير موجود" };
  try {
    await db.delete(schema.questionOptions).where(eq(schema.questionOptions.questionId, id));
    await db.delete(schema.questions).where(eq(schema.questions.id, id));
  } catch {
    return { ok: false, error: "تعذّر الحذف — قد يكون السؤال مستخدماً في اختبارات سابقة." };
  }
  revalidatePath(`/admin/quizzes/${row.unitId}`);
  return { ok: true };
}

/** Server helper — fetch questions with their options for a unit (admin view). */
export async function getUnitQuestionsForAdmin(unitId: string) {
  await requireAdmin();
  const questions = await db
    .select()
    .from(schema.questions)
    .where(eq(schema.questions.unitId, unitId))
    .orderBy(asc(schema.questions.createdAt));
  if (questions.length === 0) return [];
  const options = await db
    .select()
    .from(schema.questionOptions)
    .orderBy(asc(schema.questionOptions.order));
  const byQ = new Map<string, typeof options>();
  for (const o of options) {
    const arr = byQ.get(o.questionId) ?? [];
    arr.push(o);
    byQ.set(o.questionId, arr);
  }
  return questions.map((q) => ({ ...q, options: byQ.get(q.id) ?? [] }));
}
