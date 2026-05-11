import { NextRequest, NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://backend.pixzaai.com";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

function readTime(content: string) {
  const words = stripHtml(content).split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const per_page = searchParams.get("per_page") ?? "7";
  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";

  const qs = new URLSearchParams({ per_page, page, _embed: "1" });
  if (search) qs.set("search", search);

  const res = await fetch(`${WP_URL}/wp-json/wp/v2/posts?${qs}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json({ items: [], pages: 1 }, { status: 200 });
  }

  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? "1");
  const raw: any[] = await res.json();

  const items = raw.map((p: any) => {
    const embedded = p._embedded ?? {};
    const author = embedded["author"]?.[0]?.name ?? "Pixza Team";
    const categories = (embedded["wp:term"]?.[0] ?? []).map((c: any) => c.name);
    const thumbnail =
      embedded["wp:featuredmedia"]?.[0]?.source_url ??
      embedded["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium_large?.source_url ??
      "";

    return {
      id: p.id,
      slug: p.slug,
      title: stripHtml(p.title?.rendered ?? ""),
      excerpt: stripHtml(p.excerpt?.rendered ?? ""),
      thumbnail,
      author,
      date: p.date,
      categories,
      read_time: readTime(p.content?.rendered ?? ""),
    };
  });

  return NextResponse.json({ items, pages: totalPages });
}
