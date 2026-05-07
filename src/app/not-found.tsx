import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-8 text-center">
      <p className="text-[120px] font-black text-white/5 leading-none select-none mb-4">404</p>
      <h1 className="text-3xl font-black text-white tracking-tighter mb-3 -mt-8">Page not found</h1>
      <p className="text-white/40 text-sm mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/create"
          className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all"
        >
          Go to Create
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-bold hover:text-white hover:border-white/20 transition-all"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
