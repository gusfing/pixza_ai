import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // SaaS features moved to WordPress. This route is now a placeholder.
  return NextResponse.json({ received: true });
}
