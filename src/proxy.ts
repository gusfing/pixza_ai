import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED = ["/create", "/studio", "/settings", "/admin", "/onboarding", "/gallery"];

// Routes only for unauthenticated users
const AUTH_ONLY = ["/auth/signin", "/auth/signup"];

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("pixza_token")?.value;

  // Redirect unauthenticated users away from protected pages
  if (!token && PROTECTED.some(p => path.startsWith(p))) {
    const signInUrl = new URL("/auth/signin", req.nextUrl);
    signInUrl.searchParams.set("next", path);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect logged-in users away from auth pages
  if (token && AUTH_ONLY.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/create", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|pixza-logo\\.png|banana_icon\\.png|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
