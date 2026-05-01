import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://pixzastudio.com").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/landing",
          "/create",
          "/studio",
          "/examples",
          "/tools",
          "/tools/background-remover",
          "/tools/ai-background",
          "/tools/object-remover",
          "/tools/image-upscaler",
          "/batch",
          "/blog",
          "/auth/signin",
          "/auth/signup",
          "/contact",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/admin",
          "/settings",
          "/gallery",
          "/profile",
          "/onboarding",
          "/auth/error",
          "/auth/forgot-password",
          "/api/",
        ],
      },
      // Block AI crawlers from scraping generated content
      {
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "Claude-Web"],
        disallow: ["/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
