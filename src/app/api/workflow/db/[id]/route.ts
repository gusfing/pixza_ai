import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/utils/logger";

export const dynamic = 'force-dynamic';

// GET: Fetch a specific workflow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const workflow = await db.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      return NextResponse.json({ success: false, error: "Workflow not found" }, { status: 404 });
    }

    // Basic access control
    if (workflow.userId !== userId && !workflow.isPublic) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      workflow,
    });
  } catch (error) {
    logger.error('system', 'Failed to fetch workflow', { id }, error instanceof Error ? error : undefined);
    return NextResponse.json({ success: false, error: "Failed to fetch workflow" }, { status: 500 });
  }
}

// DELETE: Remove a workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const workflow = await db.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      return NextResponse.json({ success: false, error: "Workflow not found" }, { status: 404 });
    }

    if (workflow.userId !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await db.workflow.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Workflow deleted",
    });
  } catch (error) {
    logger.error('system', 'Failed to delete workflow', { id }, error instanceof Error ? error : undefined);
    return NextResponse.json({ success: false, error: "Failed to delete workflow" }, { status: 500 });
  }
}
