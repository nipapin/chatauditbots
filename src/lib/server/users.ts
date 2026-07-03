import "server-only";
import { query } from "./db";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
}

function rowToUser(row: UserRow): UserRecord {
  return { id: row.id, email: row.email, passwordHash: row.password_hash };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const { rows } = await query<UserRow>("select id, email, password_hash from users where email = $1", [email]);
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function createUser(email: string, passwordHash: string): Promise<UserRecord> {
  const { rows } = await query<UserRow>(
    "insert into users (email, password_hash) values ($1, $2) returning id, email, password_hash",
    [email, passwordHash]
  );
  return rowToUser(rows[0]);
}
