import type { UnitIconKey } from "@/lib/units";

type Props = {
  iconKey: UnitIconKey;
  size?: number;
  className?: string;
};

export function UnitIcon({ iconKey, size = 28, className = "" }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (iconKey) {
    case "integration":
      return (
        <svg {...common}>
          <path d="M20 6c-3 0-4 3-5 10s-2 10-5 10" />
          <path d="M18 7c1-1 2-1.5 3-1.5" />
          <path d="M10 26.5c-1 1-2 1.5-3 1.5" />
        </svg>
      );
    case "applications":
      return (
        <svg {...common}>
          <path d="M19 6c-3 0-4 3-5 10s-2 10-5 10" />
          <path d="M5 22c4-2 6-6 8-10s4-8 8-10" opacity="0.55" />
        </svg>
      );
    case "vectors":
      return (
        <svg {...common}>
          <path d="M6 26 L24 8" />
          <path d="M24 8 L18 8" />
          <path d="M24 8 L24 14" />
          <circle cx="6" cy="26" r="1.5" fill="currentColor" />
        </svg>
      );
    case "complex":
      return (
        <svg {...common}>
          <path d="M4 16h24" />
          <path d="M16 4v24" />
          <circle cx="22" cy="10" r="2.2" fill="currentColor" />
          <path d="M10 22l4-4" strokeDasharray="2 2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="6" y="6" width="20" height="20" rx="3" />
          <path d="M10 12h12M10 16h12M10 20h8" />
        </svg>
      );
  }
}
