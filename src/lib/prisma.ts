import { PrismaClient } from "@prisma/client";

/**
 * Next.js 开发模式会频繁热重载。
 * 将 PrismaClient 挂到 globalThis，可以避免每次热重载都新建数据库连接。
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
