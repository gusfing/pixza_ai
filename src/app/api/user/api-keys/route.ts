import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET — list which providers have keys saved (not the keys themselves)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await db.userApiKey.findMany({
    where: { userId: session.user.id },
    select: { provider: true, updatedAt: true },
  });

  return NextResponse.json({ keys: keys.map(k => ({ provider: k.provider, savedAt: k.updatedAt })) });
}

// POST — save/update an API key for a provider
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider, key } = await req.json();
  if (!provider || !key) return NextResponse.json({ error: "provider and key required" }, { status: 400 });

  // Hash the key for storage (we'll retrieve it via a separate secure endpoint)
  const keyHash = await bcrypt.hash(key, 10);

  await db.userApiKey.upsert({
    where: { userId_provider: { userId: session.user.id, provider } },
    create: { userId: session.user.id, provider, keyHash },
    update: { keyHash },
  });

  return NextResponse.json({ success: true });
}

// DELETE — remove a provider key
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = await req.json();
  await db.userApiKey.deleteMany({ where: { userId: session.user.id, provider } });
  return NextResponse.json({ success: true });
}
