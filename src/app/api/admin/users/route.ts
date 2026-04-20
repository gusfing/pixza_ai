import { NextRequest, NextResponse } from "next/server";
import { wpAdminGetUsers, wpAdminGetStats } from "@/lib/wordpress";
import { cookies } from "next/headers";
import { wpGetMe } from "@/lib/wordpress";

async function requireAdmin(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("pixza_token")?.value;
  if (!token) return null;
  try {
    const me = await wpGetMe(token);
    // Check if user has admin role in WP meta or is WP admin
    const isAdmin = (me as any).roles?.includes("administrator") || me.meta?.plan === "agency";
    return isAdmin ? me : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const result = await wpAdminGetUsers({
    page: Number(searchParams.get("page") ?? 1),
    per_page: Number(searchParams.get("per_page") ?? 20),
    search: searchParams.get("search") ?? undefined,
  });

  return NextResponse.json(result);
}
