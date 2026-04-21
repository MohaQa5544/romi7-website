"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { db, schema } from "@/lib/db";
import { signIn } from "@/lib/auth/config";
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/auth/validation";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };

export async function loginAction(raw: LoginInput, callbackUrl?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
    );
    return { ok: false, error: "البيانات غير صحيحة", fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }
    // NEXT_REDIRECT is thrown by next/navigation.redirect; let it propagate
    throw err;
  }
}

export async function signupAction(raw: SignupInput): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors = Object.fromEntries(
      Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ""])
    );
    return { ok: false, error: "يرجى تصحيح الأخطاء", fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = (
    await db.select().from(schema.users).where(eq(schema.users.email, email))
  )[0];
  if (existing) {
    return {
      ok: false,
      error: "هذا البريد مسجّل بالفعل",
      fieldErrors: { email: "هذا البريد مسجّل بالفعل" },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [inserted] = await db
    .insert(schema.users)
    .values({ name, email, passwordHash, role: "student" })
    .returning();

  await db
    .insert(schema.activityLog)
    .values({ userId: inserted.id, eventType: "signup" })
    .catch(() => {});

  try {
    await signIn("credentials", { email, password, redirect: false });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: "تم إنشاء الحساب، لكن تعذّر تسجيل الدخول تلقائياً. سجّل الدخول يدوياً." };
    }
    throw err;
  }
}
