"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Codrops-style page transition:
 * - A full-screen overlay wipes in from the bottom, then wipes out to the top
 * - The new page content fades + slides up underneath
 * - Mimics the "both pages coexist" crossfade from the codrops demo
 */

const OVERLAY_VARIANTS = {
  initial:  { scaleY: 0, originY: "100%" },
  enter:    { scaleY: 1, originY: "100%", transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] } },
  exit:     { scaleY: 0, originY: "0%",   transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1], delay: 0.05 } },
};

const PAGE_VARIANTS = {
  initial:  { opacity: 0, y: 24 },
  enter:    { opacity: 1, y: 0,  transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1], delay: 0.35 } },
  exit:     { opacity: 0, y: -16, transition: { duration: 0.25, ease: [0.76, 0, 0.24, 1] } },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Full-screen wipe overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`overlay-${pathname}`}
          className="fixed inset-0 z-[9000] pointer-events-none"
          style={{ background: "linear-gradient(135deg, #0d1117 0%, #1a0a2e 50%, #0d1117 100%)" }}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={OVERLAY_VARIANTS}
        >
          {/* Logo in center of overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.15, duration: 0.3 } }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden">
                <img src="/pixza-logo.png" alt="" className="w-12 h-12 object-cover" />
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-violet-400"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Page content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={PAGE_VARIANTS}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
