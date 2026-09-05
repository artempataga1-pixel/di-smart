import { Phone, MapPin, Clock } from "lucide-react";
import { SITE } from "@/constants/content/site";

function VkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#0077FF" />
      <path
        d="M12.8 17.2c-4.9 0-7.7-3.4-7.8-8.9h2.5c.1 3.9 1.8 5.6 3.2 5.9v-5.9h2.4v3.5c1.3-.1 2.7-1.7 3.2-3.5h2.3c-.4 2.2-2 3.8-3.1 4.5 1.1.6 2.9 2 3.6 4.4h-2.6c-.5-1.7-1.9-3-3.4-3.2v3.2h-.3Z"
        fill="white"
      />
    </svg>
  );
}

export function ContactInfoCard() {
  return (
    <div className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7">
      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 size-5 shrink-0 text-[var(--color-accent-ink)]" />
        <div>
          <p className="font-medium text-[var(--color-text)]">Адрес</p>
          <p className="text-[var(--color-muted)]">{SITE.address}</p>
        </div>
      </div>

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

      <a
        href={SITE.vkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="soft-btn mt-2 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium"
      >
        <VkIcon className="size-4 shrink-0" />
        {SITE.vkLabel}
      </a>
    </div>
  );
}
