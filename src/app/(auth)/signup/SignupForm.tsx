"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signupAction } from "@/lib/auth/actions";

export function SignupForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  async function handleSubmit(fd: FormData) {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await signupAction({
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
        confirmPassword: String(fd.get("confirmPassword") ?? ""),
      });
      if (result.ok) {
        router.push("/dashboard");
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
        <div
          role="alert"
          className="rounded-[var(--radius-default)] border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-4 py-3 text-sm text-[var(--danger)]"
        >
          {error}
        </div>
      )}

      <Field
        label="الاسم الكامل"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="إبراهيم رميح"
        error={fieldErrors.name}
        required
      />

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

      <PasswordField
        label="كلمة المرور"
        name="password"
        autoComplete="new-password"
        show={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
        error={fieldErrors.password}
      />

      <PasswordField
        label="تأكيد كلمة المرور"
        name="confirmPassword"
        autoComplete="new-password"
        show={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        error={fieldErrors.confirmPassword}
      />

      <button
        type="submit"
        disabled={pending}
        className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        إنشاء الحساب
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

function PasswordField({
  label,
  name,
  autoComplete,
  show,
  onToggle,
  error,
}: {
  label: string;
  name: string;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-4 py-2.5 pe-11 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30"
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 end-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          tabIndex={-1}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
