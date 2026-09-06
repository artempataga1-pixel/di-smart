interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  windowStart: number;
}

/** In-memory rate-limit с фиксированным окном. Валидно, пока архитектура —
 * один постоянно работающий Node-процесс (см. задачу 46); если приложение
 * позже масштабируют на несколько инстансов — вынести состояние в Redis/БД,
 * иначе каждый инстанс будет считать со своим счётчиком.
 *
 * Кешируем Map в globalThis тем же паттерном, что src/lib/prisma.ts — иначе
 * hot-reload в dev пересоздаёт карту (и плодит новый setInterval) на каждое
 * сохранение файла. */
const globalForRateLimit = globalThis as unknown as {
  __rateLimitBuckets?: Map<string, Bucket>;
  __rateLimitCleanupStarted?: boolean;
};

const buckets = globalForRateLimit.__rateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit.__rateLimitBuckets = buckets;

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_BUCKET_AGE_MS = 60 * 60 * 1000;

if (!globalForRateLimit.__rateLimitCleanupStarted) {
  globalForRateLimit.__rateLimitCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.windowStart > MAX_BUCKET_AGE_MS) buckets.delete(key);
    }
  }, CLEANUP_INTERVAL_MS).unref();
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= options.windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count < options.limit) {
    bucket.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const retryAfterMs = options.windowMs - (now - bucket.windowStart);
  return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
}
