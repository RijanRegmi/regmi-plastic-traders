import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const token = request.cookies.get("rpt_admin_token")?.value;

  // No token + protected route → redirect to login
  if (!isLoginPage && !token) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in + hitting login page → go to dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

// Also export as default for Turbopack compatibility
export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};