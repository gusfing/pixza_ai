import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/utils/logger";

export const dynamic = 'force-dynamic';

// GET: List all workflows for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const workflows = await db.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        updatedAt: true,
        isPublic: true,
      },
    });

    return NextResponse.json({
      success: true,
      workflows,
    });
  } catch (error) {
    logger.error('system', 'Failed to fetch workflows', {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ success: false, error: "Failed to fetch workflows" }, { status: 500 });
  }
}

// POST: Upsert a workflow
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, data, isPublic } = body;

    if (!name || !data) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const workflow = await db.workflow.upsert({
      where: { id: id || "new-workflow-placeholder" },
      update: {
        name,
        description,
        data,
        isPublic: isPublic ?? false,
      },
      create: {
        userId,
        name,
        description,
        data,
        isPublic: isPublic ?? false,
      },
    });

    logger.info('system', 'Workflow saved safely to DB', {
      workflowId: workflow.id,
      userId,
    });

    return NextResponse.json({
      success: true,
      workflow,
    });
  } catch (error) {
    logger.error('system', 'Failed to save workflow', {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ success: false, error: "Failed to save workflow" }, { status: 500 });
  }
}
