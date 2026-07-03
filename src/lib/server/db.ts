import { Pool, type QueryResultRow } from "pg";

let cachedPool: Pool | null = null;

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL не задан. Добавьте его в .env.local и перезапустите dev-сервер.");
  }
  if (!cachedPool) {
    cachedPool = new Pool({ connectionString });
  }
  return cachedPool;
}

export function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  return getPool().query<T>(text, params);
}
