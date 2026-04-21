import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "إنشاء حساب" };

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          إنشاء حساب جديد
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          انضمّ إلى طلاب الأستاذ رميح وابدأ رحلتك نحو التفوّق.
        </p>
      </header>

      <SignupForm />

      <p className="text-center text-sm text-[var(--text-secondary)]">
        لديك حساب بالفعل؟{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--romi-navy)] underline decoration-[var(--romi-gold)] decoration-2 underline-offset-4 hover:text-[var(--romi-navy-light)]"
        >
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}
