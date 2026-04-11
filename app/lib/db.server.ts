import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function dbQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function dbExec(sql: string, params: any[] = []) {
  const [res] = await pool.execute(sql, params);
  return res as any;
}

export async function dbTransaction<T>(fn: (conn: mysql.PoolConnection) => Promise<T>) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function dbQueryConn<T = any>(
  conn: mysql.PoolConnection,
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const [rows] = await conn.execute(sql, params);
  return rows as T[];
}

export async function dbExecConn(conn: mysql.PoolConnection, sql: string, params: any[] = []) {
  const [res] = await conn.execute(sql, params);
  return res as any;
}
