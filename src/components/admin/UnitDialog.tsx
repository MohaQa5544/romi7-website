"use client";

import { useEffect, useState, useActionState } from "react";
import { Pencil, Plus, Loader2 } from "lucide-react";
import { saveUnit, type UnitFormState } from "@/lib/admin/units-actions";
import type { Semester, Unit } from "@/lib/db/schema";
import { DialogShell } from "./DialogShell";

type Props = {
  semesters: Semester[];
  unit?: Unit;
  trigger?: "add" | "edit";
};

export function UnitDialog({ semesters, unit, trigger = "add" }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<UnitFormState, FormData>(saveUnit, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  const formId = "unit-form";

  return (
    <>
      {trigger === "add" ? (
        <button type="button" onClick={() => setOpen(true)} className="btn-gold text-sm">
          <Plus size={14} className="me-1.5 inline" /> وحدة جديدة
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="تعديل"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-default)] border border-[var(--border-default)] text-[var(--text-secondary)] transition-colors hover:border-[var(--romi-gold)] hover:text-[var(--text-primary)]"
        >
          <Pencil size={14} />
        </button>
      )}

      <DialogShell
        open={open}
        onClose={() => setOpen(false)}
        title={unit ? "تعديل الوحدة" : "وحدة جديدة"}
        size="lg"
        busy={pending}
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="btn-outline text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form={formId}
              disabled={pending}
              className="btn-gold text-sm"
            >
              {pending && <Loader2 size={14} className="me-1.5 inline animate-spin" />}
              حفظ
            </button>
          </>
        }
      >
        <form id={formId} action={action} className="space-y-4">
          {unit && <input type="hidden" name="id" value={unit.id} />}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="الفصل الدراسي"
              name="semesterId"
              type="select"
              defaultValue={unit?.semesterId ?? semesters[0]?.id}
              options={semesters.map((s) => ({ value: s.id, label: s.nameAr }))}
            />
            <FormField
              label="رقم الوحدة"
              name="number"
              type="number"
              defaultValue={unit?.number}
            />
          </div>

          <FormField label="الاسم بالعربية" name="nameAr" defaultValue={unit?.nameAr} />
          <FormField
            label="الاسم بالإنجليزية"
            name="nameEn"
            defaultValue={unit?.nameEn}
            dir="ltr"
          />
          <FormField
            label="الوصف"
            name="description"
            type="textarea"
            defaultValue={unit?.description ?? ""}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="الترتيب"
              name="order"
              type="number"
              defaultValue={unit?.order ?? 0}
            />
            <FormField
              label="أيقونة"
              name="iconKey"
              type="select"
              defaultValue={unit?.iconKey ?? "generic"}
              options={[
                { value: "integration", label: "تكامل" },
                { value: "applications", label: "تطبيقات" },
                { value: "vectors", label: "متّجهات" },
                { value: "complex", label: "أعداد مركّبة" },
                { value: "generic", label: "عامّ" },
              ]}
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={unit?.isPublished ?? true}
              className="h-4 w-4 rounded border-[var(--border-default)]"
            />
            منشور للطلّاب
          </label>

          {state && !state.ok && (
            <p className="rounded-[var(--radius-default)] border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-3 py-2 text-xs text-[var(--danger)]">
              {state.error}
            </p>
          )}
        </form>
      </DialogShell>
    </>
  );
}

function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  options,
  dir,
}: {
  label: string;
  name: string;
  type?: "text" | "number" | "textarea" | "select";
  defaultValue?: string | number;
  options?: { value: string; label: string }[];
  dir?: "ltr" | "rtl";
}) {
  const base =
    "block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30";
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea id={name} name={name} rows={2} defaultValue={defaultValue} className={base} />
      ) : type === "select" ? (
        <select id={name} name={name} defaultValue={defaultValue as string} className={base}>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          dir={dir}
          defaultValue={defaultValue}
          className={base}
        />
      )}
    </div>
  );
}
