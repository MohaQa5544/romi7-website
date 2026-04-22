"use client";

import { useEffect, useState, useTransition } from "react";
import { Upload, X, Loader2, Youtube } from "lucide-react";
import { uploadFile, addVideoLesson } from "@/lib/admin/files-actions";
import type { Unit } from "@/lib/db/schema";

type Props = { units: Unit[] };

const TYPE_OPTIONS = [
  { value: "question_bank", label: "بنك الأسئلة" },
  { value: "answer_key", label: "حل بنك الأسئلة" },
  { value: "exam", label: "الاختبارات" },
  { value: "exam_solution", label: "حل الاختبارات" },
  { value: "review", label: "مراجعة" },
  { value: "video", label: "فيديوهات شرح" },
];

const MAX_BYTES = 50 * 1024 * 1024;

export function FileUploadDialog({ units }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>("question_bank");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const isVideo = type === "video";

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function reset() {
    setFile(null);
    setError(null);
    setType("question_bank");
  }

  function handleSubmit(fd: FormData) {
    setError(null);

    // Sync controlled type into FormData (the Field select is uncontrolled)
    fd.set("type", type);

    if (isVideo) {
      start(async () => {
        try {
          const result = await addVideoLesson(fd);
          if (!result.ok) {
            setError(result.error ?? "فشل الحفظ");
            return;
          }
          setOpen(false);
          reset();
        } catch (err) {
          setError(err instanceof Error ? err.message : "فشل الحفظ");
        }
      });
      return;
    }

    if (!file) {
      setError("اختر ملف PDF أولاً");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("الحجم الأقصى 50 ميغا");
      return;
    }
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("يجب أن يكون PDF");
      return;
    }

    fd.set("file", file);

    start(async () => {
      try {
        const result = await uploadFile(fd);
        if (!result.ok) {
          setError(result.error ?? "فشل الرفع");
          return;
        }
        setOpen(false);
        reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل الرفع");
      }
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-gold text-sm">
        <Upload size={14} className="me-1.5 inline" /> رفع ملف
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center bg-[color-mix(in_oklab,#000_55%,transparent)] p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !pending && (setOpen(false), reset())}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="my-4 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {isVideo ? "إضافة فيديو شرح" : "رفع ملف جديد"}
              </h2>
              <button
                type="button"
                onClick={() => !pending && (setOpen(false), reset())}
                aria-label="إغلاق"
                className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              >
                <X size={16} />
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              {/* Type selector first — drives the rest of the form */}
              <div className="space-y-1">
                <label htmlFor="type" className="block text-xs font-medium text-[var(--text-secondary)]">
                  نوع المحتوى
                </label>
                <select
                  id="type"
                  name="type"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setError(null);
                  }}
                  className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30"
                  required
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {isVideo ? (
                <div className="space-y-1">
                  <label htmlFor="youtubeUrl" className="block text-xs font-medium text-[var(--text-secondary)]">
                    رابط فيديو يوتيوب
                  </label>
                  <div className="relative">
                    <Youtube
                      size={14}
                      className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#DC2626]"
                    />
                    <input
                      id="youtubeUrl"
                      name="youtubeUrl"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      dir="ltr"
                      className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 pe-9 text-sm outline-none transition-colors focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    انسخ رابط الفيديو من يوتيوب — يدعم: youtube.com/watch?v=…، youtu.be/…، /shorts/…
                  </p>
                </div>
              ) : (
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                    ملف PDF (الحد الأقصى 50 ميغا)
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f);
                      setError(null);
                    }}
                    className="block w-full cursor-pointer rounded-[var(--radius-default)] border border-dashed border-[var(--border-default)] bg-[var(--surface-1)] p-3 text-sm text-[var(--text-secondary)] file:me-3 file:rounded-[var(--radius-default)] file:border-0 file:bg-[var(--romi-navy)] file:px-3 file:py-1.5 file:text-white hover:border-[var(--romi-gold)]"
                  />
                  {file && (
                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                      {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </label>
              )}

              <Field
                label={isVideo ? "عنوان الفيديو (مثال: 2.3 قواعد الاشتقاق)" : "عنوان الملف"}
                name="titleAr"
              />

              <div className={isVideo ? "" : "grid grid-cols-2 gap-3"}>
                <Field
                  label="الوحدة"
                  name="unitId"
                  type="select"
                  defaultValue={units[0]?.id}
                  options={units.map((u) => ({
                    value: u.id,
                    label: `${u.number}. ${u.nameAr}`,
                  }))}
                />
                {!isVideo && (
                  <Field
                    label="رقم الاختبار (اختياري)"
                    name="examNumber"
                    type="number"
                  />
                )}
              </div>

              {pending && (
                <div className="flex items-center gap-2 rounded-[var(--radius-default)] border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3 py-2.5 text-xs text-[var(--text-secondary)]">
                  <Loader2 size={14} className="animate-spin text-[var(--romi-gold-dark)]" />
                  {isVideo ? "جاري الحفظ…" : "جاري رفع الملف وحفظه…"}
                </div>
              )}

              {error && (
                <p className="rounded-[var(--radius-default)] border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-3 py-2 text-xs text-[var(--danger)]">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => (setOpen(false), reset())}
                  className="btn-outline text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={pending || (!isVideo && !file)}
                  className="btn-gold text-sm"
                >
                  {pending && <Loader2 size={14} className="me-1.5 inline animate-spin" />}
                  {isVideo ? "حفظ الفيديو" : "رفع وحفظ"}
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
}: {
  label: string;
  name: string;
  type?: "text" | "number" | "select";
  defaultValue?: string;
  options?: { value: string; label: string }[];
}) {
  const base =
    "block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--romi-gold)] focus:ring-2 focus:ring-[var(--romi-gold)]/30";
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      {type === "select" ? (
        <select id={name} name={name} defaultValue={defaultValue} className={base} required>
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
