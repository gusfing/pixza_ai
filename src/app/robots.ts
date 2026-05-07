import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://pixzastudio.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/create",
          "/studio",
          "/examples",
          "/tools",
          "/tools/background-remover",
          "/tools/ai-background",
          "/tools/object-remover",
          "/tools/image-upscaler",
          "/tools/magic-eraser",
          "/batch",
          "/blog",
          "/waitlist",
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
      // Block AI training crawlers
      {
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "Claude-Web", "Google-Extended"],
        disallow: ["/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
