import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = {
  title: `Доставка и гарантия — ${SITE.name}`,
  description: "Условия доставки техники Di-SMART по Минску и Беларуси, способы оплаты, возврат и гарантийное обслуживание.",
  alternates: { canonical: "/delivery" },
};

const SERVICE_CENTER_ADDRESS =
  "Минск, ул. М. Богдановича, 118, ТД «Некрасовский», 3 этаж, офис 306";

export default function DeliveryPage() {
  const mapQuery = encodeURIComponent(SERVICE_CENTER_ADDRESS);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
        Доставка и гарантия
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Предварительная информация для демонстрационной версии сайта
      </p>

      <div className="mt-8 space-y-8 leading-relaxed text-[var(--color-text)]">
        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            1. Доставка
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--color-muted)]">
            <li>по г. Минску — бесплатно;</li>
            <li>по остальной территории Республики Беларусь — 20 BYN.</li>
          </ul>
          <p className="mt-2 text-[var(--color-muted)]">
            Стоимость доставки указана справочно и не включается в сумму
            заказа автоматически — точная стоимость и сроки уточняются
            менеджером при подтверждении заказа.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            2. Оплата
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Предполагаемые способы оплаты — наличными или картой при получении.
            Продавец подтвердит доступные варианты до открытия приёма заявок.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            3. Возврат и обмен
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Условия обмена и возврата зависят от конкретного товара и
            законодательства Республики Беларусь. Окончательные сведения
            продавец опубликует до открытия приёма заявок. Права покупателя
            при недостатках товара сохраняются независимо от этого проекта.
          </p>
          <p className="mt-2 text-[var(--color-muted)]">
            Полные условия покупки приведены на странице{" "}
            <Link href="/offer" className="underline underline-offset-2">
              «Условия оформления заявки»
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            4. Гарантия
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Предполагаемый сервисный центр — «Мобайлрем». Срок и условия
            гарантии на конкретный товар будут подтверждены продавцом до
            начала продаж:
          </p>
          <p className="mt-2 text-[var(--color-muted)]">{SERVICE_CENTER_ADDRESS}</p>

          <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)]">
            <iframe
              src={`https://yandex.ru/map-widget/v1/?text=${mapQuery}&z=16`}
              title="Сервисный центр «Мобайлрем» на карте"
              width="100%"
              height="360"
              loading="lazy"
              className="block"
              style={{ border: 0 }}
            />
          </div>
          <a
            href={`https://yandex.ru/maps/?text=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm underline underline-offset-2"
          >Открыть карту в отдельной вкладке</a>
        </section>
      </div>
    </div>
  );
}
