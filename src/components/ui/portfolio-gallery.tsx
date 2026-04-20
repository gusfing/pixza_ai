"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PortfolioGalleryProps {
  title?: string;
  archiveButton?: { text: string; href: string };
  images?: Array<{ src: string; alt: string; title?: string }>;
  className?: string;
  maxHeight?: number;
  spacing?: string;
  onImageClick?: (index: number) => void;
  pauseOnHover?: boolean;
  marqueeRepeat?: number;
}

export function PortfolioGallery({
  title = "Browse the gallery",
  archiveButton = { text: "View all examples", href: "/examples" },
  images: customImages,
  className = "",
  maxHeight = 120,
  spacing = "-space-x-72 md:-space-x-80",
  onImageClick,
  pauseOnHover = true,
  marqueeRepeat = 4,
}: PortfolioGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const defaultImages = [
    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&q=80", alt: "Abstract generative art" },
    { src: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=600&fit=crop&q=80", alt: "AI portrait" },
    { src: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=600&fit=crop&q=80", alt: "Neural network visualization" },
    { src: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&h=600&fit=crop&q=80", alt: "Prismatic wave" },
    { src: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=600&fit=crop&q=80", alt: "Ethereal light" },
    { src: "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?w=800&h=600&fit=crop&q=80", alt: "Digital bloom" },
    { src: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&h=600&fit=crop&q=80", alt: "Cybernetic pulse" },
    { src: "https://images.unsplash.com/photo-1620121692029-d088224efc74?w=800&h=600&fit=crop&q=80", alt: "Neon geometry" },
    { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80", alt: "Mountain landscape" },
    { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80", alt: "Forest light" },
  ];

  const images = customImages || defaultImages;

  return (
    <section
      aria-label={title}
      className={`relative py-20 px-4 ${className}`}
      id="archives"
    >
      <div className="max-w-7xl mx-auto bg-white/[0.02] backdrop-blur-sm rounded-[40px] border border-white/5 overflow-hidden">

        {/* Header */}
        <div className="relative z-10 text-center pt-16 pb-8 px-8">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
            {title}
          </h2>
          <Link
            href={archiveButton.href}
            className="inline-flex items-center gap-3 bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-white/90 transition-colors group mb-20"
          >
            <span>{archiveButton.text}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Desktop — 3D overlapping fan */}
        <div className="hidden md:block relative overflow-hidden h-[400px] -mb-[200px]">
          <div className={`flex ${spacing} pb-8 pt-40 items-end justify-center`}>
            {images.map((image, index) => {
              const total = images.length;
              const middle = Math.floor(total / 2);
              const dist = Math.abs(index - middle);
              const staggerOffset = maxHeight - dist * 20;
              const zIndex = total - index;
              const isHovered = hoveredIndex === index;
              const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;
              const yOffset = isHovered ? -120 : isOtherHovered ? 0 : -staggerOffset;

              return (
                <motion.div
                  key={index}
                  className="group cursor-pointer flex-shrink-0"
                  style={{ zIndex }}
                  initial={{ transform: `perspective(5000px) rotateY(-45deg) translateY(200px)`, opacity: 0 }}
                  animate={{ transform: `perspective(5000px) rotateY(-45deg) translateY(${yOffset}px)`, opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  onClick={() => onImageClick?.(index)}
                >
                  <div
                    className="relative aspect-video w-64 md:w-80 lg:w-96 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105"
                    style={{
                      boxShadow: `rgba(0,0,0,0.01) 0.8px 0px 0.8px 0px, rgba(0,0,0,0.03) 2.4px 0px 2.4px 0px, rgba(0,0,0,0.08) 6.4px 0px 6.4px 0px, rgba(0,0,0,0.4) 20px 0px 20px 0px`,
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover object-left-top grayscale group-hover:grayscale-0 transition-all duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile — marquee */}
        <div className="block md:hidden relative pb-8">
          <div
            className={cn(
              "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
              "flex-row"
            )}
          >
            {Array(marqueeRepeat).fill(0).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex shrink-0 justify-around [gap:var(--gap)]",
                  "animate-marquee flex-row",
                  { "group-hover:[animation-play-state:paused]": pauseOnHover }
                )}
              >
                {images.map((image, index) => (
                  <div
                    key={`${i}-${index}`}
                    className="group cursor-pointer flex-shrink-0"
                    onClick={() => onImageClick?.(index)}
                  >
                    <div
                      className="relative aspect-video w-64 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105"
                      style={{
                        boxShadow: `rgba(0,0,0,0.01) 0.8px 0px 0.8px 0px, rgba(0,0,0,0.03) 2.4px 0px 2.4px 0px, rgba(0,0,0,0.08) 6.4px 0px 6.4px 0px, rgba(0,0,0,0.4) 20px 0px 20px 0px`,
                      }}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover object-left-top grayscale group-hover:grayscale-0 transition-all duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
