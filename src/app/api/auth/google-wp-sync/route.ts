/**
 * Google → WordPress Sync
 * Called after successful Google OAuth to create/login the WP user
 * and return a WP JWT token that the app can use.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const WP_URL    = process.env.WP_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? "";
const WP_SECRET = process.env.WP_API_SECRET ?? "";

export async function GET(req: NextRequest) {
  try {
    // Get the NextAuth session (set after Google OAuth)
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/auth/signin?error=no_session", req.nextUrl));
    }

    const { email, name, image } = session.user;

    // Call WP to create or login the Google user
    const res = await fetch(`${WP_URL}/wp-json/pixza/v1/google-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WP-Secret": WP_SECRET,
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({ email, name, avatar: image }),
    });

    if (!res.ok) {
      console.error("[google-wp-sync] WP error:", res.status);
      // Fallback: redirect to create page anyway (NextAuth session is valid)
      return NextResponse.redirect(new URL("/create", req.nextUrl));
    }

    const data = await res.json();
    const wpToken = data?.token;

    if (!wpToken) {
      return NextResponse.redirect(new URL("/create", req.nextUrl));
    }

    // Set the WP token cookie
    const response = NextResponse.redirect(new URL("/create", req.nextUrl));
    response.cookies.set("pixza_token", wpToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      httpOnly: false, // needs to be readable by client JS
    });

    return response;
  } catch (err) {
    console.error("[google-wp-sync]", err);
    return NextResponse.redirect(new URL("/create", req.nextUrl));
  }
}
