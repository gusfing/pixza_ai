import { NextRequest, NextResponse } from "next/server";
import { wpAdminGetStats } from "@/lib/wordpress";
import { cookies } from "next/headers";
import { wpGetMe } from "@/lib/wordpress";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("pixza_token")?.value;
  if (!token) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const me = await wpGetMe(token);
    const isAdmin = (me as any).roles?.includes("administrator") || me.meta?.plan === "agency";
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const stats = await wpAdminGetStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
