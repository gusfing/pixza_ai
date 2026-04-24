"use client";

import { useEffect, Component, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useWPAuth } from "@/lib/wp-auth-context";
import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with WebGL
const InfiniteGallery = dynamic(
  () => import("@/components/ui/3d-gallery-photography"),
  { ssr: false, loading: () => <GalleryLoading /> }
);

function GalleryLoading() {
  return (
    <div className="h-screen w-full bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
    </div>
  );
}

// Error boundary to catch WebGL failures gracefully
class GalleryErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <GalleryFallback />;
    return this.props.children;
  }
}

function GalleryFallback() {
  return (
    <div className="h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center gap-6 text-center px-6">
      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center">
        <ImageIcon className="w-10 h-10 text-white/20" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-white tracking-tighter mb-2">WebGL unavailable</h2>
        <p className="text-white/30 text-sm">Your browser doesn't support WebGL or it's disabled.</p>
      </div>
      <Link href="/create" className="px-6 py-3 rounded-2xl bg-white text-black font-black text-sm hover:bg-white/90 transition-all">
        Go to Studio
      </Link>
    </div>
  );
}

// Proxy Unsplash images through our server to avoid CORS issues with WebGL
function proxyUrl(url: string) {
  return `/api/proxy-image?url=${encodeURIComponent(url.replace("&crossorigin=anonymous", ""))}`;
}

const RAW_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&q=80",
  "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
  "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?w=600&q=80",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=600&q=80",
  "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=600&q=80",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80",
  "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80",
];

const GALLERY_IMAGES = RAW_IMAGES.map((src, i) => ({
  src: proxyUrl(src),
  alt: `Gallery image ${i + 1}`,
}));

export default function GalleryPage() {
  const { user, loading: authLoading } = useWPAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/signin?next=/gallery");
  }, [authLoading, user, router]);

  if (authLoading) return <GalleryLoading />;

  return (
    <main className="min-h-screen h-full w-full bg-[#0A0A0A]">
      <GalleryErrorBoundary>
        <InfiniteGallery
          images={GALLERY_IMAGES}
          speed={1.2}
          visibleCount={12}
          className="h-screen w-full"
          fadeSettings={{
            fadeIn: { start: 0.05, end: 0.25 },
            fadeOut: { start: 0.4, end: 0.43 },
          }}
          blurSettings={{
            blurIn: { start: 0.0, end: 0.1 },
            blurOut: { start: 0.4, end: 0.43 },
            maxBlur: 8.0,
          }}
        />
      </GalleryErrorBoundary>

      {/* Overlay */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center text-center px-4 mix-blend-exclusion">
        <h1 className="font-black text-5xl md:text-8xl tracking-tighter text-white leading-none">
          <span className="italic font-thin opacity-60">Your</span><br />Gallery
        </h1>
      </div>

      {/* Back */}
      <Link href="/create"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
        <ArrowLeft className="w-4 h-4" /> Studio
      </Link>

      {/* Instructions */}
      <div className="fixed bottom-8 left-0 right-0 text-center pointer-events-none z-50">
        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">
          Scroll or use arrow keys · Hover to interact
        </p>
      </div>
    </main>
  );
}
