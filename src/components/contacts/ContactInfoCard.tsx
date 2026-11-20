import { Phone, Clock } from "lucide-react";
import { SITE } from "@/constants/content/site";
import { SocialLinks } from "@/components/ui/SocialLinks";

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

      <div>
        <p className="mb-3 text-sm font-medium text-[var(--color-text)]">Напишите нам</p>
        <SocialLinks />
      </div>
    </div>
  );
}
