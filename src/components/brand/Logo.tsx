import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  withText?: boolean;
  href?: string | null;
  variant?: "default" | "transparent";
  className?: string;
};

export function Logo({
  size = 44,
  withText = true,
  href = "/",
  variant = "default",
  className,
}: LogoProps) {
  const src = variant === "transparent" ? "/logo-transparent.png" : "/logo.png";

  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className="relative block overflow-hidden rounded-full ring-1 ring-[var(--border-subtle)]"
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt="شعار رميح في الرياضيات"
          fill
          sizes={`${size}px`}
          className="object-cover"
          priority
        />
      </span>
      {withText && (
        <span className="flex flex-col leading-tight">
          <span className="font-display text-[1rem] font-bold text-[var(--text-primary)]">
            رميح في الرياضيات
          </span>
          <span className="font-latin text-[0.7rem] tracking-wide text-[var(--text-muted)]">
            ROMIH IN MATHS
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex focus-visible:outline-none">
      {content}
    </Link>
  );
}
