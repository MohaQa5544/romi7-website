import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "البريد الإلكتروني مطلوب" })
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صحيح"),
  password: z
    .string({ required_error: "كلمة المرور مطلوبة" })
    .min(1, "كلمة المرور مطلوبة"),
  remember: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z
      .string({ required_error: "الاسم مطلوب" })
      .trim()
      .min(2, "الاسم قصير جداً")
      .max(80, "الاسم طويل جداً"),
    email: z
      .string({ required_error: "البريد الإلكتروني مطلوب" })
      .trim()
      .toLowerCase()
      .email("البريد الإلكتروني غير صحيح"),
    password: z
      .string({ required_error: "كلمة المرور مطلوبة" })
      .min(8, "يجب أن تكون كلمة المرور ٨ أحرف على الأقل"),
    confirmPassword: z.string({ required_error: "تأكيد كلمة المرور مطلوب" }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof signupSchema>;
