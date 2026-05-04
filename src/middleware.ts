import { NextRequest, NextResponse } from "next/server";

// Pages that are always accessible (never redirected to waitlist)
const PUBLIC_PATHS = [
  "/waitlist",
  "/api/waitlist",
  "/api/health",
  "/_next",
  "/favicon",
  "/pixza-logo",
  "/apple-touch-icon",
  "/public",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check waitlist status from WP (cached via edge)
  try {
    const WP_URL    = process.env.WP_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? "";
    const WP_SECRET = process.env.WP_API_SECRET ?? "";

    if (!WP_URL) return NextResponse.next();

    const res = await fetch(`${WP_URL}/wp-json/pixza/v1/waitlist/status`, {
      headers: {
        "Content-Type": "application/json",
        "X-WP-Secret": WP_SECRET,
        "User-Agent": "Mozilla/5.0",
      },
      // Cache for 60 seconds to avoid hammering WP on every request
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.enabled === true) {
        // Waitlist is ON — redirect everything to /waitlist
        const url = req.nextUrl.clone();
        url.pathname = "/waitlist";
        return NextResponse.redirect(url);
      }
    }
  } catch {
    // If WP is unreachable, don't block the app
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
