import { NextRequest, NextResponse } from "next/server";
import { wpGetMe } from "@/lib/wordpress";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get user plan from WP token cookie
    let plan = "FREE";
    let credits = 0;
    let creditsLimit = 100;

    const wpToken = request.cookies.get("pixza_token")?.value;
    if (wpToken) {
      try {
        const me = await wpGetMe(wpToken);
        plan = (me.meta?.plan ?? "free").toUpperCase();
        credits = me.meta?.credits ?? 0;
        creditsLimit = me.meta?.credits_limit ?? 100;
      } catch {
        // Token expired or invalid — return defaults
      }
    }

    // Map plan to limits
    const limitMap: Record<string, number> = {
      FREE: 100,
      PRO: 3000,
      AGENCY: 8000,
    };
    const limit = limitMap[plan] ?? creditsLimit;
    const remaining = credits;

    return NextResponse.json({
      success: true,
      plan,
      limit,
      remaining,
      reset: 0,
    });
  } catch (error) {
    // Never crash — return safe defaults
    return NextResponse.json({
      success: true,
      plan: "FREE",
      limit: 100,
      remaining: 100,
      reset: 0,
    });
  }
}
