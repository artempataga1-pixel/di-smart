import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = {
  title: `Публичная оферта — ${SITE.name}`,
};

export default function OfferPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
        Публичная оферта
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Редакция от 6 сентября 2026 года
      </p>

      <div className="mt-8 space-y-8 leading-relaxed text-[var(--color-text)]">
        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            1. Общие положения
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Настоящий документ является публичной офертой {SITE.fullName} (далее
            — «Продавец») и содержит все существенные условия продажи товаров
            дистанционным способом через интернет-магазин, размещённый по адресу
            сайта, на котором опубликован данный документ. Оформление заказа
            через корзину сайта означает полное и безоговорочное принятие
            (акцепт) условий настоящей оферты покупателем.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            2. Предмет оферты
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Продавец обязуется передать в собственность покупателя товар,
            выбранный и оплаченный в порядке, предусмотренном настоящей офертой,
            а покупатель обязуется принять и оплатить товар на условиях,
            указанных при оформлении заказа.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            3. Порядок оформления заказа
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Заказ оформляется через корзину сайта путём заполнения формы с
            указанием имени, номера телефона и, при необходимости, комментария к
            заказу. После оформления заказа с покупателем связывается менеджер
            для подтверждения состава заказа, стоимости и деталей доставки.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            4. Цена товара и оплата
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Цены на товары указаны на сайте в белорусских рублях (BYN) и
            рассчитываются исходя из внутреннего курса USD → BYN, который
            устанавливает Продавец. Итоговая стоимость заказа фиксируется в
            момент подтверждения заказа менеджером. Оплата производится наличными
            или картой курьеру при получении товара, если иной порядок оплаты не
            согласован сторонами отдельно.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            5. Доставка
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Условия и стоимость доставки по г. Минску и по Республике Беларусь
            указаны на странице{" "}
            <Link href="/delivery" className="underline underline-offset-2">
              «Доставка и гарантия»
            </Link>
            . Стоимость доставки не включается в сумму заказа автоматически и
            уточняется менеджером при подтверждении заказа.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            6. Возврат и обмен товара
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            В соответствии с Перечнем непродовольственных товаров надлежащего
            качества, не подлежащих обмену и возврату, утверждённым
            постановлением Совета Министров Республики Беларусь от 25 сентября
            1999 г. № 703 (с последующими изменениями), технически сложные товары
            бытового назначения, включая смартфоны, планшеты, компьютерную и
            иную электронную технику, при отсутствии в них дефектов обмену и
            возврату не подлежат. Общий срок «14 дней на обмен товара
            надлежащего качества», предусмотренный законодательством о защите
            прав потребителей, на такие товары не распространяется.
          </p>
          <p className="mt-2 text-[var(--color-muted)]">
            Если в товаре обнаружен дефект, покупатель вправе обратиться по
            гарантии. Гарантийный срок на товары составляет 12 месяцев с момента
            покупки. Гарантийное обслуживание осуществляется сервисным центром
            «Мобайлрем» — условия подробно описаны на странице{" "}
            <Link href="/delivery" className="underline underline-offset-2">
              «Доставка и гарантия»
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            7. Ответственность сторон
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Продавец не несёт ответственности за невозможность исполнения заказа
            по причинам, не зависящим от него (отсутствие товара у поставщика,
            форс-мажорные обстоятельства), и уведомляет покупателя об этом при
            подтверждении заказа. Стороны несут ответственность в соответствии с
            законодательством Республики Беларусь.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            8. Реквизиты продавца
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            [наименование продавца уточняется, УНП уточняется]. Контакты:
            телефон{" "}
            <a href={SITE.phoneHref} className="underline underline-offset-2">
              {SITE.phone}
            </a>
            , Telegram{" "}
            <a
              href={SITE.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {SITE.telegramLabel}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
