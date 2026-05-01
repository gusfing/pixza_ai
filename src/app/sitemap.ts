import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://pixzastudio.com").replace(/\/$/, "");
  const now = new Date();

  return [
    // ── Home / Landing ─────────────────────────────────────────
    {
      url: `${base}/landing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },

    // ── Core App ───────────────────────────────────────────────
    {
      url: `${base}/create`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/studio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/examples`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },

    // ── Tools Hub ──────────────────────────────────────────────
    {
      url: `${base}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${base}/tools/background-remover`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/tools/ai-background`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${base}/tools/object-remover`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${base}/tools/image-upscaler`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },

    // ── Batch ──────────────────────────────────────────────────
    {
      url: `${base}/batch`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },

    // ── Blog ───────────────────────────────────────────────────
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },

    // ── Auth ───────────────────────────────────────────────────
    {
      url: `${base}/auth/signin`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/auth/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/auth/forgot-password`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },

    // ── Company ────────────────────────────────────────────────
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
