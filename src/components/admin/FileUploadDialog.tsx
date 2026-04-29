"use client";

import { useState, useTransition } from "react";
import { Upload, Loader2, Youtube } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { addVideoLesson, registerUploadedFile } from "@/lib/admin/files-actions";
import type { Unit } from "@/lib/db/schema";
import { DialogShell } from "./DialogShell";

type SemesterOpt = { id: string; nameAr: string };
type Props = { units: Unit[]; semesters: SemesterOpt[] };

const TYPE_OPTIONS = [
  { value: "question_bank", label: "بنك الأسئلة" },
  { value: "answer_key", label: "حل بنك الأسئلة" },
  { value: "exam", label: "الاختبارات" },
  { value: "exam_solution", label: "حل الاختبارات" },
  { value: "review", label: "مراجعة" },
  { value: "video", label: "فيديوهات شرح" },
  { value: "mock_exam", label: "اختبار تجريبي — غير محلول" },
  { value: "mock_exam_solution", label: "اختبار تجريبي — محلول" },
];

const MOCK_TYPES = new Set(["mock_exam", "mock_exam_solution"]);

const MAX_BYTES = 50 * 1024 * 1024;

export function FileUploadDialog({ units, semesters }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>("question_bank");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const isVideo = type === "video";
  const isMock = MOCK_TYPES.has(type);
  const formId = "file-upload-form";

  function reset() {
    setFile(null);
    setError(null);
    setType("question_bank");
  }

  function close() {
    if (pending) return;
    setOpen(false);
    reset();
  }

  function handleSubmit(fd: FormData) {
    setError(null);
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

    // Read everything we need from the form BEFORE the async work — once
    // the transition starts the synthetic event/FormData can be reset.
    const titleAr = String(fd.get("titleAr") ?? "").trim();
    const unitId = isMock ? null : String(fd.get("unitId") ?? "");
    const semesterId = isMock ? String(fd.get("semesterId") ?? "") : null;
    const examNumberRaw = String(fd.get("examNumber") ?? "").trim();
    const safeName = file.name.replace(/[^\w؀-ۿ.\-]+/g, "_");

    start(async () => {
      try {
        // Direct browser → Vercel Blob upload. Bypasses Vercel's 4.5 MB
        // body limit on serverless functions because the file body never
        // touches our server action.
        const blob = await upload(`admin/${Date.now()}-${safeName}`, file, {
          // The Vercel Blob store on this project is configured as private —
          // passing "public" causes the upload to hang silently against the
          // private store. Mirrors the existing put() call in uploadFile().
          access: "private",
          handleUploadUrl: "/api/admin/blob-upload-token",
          contentType: "application/pdf",
          multipart: true,
        });

        // Now record the upload in the DB — this is a small JSON-only call.
        const result = await registerUploadedFile({
          unitId,
          semesterId,
          titleAr,
          type: type as
            | "question_bank"
            | "answer_key"
            | "exam"
            | "exam_solution"
            | "review"
            | "video"
            | "mock_exam"
            | "mock_exam_solution",
          examNumber: examNumberRaw ? Number(examNumberRaw) : null,
          blobUrl: blob.url,
          sizeBytes: file.size,
        });
        if (!result.ok) {
          setError(result.error ?? "فشل حفظ بيانات الملف");
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

      <DialogShell
        open={open}
        onClose={close}
        title={isVideo ? "إضافة فيديو شرح" : "رفع ملف جديد"}
        size="lg"
        busy={pending}
        footer={
          <>
            <button
              type="button"
              disabled={pending}
              onClick={close}
              className="btn-outline text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form={formId}
              disabled={pending || (!isVideo && !file)}
              className="btn-gold text-sm"
            >
              {pending && <Loader2 size={14} className="me-1.5 inline animate-spin" />}
              {isVideo ? "حفظ الفيديو" : "رفع وحفظ"}
            </button>
          </>
        }
      >
        <form id={formId} action={handleSubmit} className="space-y-4">
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

          {isMock ? (
            <div className="space-y-3">
              <div className="rounded-[var(--radius-default)] border border-dashed border-[var(--border-default)] bg-[var(--surface-1)] px-3 py-2.5 text-xs text-[var(--text-secondary)]">
                📘 الاختبار التجريبي شامل لكتاب فصل دراسي كامل — اختر الفصل الذي يخصّه هذا الاختبار.
              </div>
              <Field
                label="الفصل الدراسي (الكتاب)"
                name="semesterId"
                type="select"
                defaultValue={semesters[0]?.id}
                options={semesters.map((s) => ({ value: s.id, label: s.nameAr }))}
              />
            </div>
          ) : (
            <div className={isVideo ? "" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
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
          )}
          {isMock && (
            <Field label="رقم الاختبار التجريبي (اختياري)" name="examNumber" type="number" />
          )}

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
