import { NextRequest, NextResponse } from "next/server";
import { wpGetMe, wpDeductCredits, CREDIT_COSTS } from "@/lib/wordpress";

/**
 * POST /api/credits/deduct
 * Called internally after a successful generation.
 * Reads the user's WP token from cookie, looks up their WP user ID,
 * then deducts credits via the WP admin secret endpoint.
 */
export async function POST(req: NextRequest) {
  const wpToken = req.cookies.get("pixza_token")?.value;
  if (!wpToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { output_type = "image", reason = "generation" } = await req.json().catch(() => ({}));
  const cost = CREDIT_COSTS[output_type] ?? CREDIT_COSTS.image;

  try {
    const me = await wpGetMe(wpToken);
    const result = await wpDeductCredits(me.id, cost, reason);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to deduct credits";
    return NextResponse.json({ error: message }, { status: 402 });
  }
}
