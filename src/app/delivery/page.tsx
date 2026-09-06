import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = {
  title: `Доставка и гарантия — ${SITE.name}`,
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
        Редакция от 6 сентября 2026 года
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
            Оплата производится наличными или картой курьеру в момент
            получения товара, если иной порядок оплаты не согласован с
            менеджером отдельно.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            3. Возврат и обмен
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            В соответствии с Перечнем непродовольственных товаров надлежащего
            качества, не подлежащих обмену и возврату, утверждённым
            постановлением Совета Министров Республики Беларусь от 25 сентября
            1999 г. № 703 (с последующими изменениями), технически сложные
            товары бытового назначения, включая смартфоны, планшеты,
            компьютерную и иную электронную технику, при отсутствии в них
            дефектов обмену и возврату не подлежат. Общий срок «14 дней на
            обмен товара надлежащего качества» на такие товары не
            распространяется и действует только для товаров, не входящих в
            указанный перечень.
          </p>
          <p className="mt-2 text-[var(--color-muted)]">
            Полные условия покупки приведены на странице{" "}
            <Link href="/offer" className="underline underline-offset-2">
              «Публичная оферта»
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            4. Гарантия
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Если в товаре обнаружен дефект — это гарантийный случай. Гарантия
            на технику составляет 12 месяцев с момента покупки. Гарантийное
            обслуживание осуществляет сервисный центр «Мобайлрем»:
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
        </section>
      </div>
    </div>
  );
}
