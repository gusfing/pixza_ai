/**
 * Generation History — persists user's generated images across browser sessions.
 * 
 * Storage strategy:
 * - localStorage: stores last 20 generations with base64 images (survives browser close)
 * - DB: stores metadata (prompt, model, date) for logged-in users via /api/generations
 * 
 * localStorage key: pixza_history
 * Max entries: 20 (oldest removed when full)
 * Max image size stored: 2MB per image (larger ones store URL only)
 */

export interface HistoryItem {
  id: string;
  prompt: string;
  model: string;
  provider: string;
  tab: string;
  aspectRatio?: string;
  images: string[];   // base64 data URLs or CDN URLs
  createdAt: string;  // ISO string
}

const HISTORY_KEY = "pixza_history";
const MAX_ITEMS = 20;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB in chars (base64)

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(item: Omit<HistoryItem, "id" | "createdAt">): HistoryItem {
  const history = loadHistory();

  // Compress images — if base64 is too large, store a placeholder
  const compressedImages = item.images.map(img => {
    if (img.length > MAX_IMAGE_SIZE) {
      // Too large for localStorage — store truncated marker
      return img.startsWith("data:") ? img.slice(0, 100) + "...TRUNCATED" : img;
    }
    return img;
  });

  const newItem: HistoryItem = {
    id: `gen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...item,
    images: compressedImages,
    createdAt: new Date().toISOString(),
  };

  // Prepend new item, keep only MAX_ITEMS
  const updated = [newItem, ...history].slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    // localStorage quota exceeded — remove oldest half and retry
    const trimmed = [newItem, ...history].slice(0, Math.floor(MAX_ITEMS / 2));
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch {
      // Give up silently
    }
  }

  return newItem;
}

export function deleteFromHistory(id: string): void {
  const history = loadHistory().filter(h => h.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* silent */ }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

/** Save generation metadata to DB (fire-and-forget, non-blocking) */
export async function saveGenerationToDb(item: {
  prompt: string;
  mode: string;
  model: string;
  provider: string;
  outputUrl?: string;
}): Promise<void> {
  try {
    await fetch("/api/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  } catch { /* non-fatal */ }
}
