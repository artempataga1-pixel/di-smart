import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const source = readFileSync("prisma/schema.prisma", "utf8");
// PostgreSQL remains the canonical schema; only SQL storage types differ.
let model = "";
const mysql = source.replace('provider = "postgresql"', 'provider = "mysql"')
  .split("\n").map(line => {
    const declaration = line.match(/^model (\w+)/);
    if (declaration) model = declaration[1];
    const match = line.match(/^(\s+)(\w+)(\s+String\??)(.*)$/);
    if (!match) return line;
    const [, , field, , rest] = match;
    if (rest.includes("@id") || rest.includes("@unique") || field.endsWith("Id") || field === "id"
      || (model === "VariantAttributeValue" && field === "value")) return line;
    return line + " @db.Text";
  }).join("\n");
mkdirSync("prisma/mysql", { recursive: true });
writeFileSync("prisma/mysql/schema.prisma", mysql.replace('"../src/generated/prisma"', '"../../src/generated/prisma"'));
