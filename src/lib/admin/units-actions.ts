"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

const unitInput = z.object({
  id: z.string().optional(),
  semesterId: z.string().min(1, "الفصل الدراسي مطلوب"),
  number: z.coerce.number().int().min(1, "رقم الوحدة مطلوب"),
  nameAr: z.string().trim().min(2, "الاسم قصير جداً"),
  nameEn: z.string().trim().min(2, "الاسم الإنجليزي قصير جداً"),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0),
  iconKey: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type UnitFormState = { ok: true } | { ok: false; error: string } | null;

export async function saveUnit(_prev: UnitFormState, fd: FormData): Promise<UnitFormState> {
  await requireAdmin();
  const raw = Object.fromEntries(fd.entries());
  const parsed = unitInput.safeParse({
    ...raw,
    isPublished: raw.isPublished === "on" || raw.isPublished === "true",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const { id, ...data } = parsed.data;
  if (id) {
    await db.update(schema.units).set(data).where(eq(schema.units.id, id));
  } else {
    await db.insert(schema.units).values(data);
  }
  revalidatePath("/admin/units");
  revalidatePath("/dashboard");
  revalidatePath(`/semester/${data.semesterId}`);
  return { ok: true };
}

export async function toggleUnitPublished(id: string): Promise<void> {
  await requireAdmin();
  const [row] = await db.select().from(schema.units).where(eq(schema.units.id, id));
  if (!row) return;
  await db
    .update(schema.units)
    .set({ isPublished: !row.isPublished })
    .where(eq(schema.units.id, id));
  revalidatePath("/admin/units");
  revalidatePath("/dashboard");
}

export async function deleteUnit(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    await db.delete(schema.units).where(eq(schema.units.id, id));
  } catch {
    return { ok: false, error: "لا يمكن حذف الوحدة — أزل الملفّات والأسئلة أولاً" };
  }
  revalidatePath("/admin/units");
  return { ok: true };
}
