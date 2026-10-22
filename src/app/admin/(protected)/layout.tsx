import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

/**
 * route group 不会改变公开 URL，但只包裹真正需要登录的后台页面。
 * 登录页位于 /admin/login，因此不会被这个布局再次拦截。
 */
export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect("/admin/login");
  return children;
}
