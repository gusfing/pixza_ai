"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWPAuth } from "@/lib/wp-auth-context";
import { ArrowLeft, Download, Trash2, RefreshCw, ImageIcon, Video, Music, Box, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  prompt: string;
  model: string;
  provider: string;
  tab: string;
  aspectRatio?: string;
  images: string[];
  createdAt: string;
}

interface DbItem {
  id: string;
  prompt: string;
  mode: string;
  model: string;
  provider: string;
  outputUrl: string | null;
  outputType: string;
  status: string;
  createdAt: string;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const TAB_ICONS: Record<string, any> = {
  Image: ImageIcon, Video, Audio: Music, "3D": Box,
  image: ImageIcon, video: Video, audio: Music, "3d": Box,
};

function MediaThumb({ src, type, prompt }: { src: string; type: string; prompt: string }) {
  const isTruncated = src?.includes("TRUNCATED") || !src;
  if (isTruncated) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-white/[0.02]">
        <ImageIcon className="w-8 h-8 text-white/10" />
        <p className="text-[10px] text-white/20 text-center px-2 line-clamp-2">{prompt}</p>
      </div>
    );
  }
  if (type === "video" || src?.startsWith("data:video")) {
    return <video src={src} className="w-full h-full object-cover" muted />;
  }
  return (
    <img src={src} alt={prompt}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
  );
}

export default function GalleryPage() {
  const { user } = useWPAuth();
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>([]);
  const [dbHistory, setDbHistory] = useState<DbItem[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"local" | "cloud">("local");
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState<{ src: string; prompt: string } | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Load localStorage history
  useEffect(() => {
    import("@/lib/generation-history").then(({ loadHistory }) => {
      setLocalHistory(loadHistory());
    });
  }, []);

  // Load DB history for logged-in users
  const loadDbHistory = useCallback(async () => {
    setDbLoading(true);
    try {
      const res = await fetch("/api/generations?per_page=50");
      if (res.ok) {
        const data = await res.json();
        setDbHistory(data.items ?? []);
      }
    } catch { /* silent */ }
    finally { setDbLoading(false); }
  }, []);

  useEffect(() => {
    if (user && activeTab === "cloud") loadDbHistory();
  }, [user, activeTab, loadDbHistory]);

  const deleteLocal = (id: string) => {
    import("@/lib/generation-history").then(({ deleteFromHistory }) => {
      deleteFromHistory(id);
      setLocalHistory(h => h.filter(x => x.id !== id));
    });
  };

  const clearLocal = () => {
    import("@/lib/generation-history").then(({ clearHistory }) => {
      clearHistory();
      setLocalHistory([]);
    });
  };

  // Filter local history
  const filteredLocal = localHistory.filter(item => {
    if (filter !== "all" && item.tab?.toLowerCase() !== filter) return false;
    if (search && !item.prompt?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredDb = dbHistory.filter(item => {
    if (filter !== "all" && item.mode?.toLowerCase() !== filter) return false;
    if (search && !item.prompt?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = ["all", "image", "video", "audio", "3d"];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#0d1117]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <Link href="/create" className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <h1 className="text-sm font-black tracking-tight">My Gallery</h1>
          <span className="text-[10px] text-white/20 font-bold">
            {activeTab === "local" ? `${filteredLocal.length} items` : `${filteredDb.length} items`}
          </span>
        </div>

        {/* Search */}
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by prompt…"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/8 text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Source tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            <button onClick={() => setActiveTab("local")}
              className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeTab === "local" ? "bg-white text-black" : "text-white/30 hover:text-white")}>
              This Device
            </button>
            <button onClick={() => { setActiveTab("cloud"); if (user) loadDbHistory(); }}
              className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeTab === "cloud" ? "bg-white text-black" : "text-white/30 hover:text-white")}>
              Cloud {!user && <span className="text-white/20">(sign in)</span>}
            </button>
          </div>

          {/* Type filter */}
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={cn("px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all capitalize",
                  filter === t ? "bg-white/10 text-white" : "text-white/20 hover:text-white/60")}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── LOCAL TAB ── */}
        {activeTab === "local" && (
          <>
            {filteredLocal.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ImageIcon className="w-12 h-12 text-white/10 mb-4" />
                <p className="text-white/30 text-sm font-medium">
                  {localHistory.length === 0 ? "No generations yet" : "No results match your search"}
                </p>
                <p className="text-white/15 text-xs mt-1">
                  {localHistory.length === 0 ? "Generate something in Create mode to see it here" : "Try a different search or filter"}
                </p>
                {localHistory.length === 0 && (
                  <Link href="/create" className="mt-6 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all">
                    Start Creating
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <button onClick={clearLocal} className="text-[10px] text-white/20 hover:text-red-400 transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear all
                  </button>
                </div>
                <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
                  {filteredLocal.map(item => {
                    const Icon = TAB_ICONS[item.tab] ?? ImageIcon;
                    return (
                      <div key={item.id} className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 cursor-pointer"
                        onClick={() => {
                          const img = item.images[0];
                          if (img && !img.includes("TRUNCATED")) setLightbox({ src: img, prompt: item.prompt });
                        }}>
                        <div className="w-full min-h-[160px]">
                          <MediaThumb src={item.images[0]} type={item.tab?.toLowerCase()} prompt={item.prompt} />
                        </div>
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                          <div className="flex justify-end gap-1.5">
                            {item.images[0] && !item.images[0].includes("TRUNCATED") && (
                              <a href={item.images[0]} download={`pixza-${item.id}.png`}
                                onClick={e => e.stopPropagation()}
                                className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button onClick={e => { e.stopPropagation(); deleteLocal(item.id); }}
                              className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-red-500 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/70 line-clamp-2 leading-relaxed">{item.prompt}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Icon className="w-3 h-3 text-white/30" />
                              <span className="text-[9px] text-white/30">{item.model?.split("/").pop()}</span>
                              <span className="text-[9px] text-white/20 ml-auto">{fmtDate(item.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        {/* Multiple images badge */}
                        {item.images.length > 1 && (
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                            {item.images.length}×
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── CLOUD TAB ── */}
        {activeTab === "cloud" && (
          <>
            {!user ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-white/30 text-sm mb-4">Sign in to see your cloud history</p>
                <Link href="/auth/signin?next=/gallery" className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all">
                  Sign In
                </Link>
              </div>
            ) : dbLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
              </div>
            ) : filteredDb.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ImageIcon className="w-12 h-12 text-white/10 mb-4" />
                <p className="text-white/30 text-sm">No cloud generations found</p>
                <button onClick={loadDbHistory} className="mt-4 flex items-center gap-2 text-xs text-white/30 hover:text-white transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
            ) : (
              <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
                {filteredDb.map(item => {
                  const Icon = TAB_ICONS[item.mode] ?? ImageIcon;
                  const hasImage = item.outputUrl && item.outputUrl.startsWith("http");
                  return (
                    <div key={item.id} className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 cursor-pointer"
                      onClick={() => hasImage && setLightbox({ src: item.outputUrl!, prompt: item.prompt })}>
                      <div className="w-full min-h-[160px]">
                        {hasImage ? (
                          <img src={item.outputUrl!} alt={item.prompt}
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-40 flex flex-col items-center justify-center gap-2">
                            <Icon className="w-8 h-8 text-white/10" />
                            <p className="text-[10px] text-white/20 text-center px-3 line-clamp-2">{item.prompt}</p>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <div className="flex justify-end">
                          {hasImage && (
                            <a href={item.outputUrl!} download target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] text-white/70 line-clamp-2">{item.prompt}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Icon className="w-3 h-3 text-white/30" />
                            <span className="text-[9px] text-white/30">{item.model?.split("/").pop()}</span>
                            <span className="text-[9px] text-white/20 ml-auto">{fmtDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl max-h-[90vh] flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.prompt}
              className="max-h-[80vh] w-auto rounded-2xl object-contain" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60 line-clamp-1 flex-1">{lightbox.prompt}</p>
              <a href={lightbox.src} download className="ml-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-black hover:bg-white/90 transition-all">
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
