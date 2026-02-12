import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isCallback = request.nextUrl.pathname === "/api/auth/callback/secondme"
  const isApi = request.nextUrl.pathname.startsWith("/api/")

  // 允许回调和 API 请求通过
  if (isCallback || isApi) {
    return NextResponse.next()
  }

  // 检查是否已登录（通过自定义 cookie）
  const secondmeId = request.cookies.get("secondme_id")?.value

  if (isLoginPage) {
    // 如果已登录，跳转到首页
    if (secondmeId) {
      return NextResponse.redirect(new URL("/", request.nextUrl))
    }
    return NextResponse.next()
  }

  // 如果未登录，跳转到登录页
  if (!secondmeId) {
    return NextResponse.redirect(new URL("/login", request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
