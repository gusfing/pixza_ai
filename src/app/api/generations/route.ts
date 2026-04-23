import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wpGetMe } from "@/lib/wordpress";

// GET /api/generations — list user's generations
export async function GET(req: NextRequest) {
  // Support both NextAuth and WP token auth
  const session = await auth();
  let userId = session?.user?.id ?? null;

  if (!userId) {
    const wpToken = req.cookies.get("pixza_token")?.value;
    if (wpToken) {
      try {
        const me = await wpGetMe(wpToken);
        if (me) userId = me.id.toString();
      } catch {}
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const per_page = Math.min(parseInt(searchParams.get("per_page") ?? "20"), 100);
  const skip = (page - 1) * per_page;

  const [items, total] = await Promise.all([
    db.generation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: per_page,
      skip,
      select: {
        id: true, prompt: true, mode: true, model: true,
        provider: true, outputUrl: true, outputType: true,
        status: true, createdAt: true,
      },
    }),
    db.generation.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pages: Math.ceil(total / per_page),
  });
}
