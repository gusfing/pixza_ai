/**
 * API route for log management
 *
 * Handles:
 * - Saving log sessions to disk
 * - Manual log rotation
 * - Log file cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveSession, rotateLogFiles } from '@/utils/logger-server';
import type { LogSession } from '@/utils/logger';

function isLocalhostRequest(req: NextRequest): boolean {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (!["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(firstIp)) return false;
  }
  const host = (req.headers.get("host") || "").split(":")[0];
  return !host || ["localhost", "127.0.0.1", "::1"].includes(host);
}

export async function POST(req: NextRequest) {
  if (!isLocalhostRequest(req)) {
    return NextResponse.json({ success: false, error: "Forbidden: localhost only" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const session = body.session as LogSession;

    if (!session || !session.sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session data',
        },
        { status: 400 }
      );
    }

    // Rotate old log files
    await rotateLogFiles();

    // Save the session
    await saveSession(session);

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

