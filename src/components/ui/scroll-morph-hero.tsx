"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";

export type AnimationPhase = "scatter" | "line" | "circle";

const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 2400;

const IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80",
  "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=300&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80",
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&q=80",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&q=80",
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300&q=80",
  "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&q=80",
  "https://images.unsplash.com/photo-1635776062127-d3b036db9f20?w=300&q=80",
];

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

function FlipCard({ src, index, target }: {
  src: string; index: number;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}) {
  return (
    <motion.div
      animate={{ x: target.x, y: target.y, rotate: target.rotation, scale: target.scale, opacity: target.opacity }}
      transition={{ type: "spring", stiffness: 40, damping: 15 }}
      style={{ position: "absolute", width: IMG_WIDTH, height: IMG_HEIGHT, transformStyle: "preserve-3d" }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        <div className="absolute inset-0 rounded-xl overflow-hidden shadow-lg" style={{ backfaceVisibility: "hidden" }}>
          <img src={src} alt={`card-${index}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
        </div>
        <div className="absolute inset-0 rounded-xl overflow-hidden shadow-lg bg-[#111] flex flex-col items-center justify-center border border-white/10"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">AI</p>
          <p className="text-[10px] font-medium text-white">Generated</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScrollMorphHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [phase, setPhase] = useState<AnimationPhase>("scatter");
  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0);
  const mouseX = useMotionValue(0);

  // Get container size — use window size as fallback
  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      setSize({
        w: el ? el.offsetWidth : window.innerWidth,
        h: el ? el.offsetHeight : window.innerHeight,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Intro sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("line"), 600);
    const t2 = setTimeout(() => setPhase("circle"), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Virtual scroll — only intercept when not at boundaries
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const cur = scrollRef.current;
      const next = Math.min(Math.max(cur + e.deltaY, 0), MAX_SCROLL);
      // Only intercept if we're mid-animation (not at 0 scrolling up, not at MAX scrolling down)
      if ((e.deltaY > 0 && cur < MAX_SCROLL) || (e.deltaY < 0 && cur > 0)) {
        e.preventDefault();
        scrollRef.current = next;
        virtualScroll.set(next);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [virtualScroll]);

  // Mouse parallax
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set(((e.clientX - rect.left) / rect.width * 2 - 1) * 80);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mouseX]);

  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });
  const scrollRotate = useTransform(virtualScroll, [600, MAX_SCROLL], [0, 360]);
  const smoothRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });
  const smoothMouse = useSpring(mouseX, { stiffness: 30, damping: 20 });

  const [morph, setMorph] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const u1 = smoothMorph.on("change", setMorph);
    const u2 = smoothRotate.on("change", setRotate);
    const u3 = smoothMouse.on("change", setParallax);
    return () => { u1(); u2(); u3(); };
  }, [smoothMorph, smoothRotate, smoothMouse]);

  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  // Stable scatter positions
  const scatter = useMemo(() => IMAGES.map(() => ({
    x: (Math.random() - 0.5) * 1200,
    y: (Math.random() - 0.5) * 800,
    rotation: (Math.random() - 0.5) * 160,
    scale: 0.7,
    opacity: 1, // visible from the start
  })), []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0A0A0A] overflow-hidden">
      <div className="flex h-full w-full flex-col items-center justify-center" style={{ perspective: "1000px" }}>

        {/* Intro text */}
        <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={phase === "circle" && morph < 0.5
              ? { opacity: Math.max(0, 1 - morph * 2.5), y: 0, filter: "blur(0px)" }
              : phase === "line"
              ? { opacity: 0, y: 0, filter: "blur(10px)" }
              : { opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-black tracking-tighter text-white"
          >
            The future is built on AI.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={phase === "circle" && morph < 0.4 ? { opacity: 0.4 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 text-[10px] font-black tracking-[0.3em] text-white/30 uppercase"
          >
            Scroll to explore
          </motion.p>
        </div>

        {/* Arc content */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="absolute top-[8%] z-10 flex flex-col items-center text-center pointer-events-none px-4"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-3">Explore Our Vision</h2>
          <p className="text-sm text-white/40 max-w-md leading-relaxed">
            Discover a world where technology meets creativity.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="relative flex items-center justify-center w-full h-full">
          {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

            if (phase === "scatter") {
              target = scatter[i];
            } else if (phase === "line") {
              const spacing = 70;
              target = { x: i * spacing - (TOTAL_IMAGES * spacing) / 2, y: 0, rotation: 0, scale: 1, opacity: 1 };
            } else {
              // Circle → Arc morph
              const isMobile = size.w < 768;
              const minDim = Math.min(size.w, size.h);
              const circleR = Math.min(minDim * 0.35, 320);
              const cAngle = (i / TOTAL_IMAGES) * 360;
              const cRad = (cAngle * Math.PI) / 180;
              const circlePos = {
                x: Math.cos(cRad) * circleR,
                y: Math.sin(cRad) * circleR,
                rotation: cAngle + 90,
              };

              const arcR = Math.min(size.w, size.h * 1.5) * (isMobile ? 1.4 : 1.1);
              const arcCenterY = size.h * (isMobile ? 0.35 : 0.25) + arcR;
              const spread = isMobile ? 100 : 130;
              const startA = -90 - spread / 2;
              const step = spread / (TOTAL_IMAGES - 1);
              const shift = -(Math.min(Math.max(rotate / 360, 0), 1)) * spread * 0.8;
              const aAngle = startA + i * step + shift;
              const aRad = (aAngle * Math.PI) / 180;
              const arcPos = {
                x: Math.cos(aRad) * arcR + parallax,
                y: Math.sin(aRad) * arcR + arcCenterY,
                rotation: aAngle + 90,
                scale: isMobile ? 1.4 : 1.8,
              };

              target = {
                x: lerp(circlePos.x, arcPos.x, morph),
                y: lerp(circlePos.y, arcPos.y, morph),
                rotation: lerp(circlePos.rotation, arcPos.rotation, morph),
                scale: lerp(1, arcPos.scale, morph),
                opacity: 1,
              };
            }

            return <FlipCard key={i} src={src} index={i} target={target} />;
          })}
        </div>
      </div>
    </div>
  );
}
