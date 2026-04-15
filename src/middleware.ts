import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes only for unauthenticated users — redirect logged-in users away
const AUTH_ONLY = ["/auth/signin", "/auth/signup"];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check for WP JWT token in cookie (set by the app after login)
  const token = req.cookies.get("pixza_token")?.value;

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
