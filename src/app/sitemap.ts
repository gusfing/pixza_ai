import { MetadataRoute } from "next";

// Always use HTTPS production URL — never use NEXT_PUBLIC_APP_URL for sitemap
// (that would put http://localhost in the sitemap)
const BASE = "https://pixzaai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ── Home ───────────────────────────────────────────────────
    { url: `${BASE}/`,                          lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/waitlist`,                  lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/about`,                     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/developers`,                lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // ── Core App ───────────────────────────────────────────────
    { url: `${BASE}/create`,                    lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/studio`,                    lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/examples`,                  lastModified: now, changeFrequency: "weekly",  priority: 0.8 },

    // ── Tools ──────────────────────────────────────────────────
    { url: `${BASE}/tools`,                     lastModified: now, changeFrequency: "weekly",  priority: 0.95 },
    { url: `${BASE}/tools/background-remover`,  lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/tools/magic-eraser`,        lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/tools/ai-background`,       lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/tools/object-remover`,      lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/tools/image-upscaler`,      lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/batch`,                     lastModified: now, changeFrequency: "weekly",  priority: 0.85 },

    // ── Content ────────────────────────────────────────────────
    { url: `${BASE}/blog`,                      lastModified: now, changeFrequency: "daily",   priority: 0.8 },

    // ── Auth ───────────────────────────────────────────────────
    { url: `${BASE}/auth/signup`,               lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/auth/signin`,               lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // ── Company ────────────────────────────────────────────────
    { url: `${BASE}/contact`,                   lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`,                   lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`,                     lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
