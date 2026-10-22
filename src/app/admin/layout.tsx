/**
 * 登录页和受保护后台共用 /admin 前缀。
 * 具体后台页面由 route group 下的 layout 负责鉴权，避免登录页被
 * 自己的保护布局重定向，导致 /admin/login 无限重定向。
 */
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
