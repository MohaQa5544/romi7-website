import { auth } from "@/lib/auth/config";
import { UserCircle2 } from "lucide-react";

export const metadata = { title: "حسابي" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">حسابي</h1>
        <p className="text-sm text-[var(--text-secondary)]">بياناتك الأساسية.</p>
      </header>

      <div className="card flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--romi-navy)]">
          <UserCircle2 size={32} />
        </div>
        <div className="space-y-0.5">
          <p className="font-display text-lg font-semibold text-[var(--text-primary)]">
            {session.user.name}
          </p>
          <p className="text-sm text-[var(--text-secondary)]" dir="ltr">
            {session.user.email}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {session.user.role === "admin" ? "مشرف" : "طالب"}
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-5 text-sm text-[var(--text-muted)]">
        تعديل البيانات وتغيير كلمة المرور سيكون متاحاً قريباً.
      </div>
    </div>
  );
}
