import { Phone } from "lucide-react";
import { SITE } from "@/constants/content/site";
import { SocialLinks } from "@/components/ui/SocialLinks";

/** Shared by regular product pages and the flagship purchase panels. */
export function ProductContacts({ message }: { message?: string }) {
  return (
    <section
      aria-label="Связаться по товару"
      className="min-w-0 border-t border-[var(--color-line)] pt-5"
    >
      <h2 className="text-base font-semibold text-[var(--color-text)]">
        Есть вопросы о товаре?
      </h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Позвоните или напишите — в Telegram и Viber сообщение с выбранной моделью, памятью и цветом уже будет набрано.
      </p>
      <a
        href={SITE.phoneHref}
        aria-label={`Позвонить: ${SITE.phone}`}
        className="my-2 inline-flex min-h-11 items-center gap-2.5 rounded-md text-xl font-semibold tabular-nums text-[var(--color-accent-ink)] transition-colors hover:text-[var(--color-accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
      >
        <Phone className="size-4 shrink-0" aria-hidden="true" />
        {SITE.phone}
      </a>
      <SocialLinks singleRow message={message} />
    </section>
  );
}
