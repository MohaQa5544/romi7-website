"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import Image from "next/image";
import { Pencil, Plus, Loader2, ImagePlus, X } from "lucide-react";
import {
  saveAnnouncement,
  type AnnouncementFormState,
} from "@/lib/admin/announcements-actions";
import { DialogShell } from "./DialogShell";

type Announcement = {
  id: string;
  titleAr: string;
  bodyAr: string | null;
  imageUrl: string | null;
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

  // Image picker state — kept in React so we can show a live preview
  // and let the admin remove an existing image without uploading a new one.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [pickedPreview, setPickedPreview] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      setPickedFile(null);
      setPickedPreview(null);
      setRemoveExisting(false);
    }
  }, [state]);

  // Build/teardown an object URL for the picked file so the user sees a preview.
  useEffect(() => {
    if (!pickedFile) {
      setPickedPreview(null);
      return;
    }
    const url = URL.createObjectURL(pickedFile);
    setPickedPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pickedFile]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setPickedFile(f);
    if (f) setRemoveExisting(false); // picking a new file overrides "remove"
  }

  function clearPicked() {
    setPickedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // What the user currently "sees" as the announcement's image:
  const showingExisting =
    !!announcement?.imageUrl && !pickedFile && !removeExisting;
  const showingPicked = !!pickedPreview;

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
        <form id={formId} action={action} className="space-y-4" encType="multipart/form-data">
          {announcement && <input type="hidden" name="id" value={announcement.id} />}
          {removeExisting && <input type="hidden" name="removeImage" value="on" />}

          <Field label="العنوان" name="titleAr" defaultValue={announcement?.titleAr} />
          <Field
            label="النصّ (اختياري — يمكن أن يكون الإعلان صورة فقط)"
            name="bodyAr"
            type="textarea"
            defaultValue={announcement?.bodyAr ?? ""}
            rows={5}
          />

          {/* Image picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              صورة (اختيارية)
            </label>

            {(showingExisting || showingPicked) && (
              <div className="relative inline-block max-w-full overflow-hidden rounded-[var(--radius-default)] border border-[var(--border-default)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    showingPicked
                      ? pickedPreview!
                      : `/api/announcement-image/${announcement!.id}`
                  }
                  alt="معاينة الصورة"
                  className="block h-auto max-h-64 w-auto max-w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (showingPicked) {
                      clearPicked();
                    } else {
                      setRemoveExisting(true);
                    }
                  }}
                  aria-label="إزالة الصورة"
                  className="absolute end-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                  <X size={14} />
                </button>
                {showingPicked && (
                  <span className="absolute bottom-1.5 start-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                    جديد — لم يُحفَظ بعد
                  </span>
                )}
              </div>
            )}

            <label className="block">
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={onPickFile}
                className="hidden"
              />
              <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-default)] border border-dashed border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--romi-gold)] hover:text-[var(--text-primary)]">
                <ImagePlus size={14} />
                {showingExisting || showingPicked ? "استبدال الصورة" : "إضافة صورة"}
              </span>
            </label>
            <p className="text-[11px] text-[var(--text-muted)]">
              JPG / PNG / WebP / GIF — الحد الأقصى 8 ميغا.
            </p>
          </div>

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
