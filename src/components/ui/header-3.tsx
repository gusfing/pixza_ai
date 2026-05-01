"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { createPortal } from "react-dom";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { LucideIcon } from "lucide-react";
import {
  ImageIcon, Video, Music, Box, Sparkles, Wand2, LayoutGrid,
  BookOpen, Users, Star, FileText, Shield, HelpCircle, Leaf, Zap, Globe,
} from "lucide-react";
import { useWPAuth } from "@/lib/wp-auth-context";

type LinkItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);
  const onScroll = React.useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);
  React.useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);
  React.useEffect(() => { onScroll(); }, [onScroll]);
  return scrolled;
}

export function Header() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300",
        scrolled && "bg-[#0d1117]/98 border-white/5 backdrop-blur-xl"
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        {/* Logo — left */}
        <Link href="/landing" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden transition-transform group-hover:scale-105">
            <img src="/pixza-logo.png" alt="Pixza" className="w-8 h-8 object-cover" />
          </div>
          <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors hidden sm:block">Pixza</span>
        </Link>

        {/* Nav links — center/right (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Product",    href: "/create" },
            { label: "Tools",      href: "/tools" },
            { label: "Pricing",    href: "/landing#pricing" },
            { label: "Studio",     href: "/studio" },
            { label: "Blog",       href: "/blog" },
            { label: "Join Us",    href: "/auth/signup" },
          ].map(l => (
            <Link key={l.label} href={l.href}
              className="px-3 py-1.5 text-[13px] font-semibold text-white/50 hover:text-white transition-colors tracking-wide uppercase">
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA — far right */}
        <div className="flex items-center gap-2 shrink-0">
          <DesktopAuthButtons />
          {/* Mobile toggle */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen(!open)}
            className="md:hidden text-white/60 hover:text-white hover:bg-white/5 h-9 w-9"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <MobileMenu open={open} className="flex flex-col justify-between gap-4">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 px-1">Create</p>
            <div className="space-y-1">
              {createLinks.map(link => (
                <Link key={link.title} href={link.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <link.icon className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/80 group-hover:text-white">{link.title}</div>
                    {link.description && <div className="text-xs text-white/30">{link.description}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 px-1">Company</p>
            <div className="space-y-1">
              {[...companyLinks, ...companyLinks2].map(link => (
                <Link key={link.title} href={link.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <link.icon className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">{link.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <MobileAuthButtons onClose={() => setOpen(false)} />
      </MobileMenu>
    </header>
  );
}

/* ── Auth-aware CTA buttons ──────────────────────────────────── */
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
        <button onClick={logout} className="text-white/30 hover:text-white text-xs transition-colors">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center">
      <Link href="/auth/signin">
        <Button className="bg-white text-black hover:bg-white/90 h-8 text-sm font-semibold px-5 rounded-full border-0">
          Sign In
        </Button>
      </Link>
    </div>
  );
}

function MobileAuthButtons({ onClose }: { onClose: () => void }) {
  const { user, logout } = useWPAuth();

  if (user) {
    return (
      <div className="flex flex-col gap-2 pb-2">
        <Link href="/create" onClick={onClose}>
          <Button variant="outline" className="w-full bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5">
            Create
          </Button>
        </Link>
        <Link href="/studio" onClick={onClose}>
          <Button className="w-full bg-white text-black hover:bg-white/90 font-bold">
            Studio
          </Button>
        </Link>
        <button onClick={() => { logout(); onClose(); }} className="text-white/40 hover:text-white text-sm text-center py-1 transition-colors">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-2">
      <Link href="/auth/signin" onClick={onClose}>
        <Button variant="outline" className="w-full bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5">
          Sign In
        </Button>
      </Link>
      <Link href="/auth/signup" onClick={onClose}>
        <Button className="w-full bg-white text-black hover:bg-white/90 font-bold">
          Get Started
        </Button>
      </Link>
    </div>
  );
}

/* ── Mobile Menu Portal ── */
type MobileMenuProps = React.ComponentProps<"div"> & { open: boolean };

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === "undefined") return null;
  return createPortal(
    <div
      id="mobile-menu"
      className="bg-[#0d1117]/98 backdrop-blur-xl fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-t border-white/5 md:hidden"
    >
      <div
        data-slot={open ? "open" : "closed"}
        className={cn(
          "data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out",
          "size-full p-5",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ── List Item ── */
function ListItem({ title, description, icon: Icon, href, className, ...props }: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
  return (
    <NavigationMenuLink asChild className={cn("w-full", className)} {...props}>
      <Link
        href={href}
        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
      >
        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
        </div>
        <div>
          <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{title}</div>
          {description && <div className="text-xs text-white/30 leading-tight mt-0.5">{description}</div>}
        </div>
      </Link>
    </NavigationMenuLink>
  );
}

/* ── Link Data ── */
const createLinks: LinkItem[] = [
  { title: "Image Generation",  href: "/create",          icon: ImageIcon,  description: "Text to image with 6+ models" },
  { title: "Video Generation",  href: "/create",          icon: Video,      description: "Veo 3, Kling, Wan and more" },
  { title: "Audio Generation",  href: "/create",          icon: Music,      description: "AI music and sound effects" },
  { title: "3D Generation",     href: "/create",          icon: Box,        description: "Image to 3D mesh" },
  { title: "Image Tools",       href: "/create",          icon: Wand2,      description: "Remove BG, upscale, colorize" },
  { title: "Node Studio",       href: "/studio",          icon: LayoutGrid, description: "Visual AI pipeline builder" },
];

const companyLinks: LinkItem[] = [
  { title: "About Us",          href: "/landing",         icon: Sparkles,   description: "Our story and mission" },
  { title: "Blog",              href: "/blog",            icon: Leaf,       description: "Tutorials and updates" },
  { title: "Examples",          href: "/examples",        icon: Star,       description: "See what's possible" },
  { title: "Contact",           href: "/contact",         icon: Users,      description: "Get in touch" },
];

const companyLinks2: LinkItem[] = [
  { title: "Terms of Service",  href: "/terms",           icon: FileText },
  { title: "Privacy Policy",    href: "/privacy",         icon: Shield },
  { title: "Help Center",       href: "/contact",         icon: HelpCircle },
  { title: "API Docs",          href: "#",                icon: Zap },
];

