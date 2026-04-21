import { asc, eq, inArray } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { QuizRunner } from "@/components/quiz/QuizRunner";

export const metadata = { title: "اختبار جارٍ" };

export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ unitId: string; attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { unitId, attemptId } = await params;

  const [attempt] = await db
    .select()
    .from(schema.quizAttempts)
    .where(eq(schema.quizAttempts.id, attemptId));
  if (!attempt) notFound();
  if (attempt.userId !== session.user.id) redirect("/dashboard");
  if (attempt.unitId !== unitId) notFound();

  if (attempt.completedAt) {
    redirect(`/quiz/${unitId}/results/${attemptId}`);
  }

  const [unit] = await db.select().from(schema.units).where(eq(schema.units.id, unitId));
  if (!unit) notFound();

  // attempt's snapshotted questions
  const answerRows = await db
    .select()
    .from(schema.quizAnswers)
    .where(eq(schema.quizAnswers.attemptId, attemptId));

  const qIds = answerRows.map((a) => a.questionId);
  if (qIds.length === 0) redirect(`/quiz/${unitId}`);

  const questions = await db
    .select()
    .from(schema.questions)
    .where(inArray(schema.questions.id, qIds));

  const options = await db
    .select()
    .from(schema.questionOptions)
    .where(inArray(schema.questionOptions.questionId, qIds))
    .orderBy(asc(schema.questionOptions.order));

  const byQ = new Map<string, typeof options>();
  for (const o of options) {
    const arr = byQ.get(o.questionId) ?? [];
    arr.push(o);
    byQ.set(o.questionId, arr);
  }

  // preserve snapshot order (row insertion order)
  const orderedQuestions = answerRows
    .map((r) => {
      const q = questions.find((x) => x.id === r.questionId);
      if (!q) return null;
      return {
        id: q.id,
        text: q.questionText,
        options: (byQ.get(q.id) ?? []).map((o) => ({ id: o.id, text: o.optionText })),
      };
    })
    .filter((x): x is { id: string; text: string; options: { id: string; text: string }[] } => !!x);

  return (
    <QuizRunner
      unitId={unitId}
      unitName={unit.nameAr}
      attemptId={attemptId}
      questions={orderedQuestions}
    />
  );
}
