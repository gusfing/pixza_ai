"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { createPortal } from "react-dom";
import { useWPAuth } from "@/lib/wp-auth-context";
import {
  ImageIcon, Video, Music, Box, Sparkles, Wand2, LayoutGrid,
  BookOpen, Users, Star, FileText, Shield, HelpCircle, Leaf, Zap,
  Scissors, ZoomIn, Eraser, Layers, ChevronDown, ArrowRight,
  Cpu, Globe, CreditCard,
} from "lucide-react";

function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);
  const onScroll = React.useCallback(() => setScrolled(window.scrollY > threshold), [threshold]);
  React.useEffect(() => { window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, [onScroll]);
  React.useEffect(() => { onScroll(); }, [onScroll]);
  return scrolled;
}

/* ── Mega Menu Data ─────────────────────────────────────────── */
const PRODUCT_MENU = {
  featured: {
    title: "Simple Create Mode",
    desc: "One prompt → image, video, audio or 3D. The fastest way to create.",
    href: "/create",
    badge: "Free",
  },
  sections: [
    {
      label: "Generate",
      items: [
        { icon: ImageIcon,  title: "Image Generation",  desc: "FLUX.2, Imagen 4, Gemini Flash",  href: "/create", badge: "Free" },
        { icon: Video,      title: "Video Generation",  desc: "Veo 3, Seedance, Wan 2.1",        href: "/create", badge: "Pro" },
        { icon: Music,      title: "Audio Generation",  desc: "AI music and sound effects",       href: "/create" },
        { icon: Box,        title: "3D Generation",     desc: "Image to 3D mesh",                 href: "/create" },
      ],
    },
    {
      label: "Studio",
      items: [
        { icon: LayoutGrid, title: "Node Studio",       desc: "Visual AI pipeline builder",       href: "/studio", badge: "New" },
        { icon: Layers,     title: "Batch Editor",      desc: "Process 50 images at once",        href: "/batch" },
        { icon: Star,       title: "Examples",          desc: "Community-made workflows",          href: "/examples" },
      ],
    },
  ],
};

const TOOLS_MENU = [
  { icon: Scissors, title: "Background Remover", desc: "Remove any background instantly",     href: "/tools/background-remover", badge: "Free" },
  { icon: Eraser,   title: "Magic Eraser",       desc: "Paint to erase, AI fills it in",      href: "/tools/magic-eraser",       badge: "Free" },
  { icon: Wand2,    title: "AI Background",      desc: "Replace bg with AI-generated scene",  href: "/tools/ai-background",      badge: "Free" },
  { icon: ZoomIn,   title: "Image Upscaler",     desc: "Enhance and sharpen with AI",          href: "/tools/image-upscaler",     badge: "Free" },
  { icon: Eraser,   title: "Object Remover",     desc: "Remove unwanted objects",              href: "/tools/object-remover",     badge: "Free" },
  { icon: Layers,   title: "Batch Editor",       desc: "Apply ops to 50 images at once",       href: "/batch",                    badge: "Free" },
];

const COMPANY_MENU = [
  { icon: Sparkles,    title: "About",         desc: "Our story and mission",          href: "/about" },
  { icon: Leaf,        title: "Blog",          desc: "Tutorials, guides, updates",     href: "/blog" },
  { icon: Users,       title: "Contact",       desc: "Get in touch with us",           href: "/contact" },
  { icon: CreditCard,  title: "Pricing",       desc: "Free, Pro, Agency plans",        href: "/#pricing" },
  { icon: FileText,    title: "Terms",         desc: "Terms of service",               href: "/terms" },
  { icon: Shield,      title: "Privacy",       desc: "Privacy policy",                 href: "/privacy" },
];

/* ── Mega Menu Dropdown ─────────────────────────────────────── */
function MegaMenuProduct() {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[680px] bg-[#0d1117]/98 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 p-5">
      <div className="grid grid-cols-3 gap-4">
        {/* Featured */}
        <div className="col-span-1">
          <Link href={PRODUCT_MENU.featured.href}
            className="block p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/15 hover:border-violet-500/30 transition-all group h-full">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-violet-400 mb-1">{PRODUCT_MENU.featured.badge}</div>
            <h3 className="text-sm font-black text-white mb-1.5">{PRODUCT_MENU.featured.title}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{PRODUCT_MENU.featured.desc}</p>
            <div className="flex items-center gap-1 mt-3 text-[11px] font-bold text-violet-400 group-hover:gap-2 transition-all">
              Try now <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>

        {/* Sections */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {PRODUCT_MENU.sections.map(section => (
            <div key={section.label}>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2 px-1">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <Link key={item.title} href={item.href}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{item.title}</span>
                        {item.badge && (
                          <span className={cn("text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full",
                            item.badge === "Free" ? "bg-green-500/15 text-green-400" :
                            item.badge === "Pro"  ? "bg-violet-500/15 text-violet-400" :
                            "bg-amber-500/15 text-amber-400"
                          )}>{item.badge}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/30 truncate">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MegaMenuTools() {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-[#0d1117]/98 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/25">Free AI Tools</p>
        <Link href="/tools" className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-0.5">
        {TOOLS_MENU.map(item => (
          <Link key={item.title} href={item.href}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <item.icon className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{item.title}</span>
                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400">{item.badge}</span>
              </div>
              <p className="text-[10px] text-white/30 truncate">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MegaMenuCompany() {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[360px] bg-[#0d1117]/98 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 p-4">
      <div className="grid grid-cols-2 gap-0.5">
        {COMPANY_MENU.map(item => (
          <Link key={item.title} href={item.href}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <item.icon className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
            </div>
            <div>
              <div className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{item.title}</div>
              <div className="text-[10px] text-white/30">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Nav Item with Mega Menu ────────────────────────────────── */
function NavItem({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className={cn(
          "flex items-center gap-1 px-3 py-1.5 text-[13px] font-semibold tracking-wide uppercase transition-colors",
          open ? "text-white" : "text-white/50 hover:text-white"
        )}
      >
        {label}
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && children}
    </div>
  );
}

/* ── Main Header ────────────────────────────────────────────── */
export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const scrolled = useScroll(10);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300",
      scrolled && "bg-[#0d1117]/98 border-white/5 backdrop-blur-xl"
    )}>
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden transition-transform group-hover:scale-105">
            <img src="/pixza-logo.png" alt="Pixza" className="w-8 h-8 object-cover" />
          </div>
          <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors hidden sm:block">Pixza</span>
        </Link>

        {/* Desktop mega nav */}
        <div className="hidden md:flex items-center gap-0.5">
          <NavItem label="Product">
            <MegaMenuProduct />
          </NavItem>
          <NavItem label="Tools">
            <MegaMenuTools />
          </NavItem>
          <Link href="/#pricing"
            className="px-3 py-1.5 text-[13px] font-semibold text-white/50 hover:text-white transition-colors tracking-wide uppercase">
            Pricing
          </Link>
          <Link href="/studio"
            className="px-3 py-1.5 text-[13px] font-semibold text-white/50 hover:text-white transition-colors tracking-wide uppercase">
            Studio
          </Link>
          <Link href="/blog"
            className="px-3 py-1.5 text-[13px] font-semibold text-white/50 hover:text-white transition-colors tracking-wide uppercase">
            Blog
          </Link>
          <NavItem label="Company">
            <MegaMenuCompany />
          </NavItem>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <DesktopAuthButtons />
          <Button
            size="icon" variant="ghost"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/60 hover:text-white hover:bg-white/5 h-9 w-9"
          >
            <MenuToggleIcon open={mobileOpen} className="size-5" duration={300} />
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

/* ── Auth Buttons ───────────────────────────────────────────── */
function DesktopAuthButtons() {
  const { user, logout } = useWPAuth();
  if (user) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Link href="/create">
          <Button className="bg-white/10 text-white hover:bg-white/20 h-8 text-sm font-semibold px-4 rounded-full border-0">
            Dashboard
          </Button>
        </Link>
        <button onClick={logout} className="text-white/30 hover:text-white text-xs transition-colors">Sign out</button>
      </div>
    );
  }
  return (
    <div className="hidden md:flex items-center gap-2">
      <Link href="/auth/signin">
        <Button variant="ghost" className="text-white/60 hover:text-white h-8 text-sm font-semibold px-4 rounded-full">
          Sign In
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button className="bg-white text-black hover:bg-white/90 h-8 text-sm font-semibold px-5 rounded-full border-0">
          Get Started
        </Button>
      </Link>
    </div>
  );
}

/* ── Mobile Menu ────────────────────────────────────────────── */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useWPAuth();
  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div className="bg-[#0d1117]/98 backdrop-blur-xl fixed top-16 inset-x-0 bottom-0 z-40 flex flex-col overflow-y-auto border-t border-white/5 md:hidden">
      <div className="p-5 space-y-6 flex-1">

        {/* Product */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2 px-1">Product</p>
          <div className="space-y-0.5">
            {PRODUCT_MENU.sections.flatMap(s => s.items).map(item => (
              <Link key={item.title} href={item.href} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white/80 group-hover:text-white">{item.title}</div>
                  <div className="text-xs text-white/30">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2 px-1">Free Tools</p>
          <div className="space-y-0.5">
            {TOOLS_MENU.slice(0, 4).map(item => (
              <Link key={item.title} href={item.href} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                </div>
                <span className="text-sm font-bold text-white/80 group-hover:text-white">{item.title}</span>
              </Link>
            ))}
            <Link href="/tools" onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
              View all tools <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Company */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2 px-1">Company</p>
          <div className="space-y-0.5">
            {COMPANY_MENU.slice(0, 4).map(item => (
              <Link key={item.title} href={item.href} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group">
                <item.icon className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Auth */}
      <div className="p-5 border-t border-white/5">
        {user ? (
          <div className="flex flex-col gap-2">
            <Link href="/create" onClick={onClose}>
              <Button className="w-full bg-white text-black hover:bg-white/90 font-bold">Dashboard</Button>
            </Link>
            <button onClick={() => { logout(); onClose(); }} className="text-white/40 hover:text-white text-sm text-center py-1 transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/auth/signup" onClick={onClose}>
              <Button className="w-full bg-white text-black hover:bg-white/90 font-bold">Get Started Free</Button>
            </Link>
            <Link href="/auth/signin" onClick={onClose}>
              <Button variant="outline" className="w-full bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
