import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <LogoMark size={80} />
      <div>
        <p className="font-latin text-6xl font-bold text-[var(--romi-navy)]">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-[var(--text-primary)]">
          الصفحة غير موجودة
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          ربما تم نقل هذه الصفحة أو لم تعد متاحة.
        </p>
      </div>
      <Link href="/" className="btn-gold">العودة إلى الرئيسية</Link>
    </div>
  );
}
