import { closePool } from "./db";

/** Один пул на весь прогон (workers: 1 в playwright.config.ts — оба spec-файла
 * выполняются в одном Node-процессе и делят один и тот же модуль `./db`), поэтому
 * закрывать соединение нужно один раз здесь, а не в `afterAll` каждого файла —
 * иначе первый же файл закрывает пул для второго. */
export default async function globalTeardown() {
  await closePool();
}
