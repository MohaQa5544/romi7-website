"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type Props = {
  /** TeX source without delimiters */
  tex: string;
  display?: boolean;
  className?: string;
};

/** Renders a single TeX expression. Safe against malformed input — shows raw source on failure. */
export function MathRenderer({ tex, display = false, className }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        strict: "ignore",
        trust: false,
      });
    } catch {
      return `<code>${escapeHtml(tex)}</code>`;
    }
  }, [tex, display]);

  // Force LTR + bidi-isolation so math renders left-to-right even when embedded in an RTL (Arabic) parent.
  return (
    <span
      dir="ltr"
      className={className}
      style={{ unicodeBidi: "isolate", display: display ? "block" : "inline-block" }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Render a text string that may contain inline `$...$` or block `$$...$$` math.
 * Everything outside delimiters is rendered as plain text (preserves whitespace).
 */
export function MathContent({ text, className }: { text: string; className?: string }) {
  const parts = useMemo(() => splitMath(text), [text]);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.kind === "text" ? (
          <span key={i} className="whitespace-pre-wrap">
            {p.value}
          </span>
        ) : (
          <MathRenderer key={i} tex={p.value} display={p.kind === "block"} />
        ),
      )}
    </span>
  );
}

type Part = { kind: "text" | "inline" | "block"; value: string };

function splitMath(input: string): Part[] {
  const parts: Part[] = [];
  let i = 0;
  let buf = "";
  const push = (kind: "text" | "inline" | "block", value: string) => {
    if (!value) return;
    parts.push({ kind, value });
  };
  while (i < input.length) {
    // block $$...$$
    if (input[i] === "$" && input[i + 1] === "$") {
      const end = input.indexOf("$$", i + 2);
      if (end === -1) {
        buf += input.slice(i);
        i = input.length;
        break;
      }
      push("text", buf);
      buf = "";
      push("block", input.slice(i + 2, end));
      i = end + 2;
      continue;
    }
    // inline $...$ (but not $$)
    if (input[i] === "$") {
      const end = input.indexOf("$", i + 1);
      if (end === -1) {
        buf += input.slice(i);
        i = input.length;
        break;
      }
      push("text", buf);
      buf = "";
      push("inline", input.slice(i + 1, end));
      i = end + 1;
      continue;
    }
    buf += input[i];
    i++;
  }
  push("text", buf);
  return parts;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
