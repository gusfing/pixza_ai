import { NextRequest, NextResponse } from "next/server";

// Proxy WordPress API calls server-side to avoid browser CORS issues

// Handle prefetch/GET requests gracefully
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}

export async function POST(req: NextRequest) {
  // Use server-side var first, fall back to public var
  const WP_URL = process.env.WP_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? "";
  if (!WP_URL) {
    return NextResponse.json({ error: "WP_URL not configured. Set NEXT_PUBLIC_WP_URL in your environment." }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { path, method, body: wpBody, token } = body;
  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Spoof a browser User-Agent so Hostinger WAF doesn't block server-to-server requests
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Origin": WP_URL,
    "Referer": `${WP_URL}/`,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${WP_URL}/?rest_route=${encodeURIComponent(path.startsWith("/") ? path : `/${path}`)}`;

  try {
    const res = await fetch(url, {
      method: method ?? "GET",
      headers,
      body: wpBody ? JSON.stringify(wpBody) : undefined,
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`[wp-proxy] ${method ?? "GET"} ${url} → ${res.status}`, data);
      // Strip HTML tags from WP error messages before sending to client
      const sanitize = (s: string) =>
        s.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();

      const rawMsg: string =
        data?.message || data?.data?.message || data?.error || "";

      // Map known WP error codes to clean user-facing messages
      // JWT plugin prefixes codes with [jwt_auth], strip it for matching
      const code: string = (data?.code || data?.data?.code || "").replace(/^\[jwt_auth\]\s*/, "");
      const cleanMsg =
        code === "incorrect_password" || rawMsg.toLowerCase().includes("password")
          ? "Incorrect password. Please try again."
          : code === "invalid_username" || code === "invalid_email" || rawMsg.toLowerCase().includes("not registered") || rawMsg.toLowerCase().includes("no account")
          ? "No account found with that email or username."
          : code === "empty_username"
          ? "Please enter your email or username."
          : code === "empty_password"
          ? "Please enter your password."
          : code === "existing_user_email"
          ? "An account with this email already exists."
          : code === "existing_user_login" || code === "user_exists"
          ? "An account with this email already exists."
          : rawMsg
          ? sanitize(rawMsg)
          : "Something went wrong. Please try again.";

      return NextResponse.json({ ...data, message: cleanMsg }, { status: res.status });
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to reach WordPress at ${url}: ${msg}` },
      { status: 502 }
    );
  }
}
