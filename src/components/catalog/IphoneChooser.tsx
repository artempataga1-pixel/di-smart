import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogCardData } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { productPath } from "@/lib/product-route";

/** Отличия берём только из характеристик, которые уже заведены в карточках
 * товаров; цены — из каталога, чтобы они всегда совпадали с карточками. */
const MODELS = [
  {
    slug: "iphone-18-pro",
    tag: "Новинка",
    pitch: "Самая свежая модель — с запасом на несколько лет.",
    points: ["Чип A20 Pro — новое поколение", "Три камеры 48 Мп, зум оптического качества до 8×", "Экран 6,3″, ProMotion 120 Гц"],
  },
  {
    slug: "iphone-17-pro",
    tag: "Выгоднее",
    pitch: "Pro-камеры и экран 120 Гц за меньшие деньги.",
    points: ["Чип A19 Pro с вейпор-охлаждением", "Три камеры 48 Мп, оптический зум 4×", "Экран 6,3″, ProMotion 120 Гц, до 31 ч видео"],
  },
  {
    slug: "iphone-air",
    tag: "Самый тонкий",
    pitch: "Когда важнее тонкий корпус, чем максимум камер.",
    points: ["Толщина 5,6 мм", "Экран 6,5″", "Чип A19 Pro"],
  },
] as const;

export function IphoneChooser({ products }: { products: CatalogCardData[] }) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const models = MODELS.flatMap((model) => {
    const product = bySlug.get(model.slug);
    return product ? [{ ...model, product }] : [];
  });
  if (models.length < 2) return null;

  const pro18 = bySlug.get("iphone-18-pro");
  const pro17 = bySlug.get("iphone-17-pro");
  const proMax17 = bySlug.get("iphone-17-pro-max");
  const saving = pro18 && pro17 && pro18.priceByn > 0 && pro17.priceByn > 0 ? pro18.priceByn - pro17.priceByn : 0;
  const samePriceMax =
    pro18 && proMax17 && pro18.priceByn > 0 && proMax17.priceByn > 0 &&
    Math.abs(pro18.priceByn - proMax17.priceByn) <= pro18.priceByn * 0.03;

  return (
    <section aria-labelledby="iphone-chooser-title" className="mt-14 md:mt-16">
      <h2 id="iphone-chooser-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
        18 Pro, 17 Pro или Air — что выбрать
      </h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">Главные отличия в трёх строках.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {models.map(({ slug, tag, pitch, points, product }) => (
          <Link
            key={slug}
            href={productPath(product.slug, product.canonicalPath)}
            className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-accent)]"
          >
            <span className="w-fit rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--color-accent-ink)]">{tag}</span>
            <h3 className="mt-3 text-xl font-semibold text-[var(--color-text)]">{product.name}</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {slug === "iphone-17-pro" && saving > 0 ? `Pro-камеры и экран 120 Гц на ${formatPrice(saving)} дешевле 18 Pro.` : pitch}
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-[var(--color-text)]">
              {points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center justify-between pt-5">
              <span className="text-lg font-semibold tabular-nums">
                {product.priceByn > 0 ? `${product.priceIsFrom ? "от " : ""}${formatPrice(product.priceByn)}` : "Цена по запросу"}
              </span>
              <ArrowRight className="size-5 text-[var(--color-accent-ink)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>

      {samePriceMax && proMax17 && (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          <Link href={productPath(proMax17.slug, proMax17.canonicalPath)} className="font-medium text-[var(--color-accent-ink)] underline-offset-2 hover:underline">
            iPhone 17 Pro Max
          </Link>{" "}
          стоит почти как 18 Pro: экран больше (6,9″) и до 37 ч видео, но чип прошлого поколения — A19 Pro.
        </p>
      )}
    </section>
  );
}
