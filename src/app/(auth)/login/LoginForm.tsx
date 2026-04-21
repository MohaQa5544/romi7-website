"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction } from "@/lib/auth/actions";

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export function LoginForm({ searchParams }: Props) {
  const { callbackUrl } = use(searchParams);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  async function handleSubmit(fd: FormData) {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await loginAction(
        {
          email: String(fd.get("email") ?? ""),
          password: String(fd.get("password") ?? ""),
          remember: fd.get("remember") === "on",
        },
        callbackUrl,
      );
      if (result.ok) {
        router.push(callbackUrl ?? "/dashboard");
        router.refresh();
      } else {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div role="alert" className="rounded-[var(--radius-default)] border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <Field
        label="البريد الإلكتروني"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="romih@example.com"
        error={fieldErrors.email}
        required
        dir="ltr"
      />

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)]">
          كلمة المرور
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-4 py-2.5 pe-11 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30"
            aria-invalid={!!fieldErrors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 end-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-xs text-[var(--danger)]">{fieldErrors.password}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[var(--text-secondary)]">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--romi-gold-dark)] focus:ring-[var(--romi-gold)]"
          />
          تذكرني
        </label>
        <span className="cursor-not-allowed text-[var(--text-muted)]" aria-disabled>
          نسيت كلمة المرور؟
        </span>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        تسجيل الدخول
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  error,
  required,
  dir,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        dir={dir}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30"
        aria-invalid={!!error}
      />
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
