import "dotenv/config";
import { Pool } from "pg";

/** Прямой SQL через `pg`, а не сгенерированный Prisma-клиент — тот собран как
 * ESM-модуль (`import.meta.url` внутри), который падает при загрузке через
 * Node-раннер Playwright (CJS-транспиляция). Для точечных проверок в тестах
 * достаточно сырых запросов; таблицы/колонки — без `@map` в schema.prisma,
 * поэтому имена совпадают с именами моделей/полей один в один. */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function closePool(): Promise<void> {
  await pool.end();
}
