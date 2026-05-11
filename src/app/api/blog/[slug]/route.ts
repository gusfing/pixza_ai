import { NextRequest, NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://backend.pixzaai.com";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

function readTime(content: string) {
  const words = stripHtml(content).split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const res = await fetch(
    `${WP_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed=1`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const raw: any[] = await res.json();
  if (!raw.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const p = raw[0];
  const embedded = p._embedded ?? {};
  const author = embedded["author"]?.[0]?.name ?? "Pixza Team";
  const categories = (embedded["wp:term"]?.[0] ?? []).map((c: any) => c.name);
  const thumbnail =
    embedded["wp:featuredmedia"]?.[0]?.source_url ??
    embedded["wp:featuredmedia"]?.[0]?.media_details?.sizes?.large?.source_url ?? "";

  return NextResponse.json({
    id: p.id,
    slug: p.slug,
    title: stripHtml(p.title?.rendered ?? ""),
    content: p.content?.rendered ?? "",
    excerpt: stripHtml(p.excerpt?.rendered ?? ""),
    thumbnail,
    author,
    date: p.date,
    categories,
    read_time: readTime(p.content?.rendered ?? ""),
  });
}
