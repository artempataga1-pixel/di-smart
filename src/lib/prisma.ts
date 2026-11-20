import { PrismaClient } from "@/generated/prisma/client";

import { createDatabaseAdapter } from "./database-adapter";

const adapter = createDatabaseAdapter();

/** Кешируем клиент в global, чтобы hot-reload в dev не плодил новые соединения
 * с Postgres на каждое сохранение файла (стандартный паттерн для Next.js). */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
