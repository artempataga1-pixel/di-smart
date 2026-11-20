import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { databaseProvider } from "./database-provider";

/** Small pools leave memory and connections available for other shared-hosting sites. */
export function createDatabaseAdapter(url = process.env.DATABASE_URL) {
  if (databaseProvider(url) === "postgresql") {
    return new PrismaPg({ connectionString: url, max: 4, connectionTimeoutMillis: 15_000,
      idleTimeoutMillis: 30_000, keepAlive: true });
  }
  if (!url) throw new Error("DATABASE_URL is required for MySQL");
  const parsed = new URL(url);
  // Driver options do not automatically inherit Prisma connection URL options.
  // Reject unknown options instead of silently ignoring TLS/socket settings.
  const supported = new Set(["ssl", "sslaccept"]);
  for (const key of parsed.searchParams.keys()) {
    if (!supported.has(key)) throw new Error(`Unsupported MySQL URL option: ${key}`);
  }
  if (parsed.searchParams.get("sslaccept") === "accept_invalid_certs") {
    throw new Error("MySQL TLS requires a valid server certificate");
  }
  const tls = parsed.searchParams.get("ssl") === "true" || parsed.searchParams.has("sslaccept");
  return new PrismaMariaDb({
    host: parsed.hostname, port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username), password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.slice(1)),
    connectionLimit: 4, connectTimeout: 15_000, acquireTimeout: 15_000,
    ...(tls ? { ssl: { rejectUnauthorized: true } } : {}),
  });
}
