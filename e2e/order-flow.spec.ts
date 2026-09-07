import { test, expect } from "@playwright/test";
import { pool } from "./db";

/** Критичный сценарий: товар с вариантом → корзина → заявка. Проверяет не
 * только UI ("Заявка отправлена"), но и что заказ реально лёг в БД с верным
 * снимком выбранного варианта — именно это требование задачи 43 (заказ не
 * теряется, сохраняется до отправки в Telegram). */
test("оформление заказа с выбранным вариантом сохраняется в БД", async ({ page }) => {
  await page.goto("/product/iphone-17-pro-max");

  // Дефолтный вариант — 128 ГБ. Переключаемся на 256 ГБ, чтобы убедиться, что
  // в заказ уходит именно выбранная конфигурация, а не дефолтная.
  await page.getByRole("button", { name: "256 ГБ", exact: true }).click();
  await expect(page.getByRole("button", { name: "256 ГБ", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  await page.getByRole("button", { name: "В корзину" }).click();

  await page.goto("/cart");

  const testName = `Playwright E2E ${Date.now()}`;
  await page.getByPlaceholder("Как к вам обращаться").fill(testName);
  await page.getByPlaceholder("+375 (XX) XXX-XX-XX").fill("291234567");
  await page.getByRole("checkbox").check();

  const [response] = await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/api/order") && r.request().method() === "POST"
    ),
    page.getByRole("button", { name: "Отправить заявку" }).click(),
  ]);

  const data = (await response.json()) as { ok: boolean; orderId?: string };
  expect(data.ok).toBe(true);
  expect(data.orderId).toBeTruthy();

  await expect(page.getByRole("heading", { name: "Заявка отправлена" })).toBeVisible();

  const orderResult = await pool.query(
    `SELECT id, name, "totalByn" FROM "Order" WHERE id = $1`,
    [data.orderId]
  );
  expect(orderResult.rows).toHaveLength(1);
  expect(orderResult.rows[0].name).toBe(testName);
  expect(Number(orderResult.rows[0].totalByn)).toBeGreaterThan(0);

  const itemsResult = await pool.query(
    `SELECT "productNameSnapshot", "variantLabelSnapshot" FROM "OrderItem" WHERE "orderId" = $1`,
    [data.orderId]
  );
  expect(itemsResult.rows).toHaveLength(1);
  expect(itemsResult.rows[0].productNameSnapshot).toContain("iPhone 17 Pro Max");
  expect(itemsResult.rows[0].variantLabelSnapshot).toContain("256 ГБ");
});
