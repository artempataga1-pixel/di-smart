import Image from "next/image";
import { Price } from "@/components/ui/Price";
import { PillCta } from "@/components/ui/PillCta";

interface CategoryFlagshipHeroProps {
  categoryName: string;
  name: string;
  subtitle: string;
  image: string | null;
  href: string;
  priceByn?: number;
  isEditorial: boolean;
}

export function CategoryFlagshipHero({
  categoryName,
  name,
  subtitle,
  image,
  href,
  priceByn,
  isEditorial,
}: CategoryFlagshipHeroProps) {
  return (
    <article
      aria-labelledby="category-flagship-title"
      className="grid overflow-hidden rounded-[28px] border border-[#e5e5ea] bg-[#f5f5f7] md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]"
    >
      <div className="flex flex-col justify-center px-6 py-8 sm:px-9 md:min-h-[360px] md:px-11 md:py-10">
        <p className="w-fit rounded-full border border-[#dedee3] bg-white px-3 py-1.5 text-sm font-medium text-[#515158]">
          {isEditorial ? "Флагман категории" : `Главная модель · ${categoryName}`}
        </p>
        <h1
          id="category-flagship-title"
          className="mt-5 max-w-[12ch] font-[family-name:var(--font-heading)] text-[clamp(2.25rem,4.4vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--color-text)]"
        >
          {name}
        </h1>
        <p className="mt-4 max-w-[34rem] text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
          {subtitle}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <PillCta href={href}>Смотреть флагман</PillCta>
          {priceByn !== undefined && <Price price={priceByn} size="md" />}
        </div>
      </div>

      <div className="relative min-h-[260px] overflow-hidden border-t border-[#e5e5ea] bg-white/45 sm:min-h-[340px] md:min-h-[360px] md:border-l md:border-t-0">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            priority
            sizes="(min-width: 1280px) 700px, (min-width: 768px) 58vw, 100vw"
            className="object-contain transition-transform duration-700 ease-out hover:scale-[1.015] motion-reduce:transition-none"
          />
        ) : (
          <div className="flex h-full min-h-[260px] items-center justify-center px-6 text-center text-sm text-[var(--color-muted)]">
            Фотография скоро появится
          </div>
        )}
      </div>
    </article>
  );
}
