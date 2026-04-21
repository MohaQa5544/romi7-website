import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "تسجيل الدخول" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          تسجيل الدخول
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          أدخل بياناتك للوصول إلى مكتبتك واختباراتك.
        </p>
      </header>

      <LoginForm searchParams={searchParams} />

      <p className="text-center text-sm text-[var(--text-secondary)]">
        لا تملك حساباً؟{" "}
        <Link href="/signup" className="font-semibold text-[var(--romi-navy)] underline decoration-[var(--romi-gold)] decoration-2 underline-offset-4 hover:text-[var(--romi-navy-light)]">
          أنشئ حساباً جديداً
        </Link>
      </p>
    </div>
  );
}
