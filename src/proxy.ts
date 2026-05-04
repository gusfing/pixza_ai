import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED = ["/create", "/studio", "/settings", "/admin", "/onboarding", "/gallery"];

// Routes only for unauthenticated users
const AUTH_ONLY = ["/auth/signin", "/auth/signup"];

// Paths always accessible even when waitlist is ON
const WAITLIST_EXEMPT = [
  "/waitlist",
  "/api/waitlist",
  "/api/health",
  "/_next",
  "/favicon",
  "/pixza-logo",
  "/apple-touch-icon",
];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ── Waitlist mode check ──────────────────────────────────────
  // Only check if not already on an exempt path
  const isExempt = WAITLIST_EXEMPT.some(p => path.startsWith(p));
  if (!isExempt) {
    try {
      const WP_URL    = process.env.WP_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? "";
      const WP_SECRET = process.env.WP_API_SECRET ?? "";

      if (WP_URL) {
        const res = await fetch(`${WP_URL}/wp-json/pixza/v1/waitlist/status`, {
          headers: {
            "Content-Type": "application/json",
            "X-WP-Secret": WP_SECRET,
            "User-Agent": "Mozilla/5.0",
          },
          // Cache 60s to avoid hammering WP on every request
          next: { revalidate: 60 },
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if ((data as { enabled?: boolean })?.enabled === true) {
            const url = req.nextUrl.clone();
            url.pathname = "/waitlist";
            return NextResponse.redirect(url);
          }
        }
      }
    } catch {
      // WP unreachable — don't block the app
    }
  }

  // ── Auth guard ───────────────────────────────────────────────
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
