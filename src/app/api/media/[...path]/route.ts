import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getLocalFilePath } from "@/lib/storage/local";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filePath = params.path.join("/");
  const fullPath = getLocalFilePath(filePath);

  try {
    const file = await fs.readFile(fullPath);
    
    // Determine content type
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = ext === ".mp4" ? "video/mp4" 
                      : ext === ".mp3" ? "audio/mpeg"
                      : ext === ".glb" ? "model/gltf-binary"
                      : "image/png";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Media API] File not found:", fullPath);
    return new NextResponse("File not found", { status: 404 });
  }
}
