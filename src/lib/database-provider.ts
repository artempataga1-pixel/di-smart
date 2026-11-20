export type DatabaseProvider = "postgresql" | "mysql";

export function databaseProvider(url = process.env.DATABASE_URL, configured = process.env.DATABASE_PROVIDER): DatabaseProvider {
  const inferred = url?.startsWith("mysql:") ? "mysql" : url?.match(/^postgres(ql)?:/) ? "postgresql" : undefined;
  if (configured && configured !== "mysql" && configured !== "postgresql") throw new Error("DATABASE_PROVIDER must be mysql or postgresql");
  if (configured && inferred && configured !== inferred) throw new Error("DATABASE_PROVIDER does not match DATABASE_URL");
  if (url && !inferred) throw new Error("Unsupported DATABASE_URL protocol");
  return (configured as DatabaseProvider | undefined) ?? inferred ?? "postgresql";
}
