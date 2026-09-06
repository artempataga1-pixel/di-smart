"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isForeignKeyConstraintError, isUniqueConstraintError } from "@/lib/admin/errors";
import { errorRedirectUrl, isValidSlug } from "@/lib/admin/form-helpers";
import { requireAdminSession } from "@/lib/admin/require-session";

function variantsPath(productId: string): string {
  return `/admin/products/${productId}#variants`;
}
function colorsPath(productId: string): string {
  return `/admin/products/${productId}#colors`;
}

/** Отмечает не-цветовой атрибут как используемый этим товаром (задача 54) —
 * состояние чекбокса "использовать в этом товаре", независимое от того,
 * создана ли уже хоть одна SKU-комбинация с этим атрибутом. */
export async function enableProductAttributeAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const attributeId = String(formData.get("attributeId") ?? "");

  if (productId && attributeId) {
    try {
      await prisma.productVariantAttribute.upsert({
        where: { productId_attributeId: { productId, attributeId } },
        update: {},
        create: { productId, attributeId },
      });
    } catch (e) {
      if (isForeignKeyConstraintError(e)) {
        redirect(errorRedirectUrl(`/admin/products/${productId}`, "Товар или атрибут не найден") + "#variants");
      }
      throw e;
    }
    revalidatePath(`/admin/products/${productId}`);
  }

  redirect(variantsPath(productId));
}

export async function disableProductAttributeAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const attributeId = String(formData.get("attributeId") ?? "");
  if (!productId || !attributeId) redirect(variantsPath(productId));

  // Нельзя молча отключить атрибут, если по нему уже есть SKU-комбинации —
  // иначе те варианты остались бы без явного флага "атрибут используется".
  const usedInVariant = await prisma.productVariantOption.findFirst({
    where: { variant: { productId }, attributeValue: { attributeId } },
  });
  if (usedInVariant) {
    redirect(
      errorRedirectUrl(`/admin/products/${productId}`, "Сначала удалите SKU-комбинации с этим атрибутом") +
        "#variants"
    );
  }

  await prisma.productVariantAttribute.deleteMany({ where: { productId, attributeId } });
  revalidatePath(`/admin/products/${productId}`);
  redirect(variantsPath(productId));
}

/** Создаёт полностью новый тип атрибута (например "Цвет крышки") без правки
 * кода — ключевое требование ТЗ про универсальность вариантов. Не-цветовой
 * атрибут сразу отмечается использующимся у товара, из формы которого создан. */
export async function createAttributeAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const isColor = formData.get("isColor") === "on";

  if (!name || !isValidSlug(slug)) {
    redirect(errorRedirectUrl(`/admin/products/${productId}`, "Название и slug атрибута обязательны") + "#variants");
  }

  const count = await prisma.variantAttribute.count();
  try {
    const attribute = await prisma.variantAttribute.create({
      data: { name, slug, isColor, sortOrder: count },
    });
    if (!isColor && productId) {
      await prisma.productVariantAttribute.create({ data: { productId, attributeId: attribute.id } });
    }
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      redirect(errorRedirectUrl(`/admin/products/${productId}`, `Атрибут со slug «${slug}» уже существует`) + "#variants");
    }
    if (isForeignKeyConstraintError(e)) {
      redirect(errorRedirectUrl(`/admin/products/${productId}`, "Товар не найден") + "#variants");
    }
    throw e;
  }

  revalidatePath(`/admin/products/${productId}`);
  redirect(variantsPath(productId));
}

export async function createAttributeValueAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const attributeId = String(formData.get("attributeId") ?? "");
  const value = String(formData.get("value") ?? "").trim();
  const colorHex = String(formData.get("colorHex") ?? "").trim() || null;

  if (!attributeId || !value) {
    redirect(errorRedirectUrl(`/admin/products/${productId}`, "Значение атрибута не может быть пустым") + "#variants");
  }

  const count = await prisma.variantAttributeValue.count({ where: { attributeId } });
  try {
    await prisma.variantAttributeValue.create({ data: { attributeId, value, sortOrder: count, colorHex } });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      redirect(
        errorRedirectUrl(`/admin/products/${productId}`, `Значение «${value}» уже существует для этого атрибута`) +
          "#variants"
      );
    }
    if (isForeignKeyConstraintError(e)) {
      redirect(errorRedirectUrl(`/admin/products/${productId}`, "Атрибут не найден") + "#variants");
    }
    throw e;
  }

  revalidatePath(`/admin/products/${productId}`);
  redirect(variantsPath(productId));
}

export async function addProductColorAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const attributeValueId = String(formData.get("attributeValueId") ?? "");

  if (productId && attributeValueId) {
    try {
      await prisma.productColorValue.create({ data: { productId, attributeValueId } });
    } catch (e) {
      if (isForeignKeyConstraintError(e)) {
        redirect(errorRedirectUrl(`/admin/products/${productId}`, "Товар или значение цвета не найдено") + "#colors");
      }
      if (!isUniqueConstraintError(e)) throw e;
    }
    revalidatePath(`/admin/products/${productId}`);
  }

  redirect(colorsPath(productId));
}

export async function removeProductColorAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");

  if (id) {
    await prisma.productColorValue.delete({ where: { id } }).catch((e) => {
      console.error("[admin] failed to delete product color", e);
    });
    revalidatePath(`/admin/products/${productId}`);
  }

  redirect(colorsPath(productId));
}
