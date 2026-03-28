import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isRoot   = pathname === "/";

  // Read the lightweight auth cookie set by the client-side auth store
  const authCookie = request.cookies.get("dacs_auth_role")?.value;
  const isAuthenticated = !!authCookie;

  // Redirect root
  if (isRoot) {
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/dashboard" : "/login", request.url)
    );
  }

  // Allow public paths — but bounce authenticated users away from auth pages
  if (isPublic) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected paths — require authentication
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico)$).*)",
  ],
};