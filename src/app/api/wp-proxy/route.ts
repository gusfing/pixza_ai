import { NextRequest, NextResponse } from "next/server";

// Proxy WordPress API calls server-side to avoid browser CORS issues
export async function POST(req: NextRequest) {
  const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "";
  if (!WP_URL) return NextResponse.json({ error: "WP_URL not configured" }, { status: 500 });

  const { path, method, body, token } = await req.json();
  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${WP_URL}/wp-json${path}`;

  const res = await fetch(url, {
    method: method ?? "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
