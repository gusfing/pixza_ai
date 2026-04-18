"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const C = {
  bg: "#040406", surface: "#0e0e10", surface2: "#161618",
  border: "rgba(255,255,255,0.07)", text: "#fff",
  text2: "rgba(255,255,255,0.5)", text3: "rgba(255,255,255,0.25)",
  accent: "#92dce5", action: "#d64933",
};

interface Post {
  id: number; slug: string; title: string; excerpt: string;
  content: string; thumbnail: string; author: string;
  date: string; categories: string[]; read_time: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`${process.env.NEXT_PUBLIC_WP_URL}/wp-json/pixza/v1/posts/${slug}`)
      .then(r => r.json())
      .then(d => { setPost(d); })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));

    // Fetch related posts
    fetch(`${process.env.NEXT_PUBLIC_WP_URL}/wp-json/pixza/v1/posts?per_page=3`)
      .then(r => r.json())
      .then(d => setRelated((d.items ?? []).filter((p: Post) => p.slug !== slug).slice(0, 3)))
      .catch(() => {});
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(146,220,229,0.2)", borderTopColor: C.accent, animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!post) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ fontSize: 48, color: C.text3 }}>✦</div>
      <p style={{ fontSize: 18, color: C.text2 }}>Article not found</p>
      <Link href="/blog" style={{ color: C.accent, textDecoration: "none", fontSize: 14 }}>← Back to blog</Link>
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
        <Link href="/blog" style={{ fontSize: 13, color: C.text2, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          All articles
        </Link>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 0" }}>
        {/* Categories */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {post.categories.map(c => (
            <span key={c} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(146,220,229,0.1)", color: C.accent, border: "1px solid rgba(146,220,229,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c}</span>
          ))}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, letterSpacing: "-0.03em", color: C.text, margin: "0 0 20px", lineHeight: 1.1 }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36, paddingBottom: 28, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#92dce5,#d64933)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#080808" }}>
            {post.author[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{post.author}</div>
            <div style={{ fontSize: 12, color: C.text3 }}>{date} · {post.read_time}</div>
          </div>
        </div>

        {/* Thumbnail */}
        {post.thumbnail && (
          <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 40, aspectRatio: "16/9" }}>
            <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(238,229,233,0.8)" }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: "0 0 4px" }}>Share this article</p>
            <p style={{ fontSize: 13, color: C.text3, margin: 0 }}>Help others discover Pixza Studio</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Twitter/X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://pixzastudio.com/blog/${post.slug}`)}` },
              { label: "Copy link", href: "#" },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ padding: "8px 16px", borderRadius: 9, border: `1px solid ${C.border}`, color: C.text2, fontSize: 13, textDecoration: "none", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.accent; (e.currentTarget as HTMLElement).style.color = C.accent; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.text2; }}
              >{s.label}</a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 48, padding: "32px 36px", borderRadius: 20, background: "linear-gradient(135deg, rgba(146,220,229,0.06), rgba(214,73,51,0.06))", border: `1px solid ${C.border}`, textAlign: "center" }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 10px", letterSpacing: "-0.02em" }}>Try it yourself</h3>
          <p style={{ fontSize: 15, color: C.text2, margin: "0 0 24px" }}>Build your first AI workflow in minutes — no code required.</p>
          <Link href="/create" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, background: C.accent, color: "#080808", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Start creating free →
          </Link>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "56px 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.text3, marginBottom: 24 }}>More articles</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {related.map(p => {
                const d = new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <Link key={p.id} href={`/blog/${p.slug}`} style={{ textDecoration: "none", padding: "20px", borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, display: "block", transition: "border-color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
                  >
                    <p style={{ fontSize: 11, color: C.text3, margin: "0 0 8px" }}>{d} · {p.read_time}</p>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: "0 0 8px", lineHeight: 1.3 }}>{p.title}</h4>
                    <p style={{ fontSize: 13, color: C.text2, margin: 0, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.excerpt}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Article content styles */}
      <style>{`
        .prose h2 { font-size: 22px; font-weight: 700; color: #fff; margin: 36px 0 14px; letter-spacing: -0.02em; }
        .prose h3 { font-size: 18px; font-weight: 600; color: #fff; margin: 28px 0 10px; }
        .prose p  { margin: 0 0 20px; }
        .prose ul, .prose ol { padding-left: 24px; margin: 0 0 20px; }
        .prose li { margin-bottom: 8px; }
        .prose strong { color: #fff; font-weight: 600; }
        .prose a  { color: #92dce5; text-decoration: underline; }
        .prose blockquote { border-left: 3px solid #92dce5; padding-left: 20px; margin: 24px 0; color: rgba(238,229,233,0.6); font-style: italic; }
        .prose code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: monospace; }
        .prose pre  { background: #161618; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; overflow-x: auto; margin: 24px 0; }
        .prose img  { width: 100%; border-radius: 12px; margin: 24px 0; }
      `}</style>
    </div>
  );
}
