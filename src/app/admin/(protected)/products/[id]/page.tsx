import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { ProductBasicFields } from "@/components/admin/ProductBasicFields";
import { updateProductBasicAction } from "../actions";
import { addSpecAction, deleteSpecAction, updateSpecAction } from "../specs-actions";
import {
  addProductColorAction,
  createAttributeAction,
  createAttributeValueAction,
  disableProductAttributeAction,
  enableProductAttributeAction,
  removeProductColorAction,
} from "../variant-actions";
import { createSkuAction, deleteSkuAction, updateSkuAction } from "../sku-actions";
import {
  deleteProductImageAction,
  setMainProductImageAction,
  uploadProductImageAction,
} from "../image-actions";

export const metadata: Metadata = { title: "Редактирование товара — Di-SMART Admin" };

const inputClass =
  "rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";
const cardClass =
  "scroll-mt-24 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6";
const saveBtnClass =
  "rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dark)]";
const ghostBtnClass =
  "rounded-[var(--radius-sm)] border border-[var(--color-line)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]";

const TABS = [
  ["#basic", "Основное"],
  ["#specs", "Характеристики"],
  ["#variants", "Варианты"],
  ["#colors", "Цвета"],
  ["#sku", "Комбинации (SKU)"],
  ["#photos", "Фото"],
] as const;

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [product, categories, nonColorAttributes, colorAttributes] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        specs: { orderBy: { sortOrder: "asc" } },
        images: {
          orderBy: { sortOrder: "asc" },
          include: { colorValue: { include: { attributeValue: true } } },
        },
        colorValues: { include: { attributeValue: true } },
        variantAttributes: {
          include: { attribute: { include: { values: { orderBy: { sortOrder: "asc" } } } } },
        },
        variants: {
          orderBy: { sortOrder: "asc" },
          include: { options: { include: { attributeValue: { include: { attribute: true } } } } },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: [{ brand: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { brand: true },
    }),
    prisma.variantAttribute.findMany({
      where: { isColor: false },
      orderBy: { sortOrder: "asc" },
      include: { values: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.variantAttribute.findMany({
      where: { isColor: true },
      orderBy: { sortOrder: "asc" },
      include: { values: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  if (!product) notFound();

  const usedAttributeIds = new Set(product.variantAttributes.map((pa) => pa.attributeId));
  const usedAttributes = nonColorAttributes.filter((a) => usedAttributeIds.has(a.id));
  const unusedAttributes = nonColorAttributes.filter((a) => !usedAttributeIds.has(a.id));

  const usedColorValueIds = new Set(product.colorValues.map((cv) => cv.attributeValueId));
  const availableColorValues = colorAttributes.flatMap((attr) =>
    attr.values
      .filter((v) => !usedColorValueIds.has(v.id))
      .map((v) => ({ id: v.id, label: `${attr.name}: ${v.value}`, hex: v.colorHex }))
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-body)] text-2xl font-semibold">{product.name}</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {product.category.name} · slug: {product.slug}
        </p>
      </div>

      <AdminErrorBanner message={error} />

      <nav className="flex flex-wrap gap-2 text-sm">
        {TABS.map(([href, label]) => (
          <a key={href} href={href} className="soft-btn rounded-full px-4 py-1.5">
            {label}
          </a>
        ))}
      </nav>

      {/* Основное (задача 52) */}
      <section id="basic" className={cardClass}>
        <h2 className="mb-4 text-lg font-medium">Основное</h2>
        <form action={updateProductBasicAction} className="flex flex-col gap-6">
          <input type="hidden" name="id" value={product.id} />
          <ProductBasicFields
            categories={categories.map((c) => ({ id: c.id, name: c.name, brandName: c.brand.name }))}
            defaults={{
              name: product.name,
              slug: product.slug,
              categoryId: product.categoryId,
              shortDescription: product.shortDescription ?? "",
              description: product.description ?? "",
              basePriceUsd: product.basePriceUsd.toString(),
              availability: product.availability,
              isFlagship: product.isFlagship,
              isActive: product.isActive,
              sortOrder: product.sortOrder,
              seoTitle: product.seoTitle ?? "",
              seoDescription: product.seoDescription ?? "",
              canonicalPath: product.canonicalPath ?? "",
            }}
          />
          <button type="submit" className={`${saveBtnClass} w-fit`}>
            Сохранить
          </button>
        </form>
      </section>

      {/* Характеристики (задача 53) */}
      <section id="specs" className={cardClass}>
        <h2 className="mb-4 text-lg font-medium">Характеристики</h2>
        <div className="flex flex-col gap-2">
          {product.specs.map((spec) => (
            <form
              key={spec.id}
              action={updateSpecAction}
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="id" value={spec.id} />
              <input type="hidden" name="productId" value={product.id} />
              <input name="name" defaultValue={spec.name} className={`${inputClass} w-48`} />
              <input name="value" defaultValue={spec.value} className={`${inputClass} flex-1`} />
              <input
                name="sortOrder"
                type="number"
                defaultValue={spec.sortOrder}
                className={`${inputClass} w-16`}
              />
              <button type="submit" className={ghostBtnClass}>
                Сохранить
              </button>
              <button
                type="submit"
                formAction={deleteSpecAction}
                className="text-sm text-[var(--color-warning)] hover:underline"
              >
                Удалить
              </button>
            </form>
          ))}
          {product.specs.length === 0 && (
            <p className="text-sm text-[var(--color-muted)]">Характеристик пока нет</p>
          )}
        </div>

        <form action={addSpecAction} className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] pt-4">
          <input type="hidden" name="productId" value={product.id} />
          <input name="name" required placeholder="Название" className={`${inputClass} w-48`} />
          <input name="value" required placeholder="Значение" className={`${inputClass} flex-1`} />
          <button type="submit" className={ghostBtnClass}>
            Добавить характеристику
          </button>
        </form>
      </section>

      {/* Варианты (задача 54) */}
      <section id="variants" className={cardClass}>
        <h2 className="mb-4 text-lg font-medium">Варианты (ценообразующие атрибуты)</h2>

        <div className="flex flex-col gap-4">
          {usedAttributes.map((attr) => (
            <div key={attr.id} className="rounded-[var(--radius-md)] border border-[var(--color-line)] p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{attr.name}</span>
                <form action={disableProductAttributeAction}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="attributeId" value={attr.id} />
                  <button type="submit" className="text-xs text-[var(--color-warning)] hover:underline">
                    Убрать из товара
                  </button>
                </form>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {attr.values.map((v) => (
                  <span
                    key={v.id}
                    className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs text-[var(--color-muted)]"
                  >
                    {v.value}
                  </span>
                ))}
              </div>
              <form action={createAttributeValueAction} className="mt-3 flex items-center gap-2">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="attributeId" value={attr.id} />
                <input name="value" required placeholder="Новое значение" className={`${inputClass} w-40`} />
                <button type="submit" className={ghostBtnClass}>
                  + значение
                </button>
              </form>
            </div>
          ))}

          {unusedAttributes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-[var(--color-muted)]">Добавить атрибут к товару:</span>
              {unusedAttributes.map((attr) => (
                <form key={attr.id} action={enableProductAttributeAction}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="attributeId" value={attr.id} />
                  <button type="submit" className={ghostBtnClass}>
                    {attr.name}
                  </button>
                </form>
              ))}
            </div>
          )}
        </div>

        <details className="mt-5 border-t border-[var(--color-line)] pt-4 text-sm">
          <summary className="cursor-pointer text-[var(--color-muted)]">Создать новый тип атрибута</summary>
          <form action={createAttributeAction} className="mt-3 flex flex-wrap items-end gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <label className="flex flex-col gap-1">
              Название
              <input name="name" required placeholder="Цвет крышки" className={`${inputClass} w-40`} />
            </label>
            <label className="flex flex-col gap-1">
              Slug
              <input name="slug" required placeholder="cover-color" className={`${inputClass} w-40`} />
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" name="isColor" className="size-4 accent-[var(--color-accent)]" />
              это атрибут-цвет
            </label>
            <button type="submit" className={ghostBtnClass}>
              Создать
            </button>
          </form>
        </details>
      </section>

      {/* Цвета (задача 54) */}
      <section id="colors" className={cardClass}>
        <h2 className="mb-4 text-lg font-medium">Цвета</h2>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          Цвет не влияет на цену — только на подбор фото товара.
        </p>

        <div className="flex flex-wrap gap-2">
          {product.colorValues.map((cv) => (
            <form key={cv.id} action={removeProductColorAction} className="flex items-center gap-1.5">
              <input type="hidden" name="id" value={cv.id} />
              <input type="hidden" name="productId" value={product.id} />
              <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface-soft)] px-3 py-1.5 text-sm">
                {cv.attributeValue.colorHex && (
                  <span
                    className="size-3 rounded-full border border-[var(--color-line)]"
                    style={{ backgroundColor: cv.attributeValue.colorHex }}
                  />
                )}
                {cv.attributeValue.value}
                <button type="submit" className="text-[var(--color-warning)]" aria-label="Удалить цвет">
                  ×
                </button>
              </span>
            </form>
          ))}
          {product.colorValues.length === 0 && (
            <p className="text-sm text-[var(--color-muted)]">Цвета не заданы</p>
          )}
        </div>

        {availableColorValues.length > 0 && (
          <form action={addProductColorAction} className="mt-4 flex items-center gap-2">
            <input type="hidden" name="productId" value={product.id} />
            <select name="attributeValueId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Выберите цвет
              </option>
              {availableColorValues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <button type="submit" className={ghostBtnClass}>
              Добавить цвет
            </button>
          </form>
        )}

        <details className="mt-4 border-t border-[var(--color-line)] pt-4 text-sm">
          <summary className="cursor-pointer text-[var(--color-muted)]">Создать новое значение цвета</summary>
          <form action={createAttributeValueAction} className="mt-3 flex flex-wrap items-end gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <label className="flex flex-col gap-1">
              Атрибут-цвет
              <select name="attributeId" required className={inputClass}>
                {colorAttributes.map((attr) => (
                  <option key={attr.id} value={attr.id}>
                    {attr.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Название
              <input name="value" required placeholder="Титановый чёрный" className={`${inputClass} w-44`} />
            </label>
            <label className="flex flex-col gap-1">
              HEX
              <input name="colorHex" placeholder="#1a1a1a" className={`${inputClass} w-28`} />
            </label>
            <button type="submit" className={ghostBtnClass}>
              Создать
            </button>
          </form>
        </details>
      </section>

      {/* Комбинации SKU (задача 55) */}
      <section id="sku" className={cardClass}>
        <h2 className="mb-4 text-lg font-medium">Комбинации (SKU)</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-[var(--color-muted)]">
                <th className="py-2 pr-3 font-medium">Комбинация</th>
                <th className="py-2 pr-3 font-medium">Цена USD</th>
                <th className="py-2 pr-3 font-medium">Наличие</th>
                <th className="py-2 pr-3 font-medium">По умолчанию</th>
                <th className="py-2 pr-3 font-medium">Порядок</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant) => (
                <tr key={variant.id} className="border-b border-[var(--color-line)] last:border-0">
                  <td colSpan={6} className="p-0 py-2">
                    <form action={updateSkuAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={variant.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <span className="w-48 text-[var(--color-muted)]">
                        {variant.options.map((o) => o.attributeValue.value).join(" / ")}
                      </span>
                      <input
                        name="priceUsd"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={variant.priceUsd.toString()}
                        className={`${inputClass} w-28`}
                      />
                      <select name="availability" defaultValue={variant.availability} className={inputClass}>
                        <option value="IN_STOCK">В наличии</option>
                        <option value="OUT_OF_STOCK">Нет в наличии</option>
                      </select>
                      <input
                        type="checkbox"
                        name="isDefault"
                        defaultChecked={variant.isDefault}
                        className="size-4 accent-[var(--color-accent)]"
                      />
                      <input
                        name="sortOrder"
                        type="number"
                        defaultValue={variant.sortOrder}
                        className={`${inputClass} w-16`}
                      />
                      <button type="submit" className={ghostBtnClass}>
                        Сохранить
                      </button>
                      <button
                        type="submit"
                        formAction={deleteSkuAction}
                        className="text-sm text-[var(--color-warning)] hover:underline"
                      >
                        Удалить
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {product.variants.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-[var(--color-muted)]">
                    Комбинаций пока нет — товар продаётся по базовой цене
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {usedAttributes.length > 0 ? (
          <form
            action={createSkuAction}
            className="mt-5 flex flex-wrap items-end gap-3 border-t border-[var(--color-line)] pt-4"
          >
            <input type="hidden" name="productId" value={product.id} />
            {usedAttributes.map((attr) => (
              <label key={attr.id} className="flex flex-col gap-1 text-sm">
                {attr.name}
                <input type="hidden" name="attributeIds" value={attr.id} />
                <select name={`value:${attr.id}`} required defaultValue="" className={inputClass}>
                  <option value="" disabled>
                    —
                  </option>
                  {attr.values.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label className="flex flex-col gap-1 text-sm">
              Цена USD
              <input name="priceUsd" type="number" step="0.01" min="0" required className={`${inputClass} w-28`} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Наличие
              <select name="availability" defaultValue="IN_STOCK" className={inputClass}>
                <option value="IN_STOCK">В наличии</option>
                <option value="OUT_OF_STOCK">Нет в наличии</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="isDefault" className="size-4 accent-[var(--color-accent)]" />
              по умолчанию
            </label>
            <button type="submit" className={saveBtnClass}>
              Добавить комбинацию
            </button>
          </form>
        ) : (
          <p className="mt-4 border-t border-[var(--color-line)] pt-4 text-sm text-[var(--color-muted)]">
            Сначала отметьте хотя бы один атрибут «используется в товаре» во вкладке «Варианты»
          </p>
        )}
      </section>

      {/* Фото (задача 56) */}
      <section id="photos" className={cardClass}>
        <h2 className="mb-4 text-lg font-medium">Фото</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {product.images.map((image) => (
            <div key={image.id} className="flex flex-col gap-2">
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-bg)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- локальный файл на диске, не оптимизируется через next/image в админке */}
                <img src={image.url} alt={image.alt ?? product.name} className="size-full object-cover" />
                {image.isMain && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] text-white">
                    главное
                  </span>
                )}
              </div>
              {image.colorValue && (
                <span className="text-xs text-[var(--color-muted)]">{image.colorValue.attributeValue.value}</span>
              )}
              <div className="flex items-center gap-2">
                {!image.isMain && (
                  <form action={setMainProductImageAction}>
                    <input type="hidden" name="id" value={image.id} />
                    <input type="hidden" name="productId" value={product.id} />
                    <button type="submit" className="text-xs hover:underline">
                      Сделать главным
                    </button>
                  </form>
                )}
                <form action={deleteProductImageAction}>
                  <input type="hidden" name="id" value={image.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <button type="submit" className="text-xs text-[var(--color-warning)] hover:underline">
                    Удалить
                  </button>
                </form>
              </div>
            </div>
          ))}
          {product.images.length === 0 && (
            <p className="col-span-full text-sm text-[var(--color-muted)]">Фото пока нет</p>
          )}
        </div>

        <form
          action={uploadProductImageAction}
          className="mt-5 flex flex-wrap items-end gap-3 border-t border-[var(--color-line)] pt-4"
        >
          <input type="hidden" name="productId" value={product.id} />
          <label className="flex flex-col gap-1 text-sm">
            Файл
            <input type="file" name="file" accept="image/*" required className={inputClass} />
          </label>
          {product.colorValues.length > 0 && (
            <label className="flex flex-col gap-1 text-sm">
              Привязать к цвету (опционально)
              <select name="colorValueId" defaultValue="" className={inputClass}>
                <option value="">Без привязки (общее фото)</option>
                {product.colorValues.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.attributeValue.value}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="submit" className={saveBtnClass}>
            Загрузить
          </button>
          <span className="text-xs text-[var(--color-muted)]">До 10 фото, конвертируются в WebP</span>
        </form>
      </section>
    </div>
  );
}
