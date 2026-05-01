import { NextRequest, NextResponse } from "next/server";

// Proxy WordPress API calls server-side to avoid browser CORS issues
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

  const url = `${WP_URL}/wp-json${path}`;

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
