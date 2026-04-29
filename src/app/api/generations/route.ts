import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wpGetMe } from "@/lib/wordpress";

async function getUserId(req: NextRequest): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  const wpToken = req.cookies.get("pixza_token")?.value;
  if (wpToken) {
    try {
      const me = await wpGetMe(wpToken);
      if (me) return me.id.toString();
    } catch {}
  }
  return null;
}

// GET /api/generations — list user's generations
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  return NextResponse.json({ items, total, page, pages: Math.ceil(total / per_page) });
}

// POST /api/generations — save generation metadata
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as any;
  const { prompt, mode, model, provider, outputUrl } = body;

  if (!prompt && !outputUrl) {
    return NextResponse.json({ error: "prompt or outputUrl required" }, { status: 400 });
  }

  try {
    const gen = await db.generation.create({
      data: {
        userId,
        prompt: prompt ?? "",
        mode: mode ?? "image",
        model: model ?? "unknown",
        provider: provider ?? "unknown",
        outputUrl: outputUrl ?? null,
        outputType: mode ?? "image",
        status: "done",
      },
    });
    return NextResponse.json({ success: true, id: gen.id });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
