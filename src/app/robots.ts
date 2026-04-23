import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://pixzastudio.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/landing", "/blog", "/examples", "/pricing"],
        disallow: ["/create", "/admin", "/settings", "/gallery", "/api/", "/auth/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
