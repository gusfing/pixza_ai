// IndexedDB helpers for caching ONNX model buffers locally
const IDB_NAME = "PixzaModelDB";
const IDB_STORE = "models";
const IDB_VERSION = 1;
const MODEL_FETCH_TIMEOUT_MS = 10 * 60 * 1000;
const MODEL_STALL_TIMEOUT_MS = 30 * 1000;

export const openModelDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const getFromIDB = (db: IDBDatabase, key: string): Promise<ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve((req.result as ArrayBuffer) ?? null);
    req.onerror = () => reject(req.error);
  });

const saveToIDB = (db: IDBDatabase, key: string, buf: ArrayBuffer): Promise<void> =>
  new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).put(buf, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

export const checkAndDownloadModel = async (
  url: string,
  cacheKey: string,
  onProgress: (pct: number) => void
): Promise<ArrayBuffer> => {
  const db = await openModelDB();
  const cached = await getFromIDB(db, cacheKey);
  if (cached) { onProgress(100); return cached; }

  const controller = new AbortController();
  const fetchTimeoutId = setTimeout(() => controller.abort(), MODEL_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, { headers: { Accept: "*/*" }, signal: controller.signal });
    if (!res.ok) throw new Error(`Model fetch failed: ${res.status}`);

    if (!res.body) {
      const buf = await res.arrayBuffer();
      await saveToIDB(db, cacheKey, buf);
      onProgress(100);
      return buf;
    }

    const total = parseInt(res.headers.get("Content-Length") ?? "0", 10);
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await Promise.race([
        reader.read(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Download stalled")), MODEL_STALL_TIMEOUT_MS)
        ),
      ]);
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress(total > 0 ? Math.min(99, Math.round((received / total) * 100)) : Math.min(95, chunks.length * 2));
    }

    const merged = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
    let offset = 0;
    for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }

    await saveToIDB(db, cacheKey, merged.buffer);
    onProgress(100);
    return merged.buffer;
  } finally {
    clearTimeout(fetchTimeoutId);
  }
};
