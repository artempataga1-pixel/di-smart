import "dotenv/config";
import { defineConfig } from "prisma/config";
import { databaseProvider } from "./src/lib/database-provider";

const mysql = databaseProvider() === "mysql";

export default defineConfig({
  schema: mysql ? "prisma/mysql/schema.prisma" : "prisma/schema.prisma",
  migrations: {
    path: mysql ? "prisma/mysql/migrations" : "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
