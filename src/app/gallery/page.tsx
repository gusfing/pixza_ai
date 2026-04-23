"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWPAuth } from "@/lib/wp-auth-context";
import { Download, ArrowLeft, ImageIcon, Video, Music, Box, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Generation {
  id: string;
  prompt: string;
  outputUrl: string | null;
  outputType: string;
  model: string;
  provider: string;
  status: string;
  createdAt: string;
}

const TYPE_ICON: Record<string, any> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  "3d": Box,
};

export default function GalleryPage() {
  const { user, loading: authLoading } = useWPAuth();
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin?next=/gallery");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/generations?page=${page}&per_page=20`)
      .then(r => r.json())
      .then(data => {
        if (page === 1) setGenerations(data.items ?? []);
        else setGenerations(prev => [...prev, ...(data.items ?? [])]);
        setHasMore((data.items?.length ?? 0) === 20);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, page]);

  if (authLoading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased">
      {/* Nav */}
      <nav className="h-14 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0A0A0A]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <Link href="/create" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold">Studio</span>
          </Link>
          <span className="text-white/10">·</span>
          <span className="text-sm font-black text-white">My Gallery</span>
        </div>
        <Link href="/create" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
          + New Generation
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading && generations.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
              <ImageIcon className="w-10 h-10 text-white/10" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-tighter">No generations yet</h2>
            <p className="text-white/30 text-sm mb-8">Your generated images, videos, and audio will appear here.</p>
            <Link href="/create" className="px-8 py-3 rounded-2xl bg-white text-black font-black text-sm hover:bg-white/90 transition-all">
              Start Creating
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generations.map((gen) => {
                const Icon = TYPE_ICON[gen.outputType] ?? ImageIcon;
                return (
                  <div key={gen.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                    {gen.outputUrl ? (
                      gen.outputType === "video" ? (
                        <video src={gen.outputUrl} className="w-full h-full object-cover" muted />
                      ) : gen.outputType === "audio" ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-10 h-10 text-amber-400/40" />
                        </div>
                      ) : (
                        <img src={gen.outputUrl} alt={gen.prompt} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-10 h-10 text-white/10" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-xs text-white font-medium line-clamp-2 mb-2">{gen.prompt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{gen.model}</span>
                        {gen.outputUrl && (
                          <a
                            href={gen.outputUrl}
                            download
                            className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:text-black transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    {gen.status === "pending" && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                        <RefreshCw className="w-3 h-3 text-white/60 animate-spin" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="px-8 py-3 rounded-2xl border border-white/10 text-white/40 text-sm font-bold hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
                >
                  {loading ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
