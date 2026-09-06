"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isForeignKeyConstraintError } from "@/lib/admin/errors";
import { errorRedirectUrl, parseIntField } from "@/lib/admin/form-helpers";
import { requireAdminSession } from "@/lib/admin/require-session";

function productPath(productId: string): string {
  return `/admin/products/${productId}#specs`;
}

export async function addSpecAction(formData: FormData) {
  await requireAdminSession();
  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();

  if (productId && name && value) {
    try {
      const count = await prisma.productSpec.count({ where: { productId } });
      await prisma.productSpec.create({ data: { productId, name, value, sortOrder: count } });
    } catch (e) {
      if (isForeignKeyConstraintError(e)) {
        redirect(errorRedirectUrl(`/admin/products/${productId}`, "Товар не найден") + "#specs");
      }
      throw e;
    }
    revalidatePath(`/admin/products/${productId}`);
  }

  redirect(productPath(productId));
}

export async function updateSpecAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const sortOrder = parseIntField(formData.get("sortOrder"));

  if (id && name && value) {
    await prisma.productSpec.update({ where: { id }, data: { name, value, sortOrder } }).catch((e) => {
      console.error("[admin] failed to update spec", e);
    });
    revalidatePath(`/admin/products/${productId}`);
  }

  redirect(productPath(productId));
}

export async function deleteSpecAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");

  if (id) {
    await prisma.productSpec.delete({ where: { id } }).catch((e) => {
      console.error("[admin] failed to delete spec", e);
    });
    revalidatePath(`/admin/products/${productId}`);
  }

  redirect(productPath(productId));
}
