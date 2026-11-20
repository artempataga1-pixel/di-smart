import type { Metadata } from "next";
import { SITE } from "@/constants/content/site";

export const metadata: Metadata = {
  title: `Политика конфиденциальности — ${SITE.name}`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-[family-name:var(--font-heading)] text-[clamp(1.625rem,8vw,2.25rem)] font-semibold">
        Политика конфиденциальности
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Проект документа для проверки перед запуском магазина
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
            выступает [наименование продавца, УНП и адрес будут указаны до начала
            приёма заказов] (далее — «Оператор»). До заполнения этих сведений
            приём заявок в рабочей версии сайта отключён.
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
            используются для обработки заявки и связи с покупателем.
          </p>
          <p className="mt-2 text-[var(--color-muted)]">
            Дополнительно в техническом режиме могут собираться: cookies,
            IP-адрес, тип браузера и устройства — для корректной работы сайта
            (сохранение содержимого корзины, выбранных настроек аналитики,
            защита формы от злоупотреблений). Необязательная аналитика
            включается только после отдельного разрешения пользователя.
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
            <li>улучшение работы сайта на основе данных аналитики при наличии
              отдельного разрешения.</li>
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
            Данные заказа сохраняются в базе данных и при настроенной интеграции
            отправляются менеджерам через Telegram. Для работы сайта могут
            привлекаться поставщики хостинга, а для доставки — курьерские службы.
            До запуска необходимо указать конкретных получателей, страны
            обработки и основание для каждой трансграничной передачи.
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
            Пользователь вправе запросить сведения об обработке данных,
            потребовать их изменения, блокирования или удаления в случаях,
            предусмотренных законодательством, обратившись по контактам в
            разделе 8. Разрешение на необязательную аналитику можно изменить
            через ссылку «Настройки аналитики» внизу сайта.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
            7. Cookies
          </h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Содержимое корзины и выбор аналитики сохраняются в локальном
            хранилище браузера. Яндекс.Метрика может установить собственные
            cookies после разрешения на аналитику. Отключение хранения данных
            в браузере может нарушить работу корзины.
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
