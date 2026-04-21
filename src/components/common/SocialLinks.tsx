import { Send, MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SocialLinksProps = {
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "ghost";
  showLabels?: boolean;
  className?: string;
};

export function SocialLinks({
  size = "md",
  variant = "solid",
  showLabels = true,
  className,
}: SocialLinksProps) {
  const base =
    "inline-flex items-center gap-2 rounded-[var(--radius-default)] font-medium transition-colors";
  const sizing =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : size === "lg"
      ? "px-5 py-3 text-base"
      : "px-4 py-2 text-sm";
  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  const telegramStyle =
    variant === "solid"
      ? "bg-[#229ED9] text-white hover:bg-[#1b89bf]"
      : "text-[#229ED9] hover:bg-[#229ED9]/10";
  const whatsappStyle =
    variant === "solid"
      ? "bg-[#25D366] text-white hover:bg-[#1fb859]"
      : "text-[#25D366] hover:bg-[#25D366]/10";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <a
        href={SITE.socials.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, sizing, telegramStyle)}
      >
        <Send size={iconSize} />
        {showLabels && <span>تيليجرام</span>}
      </a>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, sizing, whatsappStyle)}
      >
        <MessageCircle size={iconSize} />
        {showLabels && <span>واتساب</span>}
      </a>
    </div>
  );
}
