/**
 * Newsletter Subscribe
 * Saves email to WordPress as a subscriber.
 */
import { NextRequest, NextResponse } from "next/server";

const WP_URL        = (process.env.WP_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? "").replace(/\/$/, "");
const WP_API_SECRET = process.env.WP_API_SECRET ?? "";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Try to save to WordPress (if plugin supports it)
  if (WP_URL && WP_API_SECRET) {
    await fetch(`${WP_URL}/wp-json/pixza/v1/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-WP-Secret": WP_API_SECRET },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  }

  // Always return success (don't leak whether email exists)
  return NextResponse.json({ success: true });
}
