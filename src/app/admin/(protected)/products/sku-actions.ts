"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isForeignKeyConstraintError } from "@/lib/admin/errors";
import { errorRedirectUrl, parseIntField, parsePositiveDecimalField } from "@/lib/admin/form-helpers";
import { requireAdminSession } from "@/lib/admin/require-session";

function skuPath(productId: string): string {
  return `/admin/products/${productId}#sku`;
}

/** Комбинации создаются вручную, по одному значению из каждого атрибута,
 * отмеченного как "используется" этим товаром (задача 54) — не декартовым
 * произведением: не всякая комбинация памяти/SIM реально существует в закупке. */
export async function createSkuAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const priceUsd = parsePositiveDecimalField(formData.get("priceUsd"));
  const availability = formData.get("availability") === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK";
  const isDefault = formData.get("isDefault") === "on";
  const sortOrder = parseIntField(formData.get("sortOrder"));

  const attributeIds = formData.getAll("attributeIds").map(String).filter(Boolean);
  const optionValueIds: string[] = [];
  for (const attributeId of attributeIds) {
    const valueId = String(formData.get(`value:${attributeId}`) ?? "");
    if (!valueId) {
      redirect(errorRedirectUrl(`/admin/products/${productId}`, "Выберите значение для каждого атрибута") + "#sku");
    }
    optionValueIds.push(valueId);
  }

  if (priceUsd === null || optionValueIds.length === 0) {
    redirect(errorRedirectUrl(`/admin/products/${productId}`, "Укажите цену — и хотя бы один атрибут должен быть отмечен «используется в товаре»") + "#sku");
  }

  try {
    // Сброс старого isDefault и создание нового варианта — в одной транзакции,
    // чтобы параллельный запрос не мог оставить два isDefault=true одновременно.
    await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.productVariant.updateMany({ where: { productId, isDefault: true }, data: { isDefault: false } });
      }
      await tx.productVariant.create({
        data: {
          productId,
          priceUsd: priceUsd!,
          availability,
          isDefault,
          sortOrder,
          options: { create: optionValueIds.map((attributeValueId) => ({ attributeValueId })) },
        },
      });
    });
  } catch (e) {
    if (isForeignKeyConstraintError(e)) {
      redirect(errorRedirectUrl(`/admin/products/${productId}`, "Товар или значение атрибута не найдено") + "#sku");
    }
    throw e;
  }

  revalidatePath(`/admin/products/${productId}`);
  redirect(skuPath(productId));
}

export async function updateSkuAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const priceUsd = parsePositiveDecimalField(formData.get("priceUsd"));
  const availability = formData.get("availability") === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK";
  const isDefault = formData.get("isDefault") === "on";
  const sortOrder = parseIntField(formData.get("sortOrder"));

  if (id && priceUsd !== null) {
    await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.productVariant.updateMany({ where: { productId, isDefault: true }, data: { isDefault: false } });
      }
      await tx.productVariant.update({
        where: { id },
        data: { priceUsd, availability, isDefault, sortOrder },
      });
    });
    revalidatePath(`/admin/products/${productId}`);
  }

  redirect(skuPath(productId));
}

export async function deleteSkuAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");

  if (id) {
    await prisma.productVariant.delete({ where: { id } }).catch((e) => {
      console.error("[admin] failed to delete SKU variant", e);
    });
    revalidatePath(`/admin/products/${productId}`);
  }

  redirect(skuPath(productId));
}
