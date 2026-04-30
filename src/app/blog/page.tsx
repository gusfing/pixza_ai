"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NewsletterForm } from "@/components/ui/newsletter-form";

const C = {
  bg: "#040406", surface: "#0e0e10", surface2: "#161618",
  border: "rgba(255,255,255,0.07)", text: "#fff",
  text2: "rgba(255,255,255,0.5)", text3: "rgba(255,255,255,0.25)",
  accent: "#92dce5", action: "#d64933",
};

interface Post {
  id: number; slug: string; title: string; excerpt: string;
  thumbnail: string; author: string; date: string;
  categories: string[]; read_time: string;
}

function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const [hov, setHov] = useState(false);
  const date = new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        <div style={{
          borderRadius: 20, overflow: "hidden", border: `1px solid ${hov ? "rgba(255,255,255,0.12)" : C.border}`,
          background: C.surface, transition: "all 0.2s", display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}>
          {/* Thumbnail */}
          <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg,#0a1628,#0d2040)", position: "relative", overflow: "hidden" }}>
            {post.thumbnail
              ? <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hov ? "scale(1.04)" : "scale(1)" }} />
              : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.15 }}>✦</div>
            }
          </div>
          {/* Content */}
          <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {post.categories.slice(0, 2).map(c => (
                <span key={c} style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(146,220,229,0.1)", color: C.accent, border: "1px solid rgba(146,220,229,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c}</span>
              ))}
              <span style={{ fontSize: 10, color: C.text3, padding: "3px 0" }}>{post.read_time}</span>
            </div>
            <h2 style={{ fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 700, color: C.text, margin: "0 0 14px", lineHeight: 1.25, letterSpacing: "-0.02em" }}>{post.title}</h2>
            <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.65, margin: "0 0 24px" }}>{post.excerpt}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#92dce5,#d64933)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#080808" }}>
                {post.author[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: C.text2 }}>{post.author}</span>
              <span style={{ color: C.text3 }}>·</span>
              <span style={{ fontSize: 13, color: C.text3 }}>{date}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        borderRadius: 16, overflow: "hidden", border: `1px solid ${hov ? "rgba(255,255,255,0.12)" : C.border}`,
        background: C.surface, transition: "all 0.2s", height: "100%", display: "flex", flexDirection: "column",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 16px 48px rgba(0,0,0,0.4)" : "none",
      }}>
        {/* Thumbnail */}
        <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg,#0a1628,#0d2040)", overflow: "hidden", position: "relative" }}>
          {post.thumbnail
            ? <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hov ? "scale(1.05)" : "scale(1)" }} />
            : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: 0.15 }}>✦</div>
          }
        </div>
        {/* Content */}
        <div style={{ padding: "20px 22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {post.categories.slice(0, 1).map(c => (
              <span key={c} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(146,220,229,0.1)", color: C.accent, border: "1px solid rgba(146,220,229,0.15)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c}</span>
            ))}
            <span style={{ fontSize: 10, color: C.text3 }}>{post.read_time}</span>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: "0 0 10px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>{post.title}</h3>
          <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, margin: "0 0 16px", flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{post.excerpt}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#92dce5,#d64933)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#080808" }}>
              {post.author[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 12, color: C.text2 }}>{post.author}</span>
            <span style={{ color: C.text3, fontSize: 12 }}>·</span>
            <span style={{ fontSize: 12, color: C.text3 }}>{date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ per_page: "7", page: String(page) });
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`/api/blog?${params}`)
      .then(r => r.json())
      .then(d => { setPosts(d.items ?? []); setTotalPages(d.pages ?? 1); })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50, background: "rgba(4,4,6,0.92)", backdropFilter: "blur(20px)" }}>
        <Link href="/landing" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src="/pixza-logo.png" alt="" style={{ width: 26, height: 26, borderRadius: 7, objectFit: "contain" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Pixza Studio</span>
        </Link>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {[{ label: "Create", href: "/create" }, { label: "Examples", href: "/examples" }, { label: "Studio", href: "/studio" }].map(l => (
            <Link key={l.label} href={l.href} style={{ fontSize: 13, color: C.text2, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.text2)}
            >{l.label}</Link>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 80px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.accent, marginBottom: 14 }}>Blog</p>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 700, letterSpacing: "-0.04em", color: C.text, margin: "0 0 16px", lineHeight: 1.05 }}>
            Ideas, tutorials &<br />AI creative insights
          </h1>
          <p style={{ fontSize: 17, color: C.text2, maxWidth: 480, margin: "0 auto 32px" }}>
            Guides, model comparisons, workflow tutorials and product updates from the Pixza Studio team.
          </p>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 400, margin: "0 auto" }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.text3} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search articles…"
              style={{ width: "100%", padding: "11px 14px 11px 38px", borderRadius: 12, background: C.surface2, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              onFocus={e => (e.target.style.borderColor = C.accent)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(146,220,229,0.2)", borderTopColor: C.accent, animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.text3 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
            <p style={{ fontSize: 16 }}>No articles found{search ? ` for "${search}"` : ""}.</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && !debouncedSearch && page === 1 && (
              <div style={{ marginBottom: 48 }}>
                <PostCard post={featured} featured />
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <>
                {!debouncedSearch && page === 1 && (
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.text3, marginBottom: 20 }}>
                    Latest articles
                  </p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginBottom: 48 }}>
                  {(debouncedSearch ? posts : rest).map(p => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "8px 18px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: page === 1 ? C.text3 : C.text2, cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${n === page ? C.accent : C.border}`, background: n === page ? "rgba(146,220,229,0.1)" : "transparent", color: n === page ? C.accent : C.text2, cursor: "pointer", fontSize: 13, fontWeight: n === page ? 700 : 400 }}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "8px 18px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: page === totalPages ? C.text3 : C.text2, cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 13 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Newsletter */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "64px 24px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Stay in the loop</h2>
          <p style={{ fontSize: 15, color: C.text2, margin: "0 0 28px" }}>Get new articles, model releases, and workflow tips delivered to your inbox.</p>
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
