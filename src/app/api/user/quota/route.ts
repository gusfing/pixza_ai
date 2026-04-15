import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { wpGetMe } from "@/lib/wordpress";
import { freeLimiter, proLimiter, getRateLimitRemaining } from "@/lib/ratelimit";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    let userId = session?.user?.id ?? null;
    let plan = (session?.user as { plan?: string })?.plan ?? "FREE";

    if (!userId) {
      const wpToken = request.cookies.get("pixza_token")?.value;
      if (wpToken) {
        try {
          const me = await wpGetMe(wpToken);
          if (me) {
            userId = me.id.toString();
            plan = me.meta?.plan?.toUpperCase() || "FREE";
            if (plan === "AGENCY") plan = "PRO";
          }
        } catch (e) {
          // Token expired or invalid
        }
      }
    }

    const identifier = userId ?? (request.headers.get("x-forwarded-for") ?? "anon");
    const limiter = plan === "PRO" || plan === "AGENCY" ? proLimiter : freeLimiter;
    const { limit, remaining, reset } = await getRateLimitRemaining(limiter, `gen:${identifier}`);

    return NextResponse.json({
      success: true,
      plan,
      limit,
      remaining,
      reset,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch quota" },
      { status: 500 }
    );
  }
}
