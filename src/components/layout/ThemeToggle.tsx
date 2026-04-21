"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme === "system" ? resolvedTheme : theme) : "light";
  const isDark = current === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)]"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
