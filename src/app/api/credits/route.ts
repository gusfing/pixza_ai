/**
 * Credits API — proxies to WordPress to get/refresh live credit balance.
 * Called by the frontend after each generation to update the displayed count.
 */
import { NextRequest, NextResponse } from "next/server";
import { wpGetCredits } from "@/lib/wordpress";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("pixza_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const data = await wpGetCredits(token);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
