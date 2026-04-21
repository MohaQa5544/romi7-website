"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth/config";

const MAX_QUESTIONS = 20;

const startInput = z.object({
  unitId: z.string().min(1),
  count: z.coerce.number().int().min(3).max(MAX_QUESTIONS).optional(),
});

export type StartState =
  | { ok: true; attemptId: string }
  | { ok: false; error: string }
  | null;

/**
 * Create a new attempt for this unit. Picks up to `count` published, non-needs-review
 * questions at random and snapshots them (so mid-attempt edits don't mutate the quiz).
 */
export async function startQuizAttempt(
  _prev: StartState,
  fd: FormData,
): Promise<StartState> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "يجب تسجيل الدخول أولاً" };

  const parsed = startInput.safeParse({
    unitId: fd.get("unitId"),
    count: fd.get("count") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "وحدة غير صحيحة" };
  const { unitId, count = 10 } = parsed.data;

  // pick questions at random
  const picks = await db
    .select({ id: schema.questions.id })
    .from(schema.questions)
    .where(
      and(
        eq(schema.questions.unitId, unitId),
        eq(schema.questions.isPublished, true),
        eq(schema.questions.needsReview, false),
      ),
    )
    .orderBy(sql`RANDOM()`)
    .limit(count);

  if (picks.length < 3) {
    return { ok: false, error: "لا توجد أسئلة كافية في هذه الوحدة بعد" };
  }

  const [attempt] = await db
    .insert(schema.quizAttempts)
    .values({
      userId: session.user.id,
      unitId,
      questionCount: picks.length,
    })
    .returning({ id: schema.quizAttempts.id });

  // snapshot: store each question as an answer row with selected=null
  await db.insert(schema.quizAnswers).values(
    picks.map((p) => ({
      attemptId: attempt.id,
      questionId: p.id,
      selectedOptionId: null,
      isCorrect: false,
    })),
  );

  await db.insert(schema.activityLog).values({
    userId: session.user.id,
    eventType: "quiz_start",
    entityId: attempt.id,
  });

  return { ok: true, attemptId: attempt.id };
}

const submitInput = z.object({
  attemptId: z.string().min(1),
  // map of questionId -> selectedOptionId
  answers: z.record(z.string(), z.string().nullable()),
  timeSpentSeconds: z.number().int().min(0).max(60 * 60 * 4).optional(),
});

export async function submitQuizAttempt(input: z.input<typeof submitInput>): Promise<
  { ok: true; attemptId: string } | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "يجب تسجيل الدخول أولاً" };

  const parsed = submitInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "بيانات غير صحيحة" };
  const { attemptId, answers, timeSpentSeconds } = parsed.data;

  const [attempt] = await db
    .select()
    .from(schema.quizAttempts)
    .where(eq(schema.quizAttempts.id, attemptId));
  if (!attempt) return { ok: false, error: "المحاولة غير موجودة" };
  if (attempt.userId !== session.user.id)
    return { ok: false, error: "غير مصرّح" };
  if (attempt.completedAt) return { ok: true, attemptId };

  // load correct options for all the attempt's questions
  const attemptAnswers = await db
    .select()
    .from(schema.quizAnswers)
    .where(eq(schema.quizAnswers.attemptId, attemptId));

  const questionIds = attemptAnswers.map((a) => a.questionId);
  const allOptions = questionIds.length
    ? await db.select().from(schema.questionOptions)
    : [];
  const correctByQ = new Map<string, string>();
  const optionQById = new Map<string, string>();
  for (const o of allOptions) {
    optionQById.set(o.id, o.questionId);
    if (o.isCorrect) correctByQ.set(o.questionId, o.id);
  }

  let correct = 0;
  for (const row of attemptAnswers) {
    const sel = answers[row.questionId] ?? null;
    // ensure the selected option actually belongs to this question
    const belongs = sel ? optionQById.get(sel) === row.questionId : false;
    const finalSel = belongs ? sel : null;
    const isCorrect = !!finalSel && correctByQ.get(row.questionId) === finalSel;
    if (isCorrect) correct++;
    await db
      .update(schema.quizAnswers)
      .set({ selectedOptionId: finalSel, isCorrect })
      .where(eq(schema.quizAnswers.id, row.id));
  }

  const scorePercent = attemptAnswers.length
    ? Math.round((correct / attemptAnswers.length) * 1000) / 10
    : 0;

  await db
    .update(schema.quizAttempts)
    .set({
      correctCount: correct,
      scorePercent,
      timeSpentSeconds: timeSpentSeconds ?? null,
      completedAt: new Date(),
    })
    .where(eq(schema.quizAttempts.id, attemptId));

  await db.insert(schema.activityLog).values({
    userId: session.user.id,
    eventType: "quiz_complete",
    entityId: attemptId,
    metadata: { score: scorePercent, correct, total: attemptAnswers.length },
  });

  revalidatePath("/history");
  revalidatePath(`/quiz/${attempt.unitId}/results/${attemptId}`);
  return { ok: true, attemptId };
}
