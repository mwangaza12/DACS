// proxy.ts   ← Rename your file to this
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",                    // Home page
  "/about",
  "/contact",
  "/login",
  "/register",
  "/forgot-password",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((path) => 
    pathname === path || pathname.startsWith(path)
  );

  const authCookie = request.cookies.get("dacs_auth_role")?.value;
  const isAuthenticated = !!authCookie;

  // === Root path: Always show the public landing page ===
  if (pathname === "/") {
    return NextResponse.next();
  }

  // === Public paths (login, about, contact, etc.) ===
  if (isPublicPath) {
    // If already logged in, don't let them access login/register pages
    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // === Protected routes (dashboard and everything else) ===
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