/**
 * One-shot migration: collapse legacy file types (summary/update/other)
 * into the 4 canonical categories: question_bank, answer_key, exam, exam_solution.
 *
 * Heuristic: default legacy rows → question_bank, since most legacy rows
 * (summaries, updates, misc) sit alongside the main question bank. Admin
 * can reclassify individual files afterward in /admin/files.
 *
 * Run: npm run db:migrate-file-types
 */
import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function main() {
  // Read current distribution
  const before = await db.all(
    sql`SELECT type, COUNT(*) as n FROM files GROUP BY type`,
  );
  console.log("Before:", before);

  const result = await db.run(
    sql`UPDATE files SET type = 'question_bank', updated_at = ${Math.floor(Date.now() / 1000)}
        WHERE type NOT IN ('question_bank', 'answer_key', 'exam', 'exam_solution')`,
  );
  console.log("Rows migrated:", result.rowsAffected);

  const after = await db.all(
    sql`SELECT type, COUNT(*) as n FROM files GROUP BY type`,
  );
  console.log("After:", after);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
