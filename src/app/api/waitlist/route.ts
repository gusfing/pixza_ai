/**
 * Waitlist API
 * GET  /api/waitlist        — check if waitlist is enabled (reads WP option)
 * POST /api/waitlist        — submit email to waitlist (saves to WP)
 */
import { NextRequest, NextResponse } from "next/server";

const WP_URL    = process.env.WP_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? "";
const WP_SECRET = process.env.WP_API_SECRET ?? "";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "X-WP-Secret": WP_SECRET,
};

// GET — returns { enabled: boolean, count: number }
export async function GET() {
  try {
    const res = await fetch(`${WP_URL}/?rest_route=${encodeURIComponent("/pixza/v1/waitlist/status")}`, {
      headers: HEADERS,
      cache: "no-store",
    });
    if (!res.ok) {
      // If endpoint doesn't exist yet, default to disabled
      return NextResponse.json({ enabled: false, count: 0 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ enabled: false, count: 0 });
  }
}

// POST — submit email { email, name? }
export async function POST(req: NextRequest) {
  let email: string, name: string | undefined;
  try {
    const body = await req.json();
    email = body.email?.trim().toLowerCase();
    name  = body.name?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${WP_URL}/?rest_route=${encodeURIComponent("/pixza/v1/waitlist/join")}`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ email, name }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as any)?.message || "Failed to join waitlist";
      return NextResponse.json({ error: msg }, { status: res.status });
    }
    return NextResponse.json({ success: true, message: "You're on the list!" });
  } catch {
    // If WP endpoint doesn't exist, still accept the email gracefully
    return NextResponse.json({ success: true, message: "You're on the list!" });
  }
}
