import { test, expect } from "@playwright/test";
import { pool } from "./db";
import { formatPrice } from "../src/lib/format";

const PRODUCT_SLUG = "iphone-17-pro-max";
const BASE_PRICE_USD = 1199; // 128 ГБ + SIM — дефолтный вариант в сиде (prisma/seed.ts)

test.describe("пересчёт цены USD → BYN", () => {
  test("смена варианта на странице товара сразу меняет цену", async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);

    const priceBlock = page.getByTestId("product-price");
    const priceBefore = await priceBlock.innerText();

    // 256 ГБ дороже 128 ГБ на 100 USD по сиду — цена обязана вырасти.
    await page.getByRole("button", { name: "256 ГБ", exact: true }).click();

    await expect(priceBlock).not.toHaveText(priceBefore);
    const priceAfter = await priceBlock.innerText();

    const numBefore = Number(priceBefore.replace(/\D/g, ""));
    const numAfter = Number(priceAfter.replace(/\D/g, ""));
    expect(numAfter).toBeGreaterThan(numBefore);
  });

  test("смена курса в админке немедленно пересчитывает цену на витрине", async ({ page }) => {
    const beforeResult = await pool.query(
      `SELECT "usdToByn" FROM "ExchangeRate" ORDER BY "setAt" DESC LIMIT 1`
    );
    const originalRate = beforeResult.rows[0] ? Number(beforeResult.rows[0].usdToByn) : 3.1;

    // Гарантированно отличный от текущего курс, чтобы тест не оказался
    // случайно "зелёным" при уже совпадающем значении.
    const testRate = Math.round((originalRate + 0.37) * 10000) / 10000;

    await page.goto("/admin/login");
    await page.getByLabel("Логин").fill(process.env.ADMIN_LOGIN ?? "");
    await page.getByLabel("Пароль", { exact: true }).fill(process.env.ADMIN_PASSWORD ?? "");
    await page.getByRole("button", { name: "Войти" }).click();
    await page.waitForURL("**/admin");

    await page.goto("/admin/settings");
    await page.getByLabel("Новый курс (BYN за 1 USD)").fill(String(testRate));
    await page.getByRole("button", { name: "Обновить" }).click();
    await page.waitForURL("**/admin/settings");
    await expect(page.getByText(`Текущий: ${testRate} BYN за 1 USD`)).toBeVisible();

    try {
      await page.goto(`/product/${PRODUCT_SLUG}`);
      const expectedPrice = formatPrice(Math.round(BASE_PRICE_USD * testRate));
      await expect(page.getByTestId("product-price")).toHaveText(expectedPrice);
    } finally {
      // Возвращаем прежний курс — тест не должен оставлять витрину в
      // изменённом состоянии для тех, кто продолжит проверять сайт вручную.
      await pool.query(
        `INSERT INTO "ExchangeRate" (id, "usdToByn", "setBy") VALUES (gen_random_uuid()::text, $1, 'e2e-restore')`,
        [originalRate]
      );
    }
  });
});
