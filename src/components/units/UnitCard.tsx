import Link from "next/link";
import type { Unit } from "@/lib/db/schema";
import { UnitIcon } from "@/components/brand/UnitIcon";
import { UNIT_TAGLINE_AR, resolveUnitIconKey } from "@/lib/units";

type Props = {
  unit: Unit;
  fileCount?: number;
};

export function UnitCard({ unit, fileCount }: Props) {
  const iconKey = resolveUnitIconKey(unit);
  return (
    <Link
      href={`/unit/${unit.id}`}
      className="card card-accent-top group flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-default)] bg-[var(--romi-navy)]/8 text-[var(--romi-navy)] transition-colors group-hover:bg-[var(--romi-navy)] group-hover:text-[var(--romi-gold)]">
          <UnitIcon iconKey={iconKey} size={28} />
        </div>
        <span className="font-latin text-[11px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
          Unit {unit.number}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-[var(--romi-gold-dark)]">
          {UNIT_TAGLINE_AR[iconKey]}
        </p>
        <h3 className="font-display text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--romi-navy)]">
          {unit.nameAr}
        </h3>
      </div>

      {typeof fileCount === "number" && (
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-[var(--text-muted)]">
          <span>{fileCount} ملف</span>
          <span className="text-[var(--romi-gold-dark)]">استعراض ←</span>
        </div>
      )}
    </Link>
  );
}
