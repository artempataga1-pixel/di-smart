"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isForeignKeyConstraintError, isUniqueConstraintError } from "@/lib/admin/errors";
import { errorRedirectUrl, isValidSlug, parseIntField, parsePositiveDecimalField } from "@/lib/admin/form-helpers";
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
    shortDescription: optionalText(formData, "shortDescription"),
    description: optionalText(formData, "description"),
    basePriceUsd: parsePositiveDecimalField(formData.get("basePriceUsd")),
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

  if (!fields.name || !isValidSlug(fields.slug) || !fields.categoryId || fields.basePriceUsd === null) {
    redirect(errorRedirectUrl(`${LIST_PATH}/new`, "Название, slug, категория и базовая цена обязательны"));
  }

  let productId: string;
  try {
    const created = await prisma.product.create({
      data: {
        name: fields.name,
        slug: fields.slug,
        categoryId: fields.categoryId,
        shortDescription: fields.shortDescription,
        description: fields.description,
        basePriceUsd: fields.basePriceUsd!,
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
  redirect(`${LIST_PATH}/${productId}`);
}

export async function updateProductBasicAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const fields = readBasicFields(formData);

  if (!id) redirect(LIST_PATH);
  if (!fields.name || !isValidSlug(fields.slug) || !fields.categoryId || fields.basePriceUsd === null) {
    redirect(errorRedirectUrl(`${LIST_PATH}/${id}`, "Название, slug, категория и базовая цена обязательны"));
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: fields.name,
        slug: fields.slug,
        categoryId: fields.categoryId,
        shortDescription: fields.shortDescription,
        description: fields.description,
        basePriceUsd: fields.basePriceUsd!,
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
  redirect(`${LIST_PATH}/${id}`);
}

export async function deleteProductsAction(ids: string[]) {
  await requireAdminSession();
  if (ids.length === 0) return;

  await prisma.product.deleteMany({ where: { id: { in: ids } } });

  revalidatePath(LIST_PATH);
}
