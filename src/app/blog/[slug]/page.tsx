"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  date: string;
  categories: string[];
  read_time: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog/${slug}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then(d => { if (d) setPost(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  if (notFound || !post) return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-center p-8">
      <p className="text-6xl mb-6">✦</p>
      <h1 className="text-2xl font-black text-white tracking-tighter mb-3">Article not found</h1>
      <p className="text-white/40 text-sm mb-8">This post may have been moved or deleted.</p>
      <Link href="/blog" className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all">
        ← Back to Blog
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans">
      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0d1117]/90 backdrop-blur-xl z-50">
        <Link href="/blog" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-bold">Blog</span>
        </Link>
        <Link href="/create" className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-black hover:bg-white/90 transition-all">
          Start Creating →
        </Link>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-6">
          {post.categories.map(c => (
            <span key={c} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/8">
              {c}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-white/30 mb-10 pb-10 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.read_time}</span>
          </div>
        </div>

        {/* Thumbnail */}
        {post.thumbnail && (
          <div className="rounded-2xl overflow-hidden mb-10 aspect-video">
            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-black prose-headings:tracking-tight
            prose-p:text-white/70 prose-p:leading-relaxed
            prose-a:text-white prose-a:underline prose-a:underline-offset-4
            prose-strong:text-white
            prose-code:text-white/80 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/8
            prose-blockquote:border-l-white/20 prose-blockquote:text-white/50
            prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer CTA */}
        <div className="mt-16 pt-10 border-t border-white/5 text-center">
          <p className="text-white/30 text-sm mb-4">Ready to create with AI?</p>
          <Link href="/create" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all">
            Try Pixza Studio Free →
          </Link>
        </div>
      </article>
    </div>
  );
}
