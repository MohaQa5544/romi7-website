import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  size?: number;
  variant?: "default" | "transparent";
  className?: string;
  priority?: boolean;
};

export function LogoMark({
  size = 72,
  variant = "default",
  className,
  priority = false,
}: LogoMarkProps) {
  const src = variant === "transparent" ? "/logo-transparent.png" : "/logo.png";
  return (
    <span
      className={cn("relative inline-block overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt="شعار رميح في الرياضيات"
        fill
        sizes={`${size}px`}
        className="object-cover"
        priority={priority}
      />
    </span>
  );
}
