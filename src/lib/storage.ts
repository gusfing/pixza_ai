import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { saveToDisk } from "./storage/local";

// R2 Client Setup
const r2Config = {
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET_NAME,
};

const isR2Configured = !!(r2Config.endpoint && r2Config.accessKeyId && r2Config.secretAccessKey && r2Config.bucket);

export const r2 = isR2Configured ? new S3Client({
  region: "auto",
  endpoint: r2Config.endpoint!,
  credentials: {
    accessKeyId: r2Config.accessKeyId!,
    secretAccessKey: r2Config.secretAccessKey!,
  },
}) : null;

const BUCKET = r2Config.bucket;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

/**
 * Upload a file (base64 or buffer) to the configured storage (R2 or Local).
 */
export async function uploadToStorage(
  base64DataUrl: string,
  key: string,
  contentType = "image/png"
): Promise<string> {
  // Option 1: Cloudflare R2
  if (isR2Configured && r2) {
    const base64 = base64DataUrl.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    return `${PUBLIC_URL}/${key}`;
  }

  // Option 2: Local VPS Storage (Fallback)
  return saveToDisk(base64DataUrl, key, contentType);
}

/**
 * Generate a presigned URL or direct URL.
 */
export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  if (isR2Configured && r2) {
    return getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn }
    );
  }
  // Local fallback: just return the relative API path
  return `/api/media/${key}`;
}

/**
 * Derive content type from output type.
 */
export function contentTypeForOutput(outputType: string): string {
  switch (outputType) {
    case "video": return "video/mp4";
    case "audio": return "audio/mpeg";
    case "3d":    return "model/gltf-binary";
    default:      return "image/png";
  }
}
