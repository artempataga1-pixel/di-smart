"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isForeignKeyConstraintError, isUniqueConstraintError } from "@/lib/admin/errors";
import { errorRedirectUrl, isValidCanonicalPath, isValidSlug, parseIntField, parseOptionalBynPrice, parsePositiveDecimalField } from "@/lib/admin/form-helpers";
import { requireAdminSession } from "@/lib/admin/require-session";

const LIST_PATH = "/admin/products";

function optionalText(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function readBasicFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    categoryId: String(formData.get("categoryId") ?? ""),
    brandId: String(formData.get("brandId") ?? ""),
    shortDescription: optionalText(formData, "shortDescription"),
    description: optionalText(formData, "description"),
    basePriceUsd: parsePositiveDecimalField(formData.get("basePriceUsd")),
    basePriceByn: parseOptionalBynPrice(formData.get("basePriceByn")),
    priceKind: formData.get("priceKind") === "VERIFIED_SHOP" ? "VERIFIED_SHOP" : "MARKET_ESTIMATE",
    availability: formData.get("availability") === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK",
    isFlagship: formData.get("isFlagship") === "on",
    isActive: formData.get("isActive") === "on",
    sortOrder: parseIntField(formData.get("sortOrder")),
    seoTitle: optionalText(formData, "seoTitle"),
    seoDescription: optionalText(formData, "seoDescription"),
    canonicalPath: optionalText(formData, "canonicalPath"),
  } as const;
}

export async function createProductAction(formData: FormData) {
  await requireAdminSession();
  const fields = readBasicFields(formData);

  if (!fields.name || !isValidSlug(fields.slug) || !fields.categoryId || !fields.brandId || fields.basePriceUsd === null) {
    redirect(errorRedirectUrl(`${LIST_PATH}/new`, "Название, slug, бренд, категория и базовая цена обязательны"));
  }
  if (fields.basePriceByn === undefined) {
    redirect(errorRedirectUrl(`${LIST_PATH}/new`, "Цена BYN должна быть больше нуля, максимум с двумя знаками после запятой"));
  }
  if (fields.canonicalPath && !isValidCanonicalPath(fields.canonicalPath)) {
    redirect(errorRedirectUrl(`${LIST_PATH}/new`, "Canonical должен быть путём этого сайта без параметров"));
  }

  let productId: string;
  try {
    const created = await prisma.product.create({
      data: {
        name: fields.name,
        slug: fields.slug,
        categoryId: fields.categoryId,
        brandId: fields.brandId,
        shortDescription: fields.shortDescription,
        description: fields.description,
        basePriceUsd: fields.basePriceUsd!,
        basePriceByn: fields.basePriceByn,
        priceKind: fields.priceKind,
        availability: fields.availability,
        isFlagship: fields.isFlagship,
        isActive: fields.isActive,
        sortOrder: fields.sortOrder,
        seoTitle: fields.seoTitle,
        seoDescription: fields.seoDescription,
        canonicalPath: fields.canonicalPath,
      },
      select: { id: true },
    });
    productId = created.id;
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      redirect(errorRedirectUrl(`${LIST_PATH}/new`, `Товар со slug «${fields.slug}» уже существует`));
    }
    if (isForeignKeyConstraintError(e)) {
      redirect(errorRedirectUrl(`${LIST_PATH}/new`, "Выбранная категория не найдена"));
    }
    throw e;
  }

  revalidatePath(LIST_PATH);
  revalidateTag("storefront-catalog", { expire: 0 });
  redirect(`${LIST_PATH}/${productId}`);
}

export async function updateProductBasicAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const fields = readBasicFields(formData);

  if (!id) redirect(LIST_PATH);
  if (!fields.name || !isValidSlug(fields.slug) || !fields.categoryId || !fields.brandId || fields.basePriceUsd === null) {
    redirect(errorRedirectUrl(`${LIST_PATH}/${id}`, "Название, slug, бренд, категория и базовая цена обязательны"));
  }
  if (fields.basePriceByn === undefined) {
    redirect(errorRedirectUrl(`${LIST_PATH}/${id}`, "Цена BYN должна быть больше нуля, максимум с двумя знаками после запятой"));
  }
  if (fields.canonicalPath && !isValidCanonicalPath(fields.canonicalPath)) {
    redirect(errorRedirectUrl(`${LIST_PATH}/${id}`, "Canonical должен быть путём этого сайта без параметров"));
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: fields.name,
        slug: fields.slug,
        categoryId: fields.categoryId,
        brandId: fields.brandId,
        shortDescription: fields.shortDescription,
        description: fields.description,
        basePriceUsd: fields.basePriceUsd!,
        basePriceByn: fields.basePriceByn,
        priceKind: fields.priceKind,
        availability: fields.availability,
        isFlagship: fields.isFlagship,
        isActive: fields.isActive,
        sortOrder: fields.sortOrder,
        seoTitle: fields.seoTitle,
        seoDescription: fields.seoDescription,
        canonicalPath: fields.canonicalPath,
      },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      redirect(errorRedirectUrl(`${LIST_PATH}/${id}`, `Товар со slug «${fields.slug}» уже существует`));
    }
    if (isForeignKeyConstraintError(e)) {
      redirect(errorRedirectUrl(`${LIST_PATH}/${id}`, "Выбранная категория не найдена"));
    }
    throw e;
  }

  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${id}`);
  revalidateTag("storefront-catalog", { expire: 0 });
  redirect(`${LIST_PATH}/${id}`);
}

export async function deleteProductsAction(ids: string[]) {
  await requireAdminSession();
  if (ids.length === 0) return;

  await prisma.product.deleteMany({ where: { id: { in: ids } } });

  revalidatePath(LIST_PATH);
  revalidateTag("storefront-catalog", { expire: 0 });
}
