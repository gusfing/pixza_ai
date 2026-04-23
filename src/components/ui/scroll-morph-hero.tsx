"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";

const IMG_WIDTH = 80;
const IMG_HEIGHT = 110;
const TOTAL_IMAGES = 20;

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
      transition={{ type: "spring", stiffness: 50, damping: 18 }}
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
        <div
          className="absolute inset-0 rounded-xl overflow-hidden shadow-lg bg-[#111] flex flex-col items-center justify-center border border-white/10"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mb-1">AI</p>
          <p className="text-[10px] font-medium text-white">Generated</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScrollMorphHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const mouseX = useMotionValue(0);

  // Track real page scroll within this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Smooth the scroll progress to match Lenis feel
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.001 });

  // Split progress into phases:
  // 0.0 → 0.3 : circle forms
  // 0.3 → 1.0 : arc morph + shuffle
  const morphValue = useTransform(smoothProgress, [0, 0.3], [0, 1]);
  const rotateValue = useTransform(smoothProgress, [0.3, 1.0], [0, 360]);
  const smoothMouse = useSpring(mouseX, { stiffness: 30, damping: 20 });

  const [morph, setMorph] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const u1 = morphValue.on("change", setMorph);
    const u2 = rotateValue.on("change", setRotate);
    const u3 = smoothMouse.on("change", setParallax);
    return () => { u1(); u2(); u3(); };
  }, [morphValue, rotateValue, smoothMouse]);

  // Container size
  useEffect(() => {
    const update = () => {
      const el = canvasRef.current;
      setSize({ w: el?.offsetWidth ?? window.innerWidth, h: el?.offsetHeight ?? window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Mouse parallax
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set(((e.clientX - rect.left) / rect.width * 2 - 1) * 80);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mouseX]);

  // Stable scatter positions — tighter radius, orbital feel
  const scatter = useMemo(() => IMAGES.map((_, i) => {
    // Distribute in a loose orbital pattern rather than pure random
    const angle = (i / TOTAL_IMAGES) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
    const radius = 220 + Math.random() * 160;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.6,
      rotation: (Math.random() - 0.5) * 30,
      scale: 0.85 + Math.random() * 0.3,
      opacity: 1,
    };
  }), []);

  // Content fade in when arc forms
  const contentOpacity = useTransform(morphValue, [0.8, 1], [0, 1]);
  const contentY = useTransform(morphValue, [0.8, 1], [20, 0]);
  const introOpacity = useTransform(morphValue, [0, 0.3], [1, 0]);

  return (
    // Tall section — gives scroll room for the animation (300vh)
    <div ref={sectionRef} className="relative" style={{ height: "300vh" }}>
      {/* Sticky canvas — stays in view while section scrolls */}
      <div ref={canvasRef} className="sticky top-0 h-screen w-full overflow-hidden bg-[#0A0A0A]">

        {/* Fade to next section */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

        <div className="flex h-full w-full flex-col items-center justify-center" style={{ perspective: "1000px" }}>

          {/* Intro text — sits above cards with backdrop */}
          <motion.div
            style={{ opacity: introOpacity }}
            className="absolute z-20 flex flex-col items-center text-center pointer-events-none px-6"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-5">Pixza Studio</p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mb-5">
              Create without<br />limits.
            </h1>
            <p className="text-white/40 text-sm font-medium max-w-xs leading-relaxed">
              AI-powered image, video, audio & 3D generation in one studio.
            </p>
            <div className="mt-10 flex items-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-30" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/40" />
              </span>
              Scroll to explore
            </div>
          </motion.div>

          {/* Arc content */}
          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="absolute top-[8%] z-10 flex flex-col items-center text-center pointer-events-none px-4"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">50+ AI Models</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-3">
              Your creative arsenal.
            </h2>
            <p className="text-sm text-white/40 max-w-sm leading-relaxed">
              Hover any card to explore. Every image was generated with Pixza.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="relative flex items-center justify-center w-full h-full">
            {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
              let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

              if (morph === 0) {
                // Scatter phase (before any scroll)
                target = scatter[i];
              } else {
                const isMobile = size.w < 768;
                const minDim = Math.min(size.w, size.h);

                // Circle position
                const circleR = Math.min(minDim * 0.35, 300);
                const cAngle = (i / TOTAL_IMAGES) * 360;
                const cRad = (cAngle * Math.PI) / 180;
                const circlePos = {
                  x: Math.cos(cRad) * circleR,
                  y: Math.sin(cRad) * circleR,
                  rotation: cAngle + 90,
                };

                // Arc position
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
    </div>
  );
}
