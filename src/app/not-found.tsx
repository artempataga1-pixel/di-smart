import type { Metadata } from "next";
import { PillCta } from "@/components/ui/PillCta";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = { title: `Страница не найдена — ${SITE.name}` };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-4 py-20 text-center md:px-6">
      <span className="font-[family-name:var(--font-heading)] text-7xl font-semibold text-[var(--color-accent)] md:text-8xl">
        404
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-text)] md:text-3xl">
          Страница не найдена
        </h1>
        <p className="text-[var(--color-muted)]">
          Возможно, товар закончился или ссылка устарела. Загляните в каталог — там точно
          что-нибудь найдётся.
        </p>
      </div>
      <PillCta href="/catalog">Перейти в каталог</PillCta>
    </div>
  );
}
