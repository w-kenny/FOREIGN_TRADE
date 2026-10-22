import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 8 将数据库连接配置放在 prisma.config.ts。
 * schema 文件只描述表结构，真正的连接串由环境变量提供。
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
