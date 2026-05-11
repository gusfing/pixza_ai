/**
 * Site Images API
 * Fetches dynamic image URLs from WordPress (managed via Pixza Site Manager plugin)
 * Falls back to default values if WP is unavailable
 */
import { NextResponse } from "next/server";

const WP_URL    = process.env.WP_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? "";
const WP_SECRET = process.env.WP_API_SECRET ?? "";

// Default fallback images
const DEFAULTS: Record<string, string> = {
  hero_video:             "https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4",
  logo:                   "/pixza-logo.png",
  og_image:               "/pixza-logo.png",
  landing_hero:           "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&q=80",
  landing_feature_1:      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  landing_feature_2:      "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?w=800&q=80",
  landing_feature_3:      "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80",
  landing_showcase_1:     "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&q=80",
  landing_showcase_2:     "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1280&q=80",
  landing_showcase_3:     "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
  landing_showcase_4:     "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=80",
  landing_showcase_5:     "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?w=1280&q=80",
  landing_showcase_6:     "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1280&q=80",
  landing_showcase_7:     "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&q=80",
  blog_default_thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  waitlist_bg:            "",
};

export const revalidate = 300; // cache 5 minutes

export async function GET() {
  try {
    if (!WP_URL) return NextResponse.json(DEFAULTS);

    const res = await fetch(`${WP_URL}/?rest_route=${encodeURIComponent("/pixza/v1/site-images")}`, {
      headers: {
        "Content-Type": "application/json",
        "X-WP-Secret": WP_SECRET,
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) return NextResponse.json(DEFAULTS);

    const data = await res.json();
    // Merge with defaults so missing keys always have a value
    const merged = { ...DEFAULTS, ...data };
    // Filter out empty strings — use default instead
    for (const key of Object.keys(merged)) {
      if (!merged[key] && DEFAULTS[key]) merged[key] = DEFAULTS[key];
    }
    return NextResponse.json(merged);
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}
