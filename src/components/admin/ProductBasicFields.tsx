export interface ProductBasicDefaults {
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  basePriceUsd: string;
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
  shortDescription: "",
  description: "",
  basePriceUsd: "",
  availability: "IN_STOCK",
  isFlagship: false,
  isActive: true,
  sortOrder: 0,
  seoTitle: "",
  seoDescription: "",
  canonicalPath: "",
};

const inputClass =
  "rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 outline-none focus:border-[var(--color-accent)]";

/** Поля-фрагмент (без <form>-обёртки) — переиспользуется формой создания
 * (задача 52, только эти поля) и формой редактирования (та же секция
 * "Основное" на странице `/admin/products/[id]`). */
export function ProductBasicFields({
  categories,
  defaults,
}: {
  categories: { id: string; name: string; brandName: string }[];
  defaults: ProductBasicDefaults;
}) {
  const categoriesByBrand = new Map<string, typeof categories>();
  for (const c of categories) {
    const list = categoriesByBrand.get(c.brandName) ?? [];
    list.push(c);
    categoriesByBrand.set(c.brandName, list);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm">
        Название
        <input name="name" required defaultValue={defaults.name} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Slug
        <input name="slug" required defaultValue={defaults.slug} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Категория
        <select name="categoryId" required defaultValue={defaults.categoryId} className={inputClass}>
          <option value="" disabled>
            Выберите категорию
          </option>
          {Array.from(categoriesByBrand.entries()).map(([brandName, cats]) => (
            <optgroup key={brandName} label={brandName}>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
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

      <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
        Краткое описание
        <input
          name="shortDescription"
          defaultValue={defaults.shortDescription}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
        Полное описание
        <textarea
          name="description"
          rows={4}
          defaultValue={defaults.description}
          className={`${inputClass} resize-none`}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Наличие (fallback без вариантов)
        <select name="availability" defaultValue={defaults.availability} className={inputClass}>
          <option value="IN_STOCK">В наличии</option>
          <option value="OUT_OF_STOCK">Нет в наличии</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
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

      <details className="md:col-span-2">
        <summary className="cursor-pointer text-sm text-[var(--color-muted)]">SEO-поля</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            SEO title
            <input name="seoTitle" defaultValue={defaults.seoTitle} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Canonical path
            <input
              name="canonicalPath"
              defaultValue={defaults.canonicalPath}
              placeholder="/product/..."
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
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
