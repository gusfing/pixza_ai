/**
 * Cloudflare Workers AI — multipart/form-data helper
 *
 * Builds multipart bodies manually using Node.js Buffer to avoid
 * the TypeScript Blob/BlobPart incompatibility with Uint8Array<ArrayBufferLike>.
 */

export function base64ToNodeBuffer(base64: string): Buffer {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  return Buffer.from(clean, "base64");
}

export interface MultipartFile {
  fieldName: string;
  buf: Buffer;
  mime?: string;
  filename?: string;
}

export function buildMultipart(
  fields: Record<string, string>,
  files: MultipartFile[] = []
): { body: Buffer; contentType: string } {
  const boundary = `----PixzaBoundary${Date.now().toString(16)}`;
  const parts: Buffer[] = [];

  for (const [key, value] of Object.entries(fields)) {
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
    ));
  }

  for (const { fieldName, buf, mime = "image/png", filename } of files) {
    const fname = filename ?? fieldName;
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${fname}"\r\nContent-Type: ${mime}\r\n\r\n`
    ));
    parts.push(buf);
    parts.push(Buffer.from("\r\n"));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));

  return {
    body: Buffer.concat(parts),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

/**
 * Call Cloudflare Workers AI with multipart/form-data (for FLUX.2 models)
 */
export async function cfFlux2(
  accountId: string,
  apiToken: string,
  model: string,
  fields: Record<string, string>,
  files: MultipartFile[] = []
): Promise<Response> {
  const { body, contentType } = buildMultipart(fields, files);
  return fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": contentType,
      },
      body: body as unknown as BodyInit,
    }
  );
}

/**
 * Call Cloudflare Workers AI with JSON body (for legacy models)
 */
export async function cfJson(
  accountId: string,
  apiToken: string,
  model: string,
  body: unknown
): Promise<Response> {
  return fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}
