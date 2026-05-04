"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { cn } from "@/lib/utils";

interface Post {
  id: number; slug: string; title: string; excerpt: string;
  thumbnail: string; author: string; date: string;
  categories: string[]; read_time: string;
}

function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const date = new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="block group">
        <div className="rounded-2xl overflow-hidden border border-white/7 bg-[#161b22] transition-all duration-200 hover:border-white/12 grid grid-cols-1 md:grid-cols-2">
          {/* Thumbnail */}
          <div className="aspect-video bg-gradient-to-br from-[#0a1628] to-[#0d2040] relative overflow-hidden">
            {post.thumbnail
              ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              : <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-15">✦</div>
            }
          </div>
          {/* Content */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="flex gap-2 mb-4 flex-wrap">
              {post.categories.slice(0, 2).map(c => (
                <span key={c} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {c}
                </span>
              ))}
              <span className="text-[10px] text-white/30 self-center">{post.read_time}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-tight mb-3">{post.title}</h2>
            <p className="text-sm text-white/60 leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[11px] font-black text-white shrink-0">
                {post.author[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-white/60">{post.author}</span>
              <span className="text-white/20">·</span>
              <span className="text-sm text-white/30">{date}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="block group h-full">
      <div className="rounded-2xl overflow-hidden border border-white/7 bg-[#161b22] transition-all duration-200 hover:border-white/12 hover:-translate-y-1 hover:shadow-2xl h-full flex flex-col">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-[#0a1628] to-[#0d2040] overflow-hidden relative">
          {post.thumbnail
            ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
            : <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-15">✦</div>
          }
        </div>
        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {post.categories.slice(0, 1).map(c => (
              <span key={c} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/15">
                {c}
              </span>
            ))}
            <span className="text-[10px] text-white/30 self-center">{post.read_time}</span>
          </div>
          <h3 className="text-base font-black text-white tracking-tight leading-snug mb-2">{post.title}</h3>
          <p className="text-xs text-white/60 leading-relaxed mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
          <div className="flex items-center gap-2 mt-auto">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[9px] font-black text-white shrink-0">
              {post.author[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-white/60">{post.author}</span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-xs text-white/30">{date}</span>
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
    <div className="min-h-screen bg-[#0d1117] text-white font-sans antialiased">
      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0d1117]/90 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <img src="/pixza-logo.png" alt="" className="w-6 h-6 rounded-lg object-contain" />
          <span className="text-sm font-bold text-white">Pixza Studio</span>
        </Link>
        <div className="flex gap-5 items-center">
          {[{ label: "Create", href: "/create" }, { label: "Examples", href: "/examples" }, { label: "Studio", href: "/studio" }].map(l => (
            <Link key={l.label} href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-14 pb-20">
        {/* Hero */}
        <div className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3">Blog</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-none">
            Ideas, tutorials &<br />AI creative insights
          </h1>
          <p className="text-base text-white/50 max-w-md mx-auto mb-8">
            Guides, model comparisons, workflow tutorials and product updates from the Pixza Studio team.
          </p>
          {/* Search */}
          <div className="relative max-w-sm mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search articles…"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-violet-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="text-5xl mb-4">✦</div>
            <p className="text-base">No articles found{search ? ` for "${search}"` : ""}.</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && !debouncedSearch && page === 1 && (
              <div className="mb-12">
                <PostCard post={featured} featured />
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <>
                {!debouncedSearch && page === 1 && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-5">
                    Latest articles
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                  {(debouncedSearch ? posts : rest).map(p => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-white/8 text-sm text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={cn(
                      "w-9 h-9 rounded-xl border text-sm font-bold transition-all",
                      n === page
                        ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                        : "border-white/8 text-white/40 hover:text-white"
                    )}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-white/8 text-sm text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Newsletter */}
      <div className="border-t border-white/5 py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-black text-white tracking-tighter mb-3">Stay in the loop</h2>
          <p className="text-sm text-white/50 mb-7">Get new articles, model releases, and workflow tips delivered to your inbox.</p>
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
