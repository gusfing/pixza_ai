import { NextRequest, NextResponse } from "next/server";
import { wpAdminUpdateUser } from "@/lib/wordpress";
import { cookies } from "next/headers";
import { wpGetMe } from "@/lib/wordpress";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("pixza_token")?.value;
  if (!token) return null;
  try {
    const me = await wpGetMe(token);
    const isAdmin = (me as any).roles?.includes("administrator") || me.meta?.plan === "agency";
    return isAdmin ? me : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  try {
    await wpAdminUpdateUser(Number(id), body);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
