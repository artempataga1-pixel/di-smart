import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/constants/content/site";
import { LEGAL_DOCUMENT_VERSION } from "@/lib/legal";

export const metadata: Metadata = { title: `Условия оформления заявки — ${SITE.name}` };

export default function OfferPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="text-3xl font-semibold md:text-4xl">Условия оформления заявки</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">Проект документа · редакция {LEGAL_DOCUMENT_VERSION}</p>
      <div className="mt-8 space-y-8 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">1. Статус сайта и продавец</h2>
          <p className="mt-2">Сайт {SITE.fullName} пока работает в демонстрационном режиме. Через корзину можно отправить тестовую заявку для проверки работы сайта, но продажи не открыты до публикации полных сведений о продавце и утверждения окончательной редакции условий. Наименование, УНП, адрес продавца, сведения о регистрации и обязательные сведения об интернет-магазине будут указаны здесь до начала продаж.</p>
          <p className="mt-2">Этот проект условий сам по себе не является действующей публичной офертой и не создаёт обязательства продать товар по цене, указанной на демонстрационном сайте.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">2. Как будет оформляться заявка</h2>
          <p className="mt-2">При тестировании пользователь выбирает товар и конфигурацию, проверяет корзину, указывает свои имя и телефон, при желании добавляет комментарий и подтверждает ознакомление с этими условиями и <Link href="/privacy" className="underline underline-offset-2">политикой обработки персональных данных</Link>. Отправленная заявка сохраняется для проверки; уведомление менеджеру отправляется, если подключён бот. Данные других покупателей для тестов указывать не следует.</p>
          <p className="mt-2">Отправка заявки не списывает деньги и не является подтверждением оплаты. Окончательные условия продажи и момент заключения договора должны быть определены в утверждённой продавцом редакции до начала реальных продаж.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">3. Цена, оплата и доставка</h2>
          <p className="mt-2">Цены показаны в белорусских рублях. Актуальные сведения о наличии и цене, вариантах оплаты, сроках и стоимости доставки должны быть подтверждены продавцом до открытия приёма заявок. Сведения о предполагаемой доставке размещены на странице <Link href="/delivery" className="underline underline-offset-2">«Доставка и гарантия»</Link>.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">4. Возврат и гарантия</h2>
          <p className="mt-2">Права покупателя при обнаружении недостатков, а также правила обмена и возврата товара надлежащего качества определяются законодательством Республики Беларусь и свойствами конкретного товара. Условия гарантии и применимые исключения продавец уточнит в окончательной редакции; этот проект не ограничивает права покупателя, предусмотренные законом.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">5. Связь и реквизиты</h2>
          <p className="mt-2">Контактный телефон: <a href={SITE.phoneHref} className="underline underline-offset-2">{SITE.phone}</a>. Данные юридического лица или индивидуального предпринимателя, УНП, адрес и контакты для претензий будут опубликованы до открытия приёма заявок.</p>
        </section>
      </div>
    </main>
  );
}
