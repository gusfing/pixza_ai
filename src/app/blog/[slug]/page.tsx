"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const C = {
  bg: "#040406", surface: "#0e0e10",
  border: "rgba(255,255,255,0.07)", text: "#fff",
  text2: "rgba(255,255,255,0.5)", text3: "rgba(255,255,255,0.25)",
  accent: "#92dce5",
};

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  authorAvatar: string;
  date: string;
  categories: string[];
  read_time: string;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

function readTime(content: string) {
  const words = stripHtml(content).split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://seashell-peafowl-234313.hostingersite.com";

    fetch(`${WP_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed=1`)
      .then(r => r.json())
      .then((data: any[]) => {
        if (!data?.length) { setNotFound(true); return; }
        const p = data[0];
        const embedded = p._embedded ?? {};
        const author = embedded["author"]?.[0]?.name ?? "Pixza Team";
        const authorAvatar = embedded["author"]?.[0]?.avatar_urls?.["48"] ?? "";
        const categories = (embedded["wp:term"]?.[0] ?? []).map((c: any) => c.name);
        const thumbnail =
          embedded["wp:featuredmedia"]?.[0]?.source_url ??
          embedded["wp:featuredmedia"]?.[0]?.media_details?.sizes?.large?.source_url ?? "";

        setPost({
          id: p.id,
          slug: p.slug,
          title: stripHtml(p.title?.rendered ?? ""),
          content: p.content?.rendered ?? "",
          excerpt: stripHtml(p.excerpt?.rendered ?? ""),
          thumbnail,
          author,
          authorAvatar,
          date: p.date,
          categories,
          read_time: readTime(p.content?.rendered ?? ""),
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(146,220,229,0.2)", borderTopColor: C.accent, animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound || !post) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.text, gap: 16 }}>
      <div style={{ fontSize: 48 }}>✦</div>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Post not found</h1>
      <Link href="/blog" style={{ color: C.accent, textDecoration: "none", fontSize: 14 }}>← Back to Blog</Link>
    </div>
  );

  const date = new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50, background: "rgba(4,4,6,0.92)", backdropFilter: "blur(20px)" }}>
        <Link href="/landing" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src="/pixza-logo.png" alt="" style={{ width: 26, height: 26, borderRadius: 7, objectFit: "contain" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Pixza Studio</span>
        </Link>
        <Link href="/blog" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.text2, textDecoration: "none" }}>
          <ArrowLeft size={14} /> Blog
        </Link>
      </header>

      <article style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 100px" }}>
        {/* Categories */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {post.categories.map(c => (
            <span key={c} style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(146,220,229,0.1)", color: C.accent, border: "1px solid rgba(146,220,229,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c}</span>
          ))}
          <span style={{ fontSize: 10, color: C.text3, padding: "3px 0" }}>{post.read_time}</span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 24px", color: C.text }}>
          {post.title}
        </h1>

        {/* Author + date */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, paddingBottom: 32, borderBottom: `1px solid ${C.border}` }}>
          {post.authorAvatar
            ? <img src={post.authorAvatar} alt={post.author} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
            : <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#92dce5,#d64933)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#080808" }}>{post.author[0]?.toUpperCase()}</div>
          }
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{post.author}</div>
            <div style={{ fontSize: 12, color: C.text3 }}>{date}</div>
          </div>
        </div>

        {/* Featured image */}
        {post.thumbnail && (
          <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 40, aspectRatio: "16/9" }}>
            <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Content */}
        <div
          className="wp-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{ color: C.text2, lineHeight: 1.8, fontSize: 16 }}
        />
      </article>

      {/* WP content styles */}
      <style>{`
        .wp-content h1,.wp-content h2,.wp-content h3,.wp-content h4 {
          color: #fff; font-weight: 700; letter-spacing: -0.02em; margin: 2em 0 0.75em; line-height: 1.25;
        }
        .wp-content h2 { font-size: 1.6em; }
        .wp-content h3 { font-size: 1.3em; }
        .wp-content p { margin: 0 0 1.4em; }
        .wp-content a { color: #92dce5; text-decoration: underline; text-underline-offset: 3px; }
        .wp-content img { max-width: 100%; border-radius: 12px; margin: 1.5em 0; }
        .wp-content pre,.wp-content code { background: #0e0e10; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; font-family: monospace; font-size: 0.9em; }
        .wp-content pre { padding: 1.2em; overflow-x: auto; margin: 1.5em 0; }
        .wp-content code { padding: 2px 6px; }
        .wp-content ul,.wp-content ol { padding-left: 1.5em; margin: 0 0 1.4em; }
        .wp-content li { margin-bottom: 0.4em; }
        .wp-content blockquote { border-left: 3px solid #92dce5; margin: 1.5em 0; padding: 0.5em 0 0.5em 1.2em; color: rgba(255,255,255,0.6); font-style: italic; }
        .wp-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 2em 0; }
        .wp-content figure { margin: 1.5em 0; }
        .wp-content figcaption { font-size: 0.85em; color: rgba(255,255,255,0.3); text-align: center; margin-top: 0.5em; }
      `}</style>
    </div>
  );
}
