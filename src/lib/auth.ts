import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "pe_soho_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "pe-soho-local-development-secret-change-before-production";
const SECURE_COOKIE = process.env.COOKIE_SECURE === "true";

export type AdminSession = {
  id: number;
  email: string;
  name: string;
  role: "OWNER" | "EDITOR";
};

function sign(value: string) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function createSessionValue(admin: AdminSession) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${admin.id}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifySessionValue(value: string) {
  const [idValue, expiresValue, signature] = value.split(".");
  const id = Number(idValue);
  const expiresAt = Number(expiresValue);
  if (!Number.isInteger(id) || !Number.isInteger(expiresAt) || !signature) return null;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return null;

  const expected = sign(`${id}.${expiresAt}`);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }
  return id;
}

/**
 * 读取并验证管理员会话。
 *
 * Cookie 只保存管理员 ID、过期时间和 HMAC 签名，真实角色与启用状态
 * 每次从数据库读取。这样管理员被停用或降权后，旧 Cookie 不会继续拥有权限。
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawValue) return null;

  const id = verifySessionValue(rawValue);
  if (!id) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  }).catch(() => null);

  if (!admin || !admin.isActive) return null;
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export function setAdminSessionCookie(response: Response, admin: AdminSession) {
  if (!(response instanceof Response)) return response;
  const headers = new Headers(response.headers);
  const cookie = [
    `${SESSION_COOKIE}=${createSessionValue(admin)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    SECURE_COOKIE ? "Secure" : "",
  ].filter(Boolean).join("; ");
  headers.append("Set-Cookie", cookie);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function clearAdminSessionCookie(response: Response) {
  const headers = new Headers(response.headers);
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
      SECURE_COOKIE ? "; Secure" : ""
    }`,
  );
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export const adminSessionCookie = SESSION_COOKIE;
export const adminSessionTtlSeconds = SESSION_TTL_SECONDS;
