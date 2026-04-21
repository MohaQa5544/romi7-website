"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  compact?: boolean;
};

export function AdminSidebarLink({ href, label, icon, exact, compact }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const base = compact
    ? "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-default)] px-3 py-1.5 text-xs font-medium transition-colors"
    : "flex items-center gap-2.5 rounded-[var(--radius-default)] px-3 py-2 text-sm font-medium transition-colors";
  const activeCls = "bg-[var(--romi-navy)] text-white hover:bg-[var(--romi-navy-light)]";
  const idleCls =
    "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]";

  return (
    <Link href={href} className={`${base} ${active ? activeCls : idleCls}`}>
      <span className={active ? "text-[var(--romi-gold)]" : "text-[var(--text-muted)]"}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
