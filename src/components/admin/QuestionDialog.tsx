"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Plus, Edit3, X, Trash2, Eye } from "lucide-react";
import { saveQuestion, type QuestionFormState } from "@/lib/admin/questions-actions";
import { MathContent } from "@/components/math/MathRenderer";
import { MathToolbar, insertAtCursor } from "@/components/math/MathToolbar";

type OptionRow = { id?: string; text: string; isCorrect?: boolean };

type QuestionShape = {
  id: string;
  unitId: string;
  questionText: string;
  lessonCode: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  needsReview: boolean;
  isPublished: boolean;
  sourceQuestionNumber: number | null;
  options: { id: string; optionText: string; isCorrect: boolean; order: number }[];
};

type Props = {
  unitId: string;
  question?: QuestionShape;
  trigger?: "button" | "edit";
};

export function QuestionDialog({ unitId, question, trigger = "button" }: Props) {
  const isEdit = !!question;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(question?.questionText ?? "");
  const [options, setOptions] = useState<OptionRow[]>(
    question
      ? question.options.map((o) => ({ id: o.id, text: o.optionText, isCorrect: o.isCorrect }))
      : [
          { text: "", isCorrect: true },
          { text: "" },
          { text: "" },
          { text: "" },
        ],
  );
  const initialCorrect = question
    ? Math.max(0, question.options.findIndex((o) => o.isCorrect))
    : 0;
  const [correctIndex, setCorrectIndex] = useState<number>(initialCorrect);

  const [state, formAction, pending] = useActionState<QuestionFormState, FormData>(
    saveQuestion,
    null,
  );

  // Track which input the toolbar should insert into
  const questionRef = useRef<HTMLTextAreaElement | null>(null);
  const optionRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusTarget, setFocusTarget] = useState<
    { kind: "question" } | { kind: "option"; idx: number }
  >({ kind: "question" });

  function applyInsert(insert: string, math: boolean) {
    if (focusTarget.kind === "question") {
      const ta = questionRef.current;
      if (!ta) return;
      const { newValue, newCaret } = insertAtCursor(ta, insert, text, math);
      setText(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(newCaret, newCaret);
      });
    } else {
      const idx = focusTarget.idx;
      const input = optionRefs.current[idx];
      if (!input) return;
      const currentValue = options[idx]?.text ?? "";
      // reuse insertAtCursor with input-like textarea (selectionStart works on inputs too)
      const start = input.selectionStart ?? currentValue.length;
      const end = input.selectionEnd ?? currentValue.length;
      const before = currentValue.slice(0, start);
      const dollarCount = (before.match(/\$/g) ?? []).length;
      const insideMath = dollarCount % 2 === 1;
      const wrapped = math && !insideMath ? `$${insert}$` : insert;
      const caretMarker = wrapped.indexOf("|");
      const cleaned = wrapped.replace("|", "");
      const newValue = currentValue.slice(0, start) + cleaned + currentValue.slice(end);
      const newCaret = start + (caretMarker >= 0 ? caretMarker : cleaned.length);
      setOptions((prev) =>
        prev.map((x, i) => (i === idx ? { ...x, text: newValue } : x)),
      );
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(newCaret, newCaret);
      });
    }
  }

  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      if (!isEdit) {
        setText("");
        setOptions([
          { text: "", isCorrect: true },
          { text: "" },
          { text: "" },
          { text: "" },
        ]);
        setCorrectIndex(0);
      }
    }
  }, [state, isEdit]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function addOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, { text: "" }]);
  }
  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
    if (correctIndex >= options.length - 1) setCorrectIndex(0);
  }

  const triggerBtn =
    trigger === "edit" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="تعديل"
        className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-default)] border border-[var(--border-default)] text-[var(--text-muted)] transition-colors hover:border-[var(--romi-gold)] hover:text-[var(--romi-gold-dark)]"
      >
        <Edit3 size={13} />
      </button>
    ) : (
      <button type="button" onClick={() => setOpen(true)} className="btn-gold text-sm">
        <Plus size={14} className="me-1.5 inline" /> إضافة سؤال
      </button>
    );

  return (
    <>
      {triggerBtn}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-[color-mix(in_oklab,#000_55%,transparent)] backdrop-blur-sm"
          onClick={() => !pending && setOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-0)] p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {isEdit ? "تعديل السؤال" : "سؤال جديد"}
              </h2>
              <button
                type="button"
                onClick={() => !pending && setOpen(false)}
                aria-label="إغلاق"
                className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              >
                <X size={16} />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              {isEdit && <input type="hidden" name="id" value={question!.id} />}
              <input type="hidden" name="unitId" value={unitId} />
              <input type="hidden" name="correctIndex" value={correctIndex} />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  نصّ السؤال — استخدم $...$ للرياضيات
                </label>
                <textarea
                  ref={questionRef}
                  name="questionText"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onFocus={() => setFocusTarget({ kind: "question" })}
                  rows={4}
                  dir="auto"
                  className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 text-sm outline-none focus:border-[var(--romi-gold)]"
                  placeholder="مثال: أوجد قيمة $\int_0^1 x^2\,dx$"
                  required
                />
                <div className="mt-1.5 flex items-start gap-1.5 rounded-[var(--radius-default)] border border-dashed border-[var(--border-default)] bg-[var(--surface-1)] p-2.5 text-sm leading-relaxed">
                  <Eye size={12} className="mt-1 shrink-0 text-[var(--text-muted)]" />
                  <div className="flex-1 min-w-0" dir="auto">
                    <MathContent text={text || "— المعاينة الحيّة تظهر هنا —"} />
                  </div>
                </div>
              </div>

              <MathToolbar onInsert={applyInsert} />

              <div className="space-y-2">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  الخيارات — اختر الإجابة الصحيحة
                </label>
                {options.map((o, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="_radio_correct"
                        checked={correctIndex === i}
                        onChange={() => setCorrectIndex(i)}
                        aria-label={`الخيار ${i + 1} صحيح`}
                        className="h-4 w-4 accent-[var(--romi-gold)]"
                      />
                      {o.id && <input type="hidden" name={`option_${i}_id`} value={o.id} />}
                      <input
                        ref={(el) => {
                          optionRefs.current[i] = el;
                        }}
                        name={`option_${i}`}
                        value={o.text}
                        onChange={(e) =>
                          setOptions((prev) =>
                            prev.map((x, idx) => (idx === i ? { ...x, text: e.target.value } : x)),
                          )
                        }
                        onFocus={() => setFocusTarget({ kind: "option", idx: i })}
                        dir="auto"
                        placeholder={`الخيار ${i + 1}`}
                        className={`block flex-1 rounded-[var(--radius-default)] border-[1.5px] bg-[var(--surface-0)] px-3 py-1.5 text-sm outline-none focus:border-[var(--romi-gold)] ${
                          correctIndex === i
                            ? "border-[var(--success)]/60"
                            : "border-[var(--border-default)]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        disabled={options.length <= 2}
                        aria-label="حذف الخيار"
                        className="rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--danger)] disabled:opacity-40"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {o.text.includes("$") && (
                      <div
                        className="ms-6 rounded-[var(--radius-default)] border border-dashed border-[var(--border-default)] bg-[var(--surface-1)] px-2.5 py-1.5 text-xs leading-relaxed"
                        dir="auto"
                      >
                        <MathContent text={o.text} />
                      </div>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-[11px] text-[var(--romi-navy)] hover:underline"
                  >
                    + إضافة خيار
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-[var(--text-secondary)]">
                    الصعوبة
                  </span>
                  <select
                    name="difficulty"
                    defaultValue={question?.difficulty ?? "medium"}
                    className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--romi-gold)]"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-[var(--text-secondary)]">
                    درس / رمز
                  </span>
                  <input
                    name="lessonCode"
                    defaultValue={question?.lessonCode ?? ""}
                    className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--romi-gold)]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-[11px] font-medium text-[var(--text-secondary)]">
                    رقم السؤال في الملف
                  </span>
                  <input
                    name="sourceQuestionNumber"
                    type="number"
                    defaultValue={question?.sourceQuestionNumber ?? ""}
                    className="block w-full rounded-[var(--radius-default)] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--romi-gold)]"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={question ? question.isPublished : true}
                    className="h-4 w-4 accent-[var(--romi-gold)]"
                  />
                  <span>منشور</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="needsReview"
                    defaultChecked={question?.needsReview ?? false}
                    className="h-4 w-4 accent-[var(--warning)]"
                  />
                  <span>بحاجة إلى مراجعة</span>
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
                  disabled={pending}
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
        </div>
      )}
    </>
  );
}
