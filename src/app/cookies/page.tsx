import type { Metadata } from "next";
import Link from "next/link";
import { CookiePreferencesButton } from "@/components/layout/CookieBanner";
import { LEGAL_DOCUMENT_VERSION } from "@/lib/legal";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = { title: `Cookies и аналитика — ${SITE.name}` };

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="text-3xl font-semibold md:text-4xl">Cookies и аналитика</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">Редакция {LEGAL_DOCUMENT_VERSION}</p>
      <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
        <p>Сайт сохраняет содержимое корзины и выбор аналитики в локальном хранилище браузера. Это не cookies. Административная часть использует защищённую cookie-сессию только для входа сотрудника; покупателю она не нужна.</p>
        <p>Если вы отдельно разрешите аналитику, сайт загрузит Яндекс.Метрику. Сервис может устанавливать собственные cookies и получать сведения о посещении. До разрешения скрипт Метрики не загружается. Отказ не мешает пользоваться каталогом и корзиной.</p>
        <p>На странице «Доставка и гарантия» встроена Яндекс Карта. Она загружается автоматически при просмотре блока карты независимо от выбора аналитики; при этом браузер обращается к Яндексу. Если не хотите загружать карту, не открывайте эту страницу.</p>
        <p>Изменить выбор можно через <CookiePreferencesButton /> внизу сайта. После отказа загрузка Метрики на следующих страницах прекращается; ранее установленные сторонним сервисом cookies можно удалить через настройки браузера. Условия обработки персональных данных приведены в <Link href="/privacy" className="underline underline-offset-2">политике</Link>.</p>
      </div>
    </main>
  );
}
