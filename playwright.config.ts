import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

/** Только критичные сквозные сценарии (задача 65 плана) — не полное покрытие.
 * Требует уже поднятый Postgres с прогнанными миграциями/сидом (см. `docker
 * compose up db` + `npm run prisma:migrate` + `npm run prisma:seed`) — тесты
 * читают/пишут реальные данные каталога через тот же `DATABASE_URL`, что и
 * приложение. */
export default defineConfig({
  testDir: "./e2e",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    // `next start` не работает с `output: standalone` (см. next.config.ts,
    // задача 15) — та сборка проверяется отдельно, вживую внутри Docker
    // (задача 66). Здесь достаточно dev-сервера: сценарии проверяют бизнес-
    // логику приложения, не конкретный способ его деплоя.
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
