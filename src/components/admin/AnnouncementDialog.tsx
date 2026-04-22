"use client";

import { useEffect, useState, useActionState } from "react";
import { Pencil, Plus, X, Loader2 } from "lucide-react";
import {
  saveAnnouncement,
  type AnnouncementFormState,
} from "@/lib/admin/announcements-actions";

type Announcement = {
  id: string;
  titleAr: string;
  bodyAr: string;
  severity: "info" | "success" | "warning" | "urgent";
  isPinned: boolean;
  isPublished: boolean;
};

type Props = { announcement?: Announcement; trigger?: "add" | "edit" };

export function AnnouncementDialog({ announcement, trigger = "add" }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AnnouncementFormState, FormData>(
    saveAnnouncement,
    null,
  );

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {trigger === "add" ? (
        <button type="button" onClick={() => setOpen(true)} className="btn-gold text-sm">
          <Plus size={14} className="me-1.5 inline" /> إعلان جديد
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

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center bg-[color-mix(in_oklab,#000_55%,transparent)] p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="my-4 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {announcement ? "تعديل إعلان" : "إعلان جديد"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              >
                <X size={16} />
              </button>
            </div>

            <form action={action} className="space-y-4">
              {announcement && <input type="hidden" name="id" value={announcement.id} />}

              <Field label="العنوان" name="titleAr" defaultValue={announcement?.titleAr} />
              <Field
                label="النصّ"
                name="bodyAr"
                type="textarea"
                defaultValue={announcement?.bodyAr}
                rows={5}
              />
              <Field
                label="الأهمّيّة"
                name="severity"
                type="select"
                defaultValue={announcement?.severity ?? "info"}
                options={[
                  { value: "info", label: "إعلان عامّ" },
                  { value: "success", label: "خبر سارّ" },
                  { value: "warning", label: "تنبيه" },
                  { value: "urgent", label: "عاجل" },
                ]}
              />

              <div className="flex gap-5">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isPinned"
                    defaultChecked={announcement?.isPinned ?? false}
                    className="h-4 w-4 rounded border-[var(--border-default)]"
                  />
                  مثبّت في الصفحة الرئيسية
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={announcement?.isPublished ?? true}
                    className="h-4 w-4 rounded border-[var(--border-default)]"
                  />
                  منشور
                </label>
              </div>

              {state && !state.ok && (
                <p className="rounded-[var(--radius-default)] border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-3 py-2 text-xs text-[var(--danger)]">
                  {state.error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-outline text-sm"
                >
                  إلغاء
                </button>
                <button type="submit" disabled={pending} className="btn-gold text-sm">
                  {pending && <Loader2 size={14} className="me-1.5 inline animate-spin" />}
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  options,
  rows = 2,
}: {
  label: string;
  name: string;
  type?: "text" | "textarea" | "select";
  defaultValue?: string;
  options?: { value: string; label: string }[];
  rows?: number;
}) {
  const base =
    "block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30";
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} className={base} />
      ) : type === "select" ? (
        <select id={name} name={name} defaultValue={defaultValue} className={base}>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input id={name} name={name} type={type} defaultValue={defaultValue} className={base} />
      )}
    </div>
  );
}
