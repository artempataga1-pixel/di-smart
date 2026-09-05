import type { Metadata } from "next";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = {
  title: `Политика конфиденциальности — ${SITE.name}`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
        Политика конфиденциальности
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
            Настоящая Политика конфиденциальности (далее — «Политика») определяет
            порядок обработки персональных данных пользователей интернет-магазина{" "}
            {SITE.fullName} (далее — «Магазин»), размещённого по адресу сайта, на
            котором опубликован данный документ. Оператором персональных данных
            выступает [наименование продавца уточняется, УНП уточняется] (далее —
            «Оператор»). Используя сайт и оформляя заказ, пользователь подтверждает
            согласие с условиями настоящей Политики.
          </p>
          <p className="mt-2 text-[var(--color-muted)]">
            Обработка персональных данных осуществляется в соответствии с Законом
            Республики Беларусь от 7 мая 2021 г. № 99-З «О защите персональных
            данных» и иными применимыми нормативными правовыми актами Республики
            Беларусь.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            2. Какие данные собираются
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            При оформлении заказа через форму на сайте Оператор собирает: имя,
            номер телефона и комментарий к заказу (если указан). Эти данные
            предоставляются пользователем добровольно и добровольно же им
            подтверждаются согласием при отправке формы.
          </p>
          <p className="mt-2 text-[var(--color-muted)]">
            Дополнительно в техническом режиме могут собираться: cookies,
            IP-адрес, тип браузера и устройства — для корректной работы сайта
            (сохранение содержимого корзины, факта согласия на использование
            cookies) и базовой статистики посещаемости.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            3. Цели обработки данных
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--color-muted)]">
            <li>оформление, обработка и доставка заказа;</li>
            <li>связь с покупателем по вопросам заказа (телефон, Telegram);</li>
            <li>ведение внутреннего учёта заказов;</li>
            <li>улучшение работы сайта на основе обезличенной статистики.</li>
          </ul>
          <p className="mt-2 text-[var(--color-muted)]">
            Персональные данные не используются в целях, не связанных с
            оформлением и исполнением заказа, без отдельного согласия
            пользователя.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            4. Передача данных третьим лицам
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Данные заказа могут передаваться курьерским службам исключительно в
            объёме, необходимом для доставки товара. Оператор не передаёт и не
            продаёт персональные данные третьим лицам в рекламных или иных целях,
            не связанных с исполнением заказа.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            5. Сроки хранения данных
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Персональные данные хранятся в течение срока, необходимого для
            исполнения заказа и последующего гарантийного обслуживания, а также в
            течение сроков, установленных законодательством Республики Беларусь
            для хранения документов бухгалтерского и налогового учёта.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            6. Права пользователя
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Пользователь вправе в любой момент отозвать согласие на обработку
            персональных данных, а также запросить уточнение, блокирование или
            удаление своих данных, обратившись по контактам, указанным в разделе
            8. Отзыв согласия не влияет на законность обработки данных,
            произведённой до его отзыва.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            7. Cookies
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Сайт использует cookies технического характера — для сохранения
            содержимого корзины и факта согласия с использованием cookies.
            Отключение cookies в настройках браузера может привести к
            некорректной работе отдельных функций сайта (например, корзины).
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            8. Изменение политики и контакты
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Оператор вправе вносить изменения в настоящую Политику; актуальная
            редакция всегда доступна на этой странице. По вопросам обработки
            персональных данных можно обратиться по телефону{" "}
            <a href={SITE.phoneHref} className="underline underline-offset-2">
              {SITE.phone}
            </a>{" "}
            или в Telegram{" "}
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
