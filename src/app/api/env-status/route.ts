import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wpGetMe } from "@/lib/wordpress";

// Only accessible to authenticated admin users
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("pixza_token")?.value;
  if (!token) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const me = await wpGetMe(token);
    const isAdmin = (me as any).roles?.includes("administrator");
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    gemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "na",
    replicate: !!process.env.REPLICATE_API_KEY,
    fal: !!process.env.FAL_API_KEY,
    kie: !!process.env.KIE_API_KEY,
    wavespeed: !!process.env.WAVESPEED_API_KEY,
    cloudflare: !!(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN),
    r2: !!(process.env.R2_ENDPOINT && process.env.R2_BUCKET_NAME),
    redis: !!process.env.UPSTASH_REDIS_REST_URL,
    wp: !!process.env.WP_API_SECRET,
  });
}
