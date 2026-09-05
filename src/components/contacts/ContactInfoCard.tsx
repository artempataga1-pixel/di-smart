import { Phone, Clock } from "lucide-react";
import { SITE } from "@/constants/content/site";
import { TelegramIcon, InstagramIcon } from "@/components/ui/SocialIcons";

export function ContactInfoCard() {
  return (
    <div className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7">
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 size-5 shrink-0 text-[var(--color-accent-ink)]" />
        <div>
          <p className="font-medium text-[var(--color-text)]">Часы работы</p>
          <p className="text-[var(--color-muted)]">{SITE.hours}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Phone className="mt-0.5 size-5 shrink-0 text-[var(--color-accent-ink)]" />
        <div>
          <p className="font-medium text-[var(--color-text)]">Телефон</p>
          <a href={SITE.phoneHref} className="text-[var(--color-accent-ink)] hover:underline">
            {SITE.phone}
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={SITE.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="soft-btn inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium"
        >
          <TelegramIcon className="size-4 shrink-0" />
          {SITE.telegramLabel}
        </a>
        <a
          href={SITE.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="soft-btn inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium"
        >
          <InstagramIcon className="size-4 shrink-0" />
          {SITE.instagramLabel}
        </a>
      </div>
    </div>
  );
}
