"use client";

import { useEffect, useState, useActionState } from "react";
import { Pencil, Plus, Loader2 } from "lucide-react";
import {
  saveAnnouncement,
  type AnnouncementFormState,
} from "@/lib/admin/announcements-actions";
import { DialogShell } from "./DialogShell";

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

  const formId = "announcement-form";

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

      <DialogShell
        open={open}
        onClose={() => setOpen(false)}
        title={announcement ? "تعديل إعلان" : "إعلان جديد"}
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

          <div className="flex flex-wrap gap-5">
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
        </form>
      </DialogShell>
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
