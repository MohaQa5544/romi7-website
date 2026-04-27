"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, RotateCcw, ChevronDown, Loader2 } from "lucide-react";

type Option = { id: string; label: string };

type Props = {
  semesters: Option[];
  units: Option[];
  types: Option[];
  mockTypes?: Option[];
  mockUnitKey?: string;
  defaults: { q: string; semester: string; unit: string; type: string };
};

export function FileSearchFilters({
  semesters,
  units,
  types,
  mockTypes = [],
  mockUnitKey = "__mock__",
  defaults,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  const [q, setQ] = useState(defaults.q);
  const [semester, setSemester] = useState(defaults.semester);
  const [unit, setUnit] = useState(defaults.unit);
  const [type, setType] = useState(defaults.type);

  // When semester changes, reset unit unless the current unit is valid for that semester.
  const unitsForSem = units.filter(() => true); // `units` is already filtered by the server based on URL `semester`

  const isMock = unit === mockUnitKey;
  const activeTypes = isMock ? mockTypes : types;

  function onSemesterChange(next: string) {
    setSemester(next);
    // the server will refilter units — but on client, reset until the next page load
    if (next !== semester) setUnit("");
  }

  function onUnitChange(next: string) {
    setUnit(next);
    // Switching between mock and regular units — the type lists differ, so reset
    // the selected type to avoid leaving an invalid selection in the URL.
    const wasMock = unit === mockUnitKey;
    const willBeMock = next === mockUnitKey;
    if (wasMock !== willBeMock) setType("");
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams(sp.toString());
    const set = (k: string, v: string) => (v ? params.set(k, v) : params.delete(k));
    set("q", q.trim());
    set("semester", semester);
    set("unit", unit);
    set("type", type);
    start(() => router.push(`/files?${params.toString()}`));
  }

  function reset() {
    setQ("");
    setSemester("");
    setUnit("");
    setType("");
    start(() => router.push("/files"));
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-3 shadow-sm sm:p-4"
    >
      <div className="flex flex-wrap items-stretch gap-2">
        {/* Semester — also applies to mock exams (each book has its own mock exams) */}
        <DropdownSelect
          value={semester}
          onChange={onSemesterChange}
          placeholder="الفصل الدراسي"
          options={semesters}
        />
        {/* Unit */}
        <DropdownSelect
          value={unit}
          onChange={onUnitChange}
          placeholder="الوحدة"
          options={unitsForSem}
          disabled={unitsForSem.length === 0}
        />
        {/* Type — switches between regular types and the two mock-exam options */}
        <DropdownSelect
          value={type}
          onChange={setType}
          placeholder={isMock ? "محلول / غير محلول" : "نوع المحتوى"}
          options={activeTypes}
        />

        {/* Text search */}
        <label className="relative flex-1 min-w-[180px]">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3 text-[var(--text-muted)]"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في العناوين…"
            type="search"
            className="block h-11 w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 pe-9 text-sm outline-none focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30"
          />
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="btn-gold inline-flex h-11 min-w-[84px] items-center justify-center gap-1.5 rounded-[var(--radius-default)] text-sm"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          بحث
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={reset}
          disabled={pending}
          aria-label="إعادة ضبط"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] text-[var(--text-muted)] hover:border-[var(--romi-gold)] hover:text-[var(--text-primary)]"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </form>
  );
}

function DropdownSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative min-w-[160px] flex-1 sm:max-w-[220px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-11 w-full appearance-none rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 pe-8 text-sm outline-none transition-colors focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30 disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-2.5 text-[var(--text-muted)]"
      />
    </div>
  );
}
