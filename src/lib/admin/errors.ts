import { Prisma } from "@/generated/prisma/client";

/** Уникальное ограничение нарушено (например повтор slug). */
export function isUniqueConstraintError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

/** Запись нельзя удалить/изменить — на неё ссылаются другие записи
 * (например бренд с активными категориями). */
export function isForeignKeyConstraintError(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P2003" || e.code === "P2014")
  );
}
