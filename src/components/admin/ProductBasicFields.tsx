export interface ProductBasicDefaults {
  name: string;
  slug: string;
  categoryId: string;
  brandId: string;
  shortDescription: string;
  description: string;
  basePriceUsd: string;
  basePriceByn: string;
  priceKind: "VERIFIED_SHOP" | "MARKET_ESTIMATE";
  availability: "IN_STOCK" | "OUT_OF_STOCK";
  isFlagship: boolean;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
}

export const EMPTY_PRODUCT_DEFAULTS: ProductBasicDefaults = {
  name: "",
  slug: "",
  categoryId: "",
  brandId: "",
  shortDescription: "",
  description: "",
  basePriceUsd: "",
  basePriceByn: "",
  priceKind: "MARKET_ESTIMATE",
  availability: "IN_STOCK",
  isFlagship: false,
  isActive: true,
  sortOrder: 0,
  seoTitle: "",
  seoDescription: "",
  canonicalPath: "",
};

const inputClass =
  "w-full min-w-0 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]";

/** Поля-фрагмент (без <form>-обёртки) — переиспользуется формой создания
 * (задача 52, только эти поля) и формой редактирования (та же секция
 * "Основное" на странице `/admin/products/[id]`). */
export function ProductBasicFields({
  categories,
  brands,
  defaults,
}: {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  defaults: ProductBasicDefaults;
}) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
      <label className="flex min-w-0 flex-col gap-1.5 text-sm">
        Название
        <input name="name" required defaultValue={defaults.name} className={inputClass} />
      </label>

      <label className="flex min-w-0 flex-col gap-1.5 text-sm">
        Slug
        <input name="slug" required defaultValue={defaults.slug} className={inputClass} />
      </label>

      <label className="flex min-w-0 flex-col gap-1.5 text-sm">
        Бренд
        <select name="brandId" required defaultValue={defaults.brandId} className={inputClass}>
          <option value="" disabled>
            Выберите бренд
          </option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-1.5 text-sm">
        Категория
        <select name="categoryId" required defaultValue={defaults.categoryId} className={inputClass}>
          <option value="" disabled>
            Выберите категорию
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-1.5 text-sm">
        Базовая цена, USD
        <input
          name="basePriceUsd"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={defaults.basePriceUsd}
          className={inputClass}
        />
        <span className="text-xs text-[var(--color-muted)]">
          Используется, только если у товара нет ни одного варианта
        </span>
      </label>

      <label className="flex min-w-0 flex-col gap-1.5 text-sm">
        Точная цена, BYN
        <input
          name="basePriceByn"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Автоматически по курсу"
          defaultValue={defaults.basePriceByn}
          className={inputClass}
        />
        <span className="text-xs text-[var(--color-muted)]">
          Необязательно. Для товара без вариантов; при заполнении цена не зависит от курса.
        </span>
      </label>

      <label className="flex min-w-0 flex-col gap-1.5 text-sm">
        Достоверность цены
        <select name="priceKind" defaultValue={defaults.priceKind} className={inputClass}>
          <option value="MARKET_ESTIMATE">Ориентировочная · уточнить у менеджера</option>
          <option value="VERIFIED_SHOP">Проверена на di-smart.by</option>
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-1.5 text-sm md:col-span-2">
        Краткое описание
        <input
          name="shortDescription"
          defaultValue={defaults.shortDescription}
          className={inputClass}
        />
      </label>

      <label className="flex min-w-0 flex-col gap-1.5 text-sm md:col-span-2">
        Полное описание
        <textarea
          name="description"
          rows={4}
          defaultValue={defaults.description}
          className={`${inputClass} resize-none`}
        />
      </label>

      <label className="flex min-w-0 flex-col gap-1.5 text-sm">
        Наличие (fallback без вариантов)
        <select name="availability" defaultValue={defaults.availability} className={inputClass}>
          <option value="IN_STOCK">В наличии</option>
          <option value="OUT_OF_STOCK">Нет в наличии</option>
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-1.5 text-sm">
        Порядок отображения
        <input
          name="sortOrder"
          type="number"
          defaultValue={defaults.sortOrder}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isFlagship"
          defaultChecked={defaults.isFlagship}
          className="size-4 accent-[var(--color-accent)]"
        />
        Флагман (показывать на главной)
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={defaults.isActive}
          className="size-4 accent-[var(--color-accent)]"
        />
        Активен (виден в каталоге)
      </label>

      <details className="min-w-0 md:col-span-2">
        <summary className="cursor-pointer text-sm text-[var(--color-muted)]">SEO-поля</summary>
        <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1.5 text-sm">
            SEO title
            <input name="seoTitle" defaultValue={defaults.seoTitle} className={inputClass} />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-sm">
            Canonical path
            <input
              name="canonicalPath"
              defaultValue={defaults.canonicalPath}
              placeholder="/product/..."
              className={inputClass}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-sm md:col-span-2">
            SEO description
            <textarea
              name="seoDescription"
              rows={2}
              defaultValue={defaults.seoDescription}
              className={`${inputClass} resize-none`}
            />
          </label>
        </div>
      </details>
    </div>
  );
}
