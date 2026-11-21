import { SITE } from "@/constants/content/site";
import { InstagramIcon, TelegramIcon, ViberIcon } from "@/components/ui/SocialIcons";

const channels = [
  { name: "Telegram", href: SITE.telegramUrl, Icon: TelegramIcon, colorClass: "text-[#229ED9]" },
  { name: "Instagram", href: SITE.instagramUrl, Icon: InstagramIcon, colorClass: "text-[#E400A4]" },
  { name: "Viber", href: SITE.viberUrl, Icon: ViberIcon, colorClass: "text-[#A970D6]" },
] as const;

/** Ссылка на чат с уже набранным сообщением: Telegram понимает `?text=`,
 * Viber — `&draft=`. Instagram готовый текст не поддерживает. */
function withMessage(name: string, href: string, message?: string) {
  if (!message) return href;
  const text = encodeURIComponent(message);
  if (name === "Telegram") return `${href}?text=${text}`;
  if (name === "Viber") return `${href}&draft=${text}`;
  return href;
}

export function SocialLinks({ dark = false, singleRow = false, message }: { dark?: boolean; singleRow?: boolean; message?: string }) {
  const layout = singleRow
    ? "min-w-0 justify-center gap-1.5 whitespace-nowrap px-1.5 text-[11px] min-[360px]:text-xs min-[390px]:text-sm"
    : "gap-2 px-4 text-sm";
  return (
    <div role="group" aria-label="Социальные сети и мессенджеры" className={singleRow ? "grid grid-cols-3 gap-2" : "flex flex-wrap gap-2"}>
      {channels.map(({ name, href, Icon, colorClass }) => (
        <a
          key={name}
          href={withMessage(name, href, message)}
          target={href.startsWith("https:") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className={`${layout} ${dark
            ? "inline-flex min-h-11 items-center rounded-full border border-[var(--color-on-ink-muted)]/30 py-2 font-medium text-[var(--color-on-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-on-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            : "soft-btn inline-flex min-h-11 items-center rounded-full py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"}`}
        >
          <Icon className={`size-4 shrink-0 ${colorClass}`} />
          {name}
        </a>
      ))}
    </div>
  );
}
