import fs from "fs/promises";
import path from "path";

/**
 * Save a base64 data URL or Buffer to the local filesystem.
 * Returns the relative URL for the served file.
 */
export async function saveToDisk(
  data: string,
  key: string,
  contentType: string
): Promise<string> {
  // Normalize the path (relative to project root/storage)
  const storageDir = path.join(process.cwd(), "storage");
  const fullPath = path.join(storageDir, key);
  const dir = path.dirname(fullPath);

  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  // Convert base64 to Buffer
  const base64 = data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  // Write file
  await fs.writeFile(fullPath, buffer);

  // Return the API URL that will serve this file
  // Format: /api/media/path/to/file.ext
  return `/api/media/${key}`;
}

/**
 * Get the full filesystem path for a given key.
 */
export function getLocalFilePath(key: string): string {
  return path.join(process.cwd(), "storage", key);
}
