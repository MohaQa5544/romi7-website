"use client";

import { useState } from "react";
import { MathRenderer } from "@/components/math/MathRenderer";

type Tab = "fn" | "symbols" | "layout";

type Snippet = {
  /** Raw text inserted into the input. `|` marks caret placement. `${n}` marks selection placeholder. */
  insert: string;
  /** LaTeX to preview on the button (without $). If omitted, uses `label`. */
  preview?: string;
  /** Plain-text/ASCII button label if preview isn't suitable. */
  label?: string;
  /** Whether the inserted text needs `$...$` math delimiters added around it. */
  math?: boolean;
};

// Each insert string uses `|` as caret marker. `${1}`, `${2}` would be fields but we keep it simple.
const FN_ROW: Snippet[] = [
  { preview: "\\sin", insert: "\\sin(|)", math: true },
  { preview: "\\cos", insert: "\\cos(|)", math: true },
  { preview: "\\tan", insert: "\\tan(|)", math: true },
  { preview: "\\sin^{-1}", insert: "\\sin^{-1}(|)", math: true },
  { preview: "\\cos^{-1}", insert: "\\cos^{-1}(|)", math: true },
  { preview: "\\tan^{-1}", insert: "\\tan^{-1}(|)", math: true },
  { preview: "\\ln", insert: "\\ln(|)", math: true },
  { preview: "\\log_{10}", insert: "\\log_{10}(|)", math: true },
  { preview: "\\log_{b}", insert: "\\log_{|}()", math: true },
  { preview: "e^{x}", insert: "e^{|}", math: true },
  { preview: "10^{x}", insert: "10^{|}", math: true },
  { preview: "\\sqrt{x}", insert: "\\sqrt{|}", math: true },
  { preview: "\\sqrt[n]{x}", insert: "\\sqrt[|]{}", math: true },
  { preview: "\\frac{dy}{dx}", insert: "\\frac{d}{dx}\\left(|\\right)", math: true },
  { preview: "\\int", insert: "\\int |\\, dx", math: true },
  { preview: "\\int_a^b", insert: "\\int_{|}^{}|", math: true },
  { preview: "\\sum_{i=1}^{n}", insert: "\\sum_{i=1}^{|}", math: true },
  { preview: "\\lim_{x\\to a}", insert: "\\lim_{x\\to |}", math: true },
  { preview: "|x|", insert: "\\left|\\,|\\,\\right|", math: true },
];

const SYMBOLS_ROW: Snippet[] = [
  { preview: "x", insert: "x|", math: true },
  { preview: "y", insert: "y|", math: true },
  { preview: "z", insert: "z|", math: true },
  { preview: "n", insert: "n|", math: true },
  { preview: "\\pi", insert: "\\pi|", math: true },
  { preview: "e", insert: "e|", math: true },
  { preview: "i", insert: "i|", math: true },
  { preview: "\\theta", insert: "\\theta|", math: true },
  { preview: "\\infty", insert: "\\infty|", math: true },
  { preview: "\\pm", insert: "\\pm|", math: true },
  { preview: "\\times", insert: "\\times|", math: true },
  { preview: "\\div", insert: "\\div|", math: true },
  { preview: "\\leq", insert: "\\leq|", math: true },
  { preview: "\\geq", insert: "\\geq|", math: true },
  { preview: "\\neq", insert: "\\neq|", math: true },
  { preview: "\\approx", insert: "\\approx|", math: true },
  { preview: "\\to", insert: "\\to|", math: true },
  { preview: "\\vec{v}", insert: "\\vec{|}", math: true },
  { preview: "\\hat{i}", insert: "\\hat{i}|", math: true },
  { preview: "^\\circ", insert: "^{\\circ}|", math: true },
];

const LAYOUT_ROW: Snippet[] = [
  { preview: "x^{2}", insert: "^{2}|", math: true },
  { preview: "x^{n}", insert: "^{|}", math: true },
  { preview: "x_{n}", insert: "_{|}", math: true },
  { preview: "\\frac{a}{b}", insert: "\\frac{|}{}", math: true },
  { preview: "(\\ )", insert: "(|)", math: true },
  { preview: "[\\ ]", insert: "[|]", math: true },
  { preview: "\\{\\ \\}", insert: "\\{|\\}", math: true },
  { label: "$..$", insert: "$|$" },
  { label: "$$..$$", insert: "$$|$$" },
  { label: "،", insert: "، |" },
  { label: "↵", insert: "\n|" },
];

/** Insert text at the current caret position of a textarea. `|` in `insert` positions the caret. */
export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  insert: string,
  currentValue: string,
  wrapMath: boolean,
) {
  const start = textarea.selectionStart ?? currentValue.length;
  const end = textarea.selectionEnd ?? currentValue.length;

  // Detect whether we're already inside $...$ math context
  const before = currentValue.slice(0, start);
  const lastOpen = before.lastIndexOf("$");
  const lastClose = lastOpen >= 0 ? before.indexOf("$", lastOpen + 1) : -1;
  // crude: odd number of $ before caret => we're inside math
  const dollarCount = (before.match(/\$/g) ?? []).length;
  const insideMath = dollarCount % 2 === 1;

  let toInsert = insert;
  // Auto-wrap math snippets in $...$ if we're in plain text
  if (wrapMath && !insideMath) {
    toInsert = `$${insert}$`;
  }

  const caretMarker = toInsert.indexOf("|");
  const cleaned = toInsert.replace("|", "");
  const newValue = currentValue.slice(0, start) + cleaned + currentValue.slice(end);

  const newCaret =
    start + (caretMarker >= 0 ? caretMarker : cleaned.length);

  return { newValue, newCaret };
}

type Props = {
  /** Called with a function that applies an insert to the target input. */
  onInsert: (insert: string, math: boolean) => void;
};

export function MathToolbar({ onInsert }: Props) {
  const [tab, setTab] = useState<Tab>("fn");
  const rows: Record<Tab, Snippet[]> = {
    fn: FN_ROW,
    symbols: SYMBOLS_ROW,
    layout: LAYOUT_ROW,
  };

  return (
    <div className="space-y-2 rounded-[var(--radius-default)] border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2">
      <div className="flex gap-1 text-[11px]">
        <TabBtn active={tab === "fn"} onClick={() => setTab("fn")}>
          f(x)
        </TabBtn>
        <TabBtn active={tab === "symbols"} onClick={() => setTab("symbols")}>
          رموز
        </TabBtn>
        <TabBtn active={tab === "layout"} onClick={() => setTab("layout")}>
          تنسيق
        </TabBtn>
      </div>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))" }}
      >
        {rows[tab].map((s, i) => (
          <button
            key={`${tab}-${i}`}
            type="button"
            onMouseDown={(e) => e.preventDefault() /* preserve focus on textarea */}
            onClick={() => onInsert(s.insert, !!s.math)}
            className="flex h-10 items-center justify-center rounded-[var(--radius-default)] border border-[var(--border-default)] bg-[var(--surface-0)] px-1 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--romi-gold)] hover:bg-[color-mix(in_oklab,var(--romi-gold)_8%,transparent)]"
            title={s.label ?? s.preview}
          >
            {s.preview ? (
              <MathRenderer tex={s.preview} />
            ) : (
              <span className="font-latin text-[11px]">{s.label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 font-medium transition-colors ${
        active
          ? "bg-[var(--romi-navy)] text-white"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
      }`}
    >
      {children}
    </button>
  );
}
