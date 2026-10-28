import "dotenv/config";
import mysql, { RowDataPacket } from "mysql2/promise";
import { Pool } from "pg";

const sourceUrl = process.env.MYSQL_SOURCE_URL;
const targetUrl = process.env.DATABASE_URL;

if (!sourceUrl) {
  throw new Error("MYSQL_SOURCE_URL is required, for example mysql://root:root@127.0.0.1:3306/foreign_trade");
}

if (!targetUrl?.startsWith("postgresql://") && !targetUrl?.startsWith("postgres://")) {
  throw new Error("DATABASE_URL must point to the PostgreSQL target database");
}

const tables = [
  "admin_users",
  "product_categories",
  "products",
  "product_images",
  "product_translations",
  "product_specifications",
  "inquiries",
  "inquiry_attachments",
  "inquiry_notes",
  "site_contents",
  "site_settings",
  "operation_logs",
] as const;

function quotePostgresIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function quoteMysqlIdentifier(identifier: string) {
  return `\`${identifier.replaceAll("`", "``")}\``;
}

async function main() {
  const source = await mysql.createConnection(sourceUrl as string);
  const target = new Pool({ connectionString: targetUrl });
  const client = await target.connect();

  try {
    for (const table of tables) {
      const result = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM ${quotePostgresIdentifier(table)}`,
      );
      if (result.rows[0]?.count !== "0") {
        throw new Error(`Target table ${table} is not empty; migration stopped without changing data`);
      }
    }

    await client.query("BEGIN");
    let total = 0;

    for (const table of tables) {
      const [columnRows] = await source.query<RowDataPacket[]>(
        `SHOW COLUMNS FROM ${quoteMysqlIdentifier(table)}`,
      );
      const columns = columnRows.map((column) => String(column.Field));
      const [rows] = await source.query<RowDataPacket[]>(
        `SELECT * FROM ${quoteMysqlIdentifier(table)}`,
      );

      for (const row of rows) {
        const values = columns.map((column) => row[column]);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
        const columnList = columns.map(quotePostgresIdentifier).join(", ");
        await client.query(
          `INSERT INTO ${quotePostgresIdentifier(table)} (${columnList}) VALUES (${placeholders})`,
          values,
        );
      }

      if (rows.length > 0) {
        await client.query(
          `SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST(COALESCE(MAX(id), 1), 1), MAX(id) IS NOT NULL) FROM ${quotePostgresIdentifier(table)}`,
        );
      }

      total += rows.length;
      console.log(`${table}: ${rows.length} rows`);
    }

    await client.query("COMMIT");
    console.log(`Migration complete: ${total} rows copied from MySQL to PostgreSQL.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await target.end();
    await source.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
