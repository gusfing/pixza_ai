"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Codrops-style page transition
 * - Overlay wipes in, page swaps, overlay wipes out
 * - Uses a state machine to avoid getting stuck
 */

type Phase = "idle" | "covering" | "covered" | "revealing";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // Phase 1: cover screen
    setPhase("covering");
  }, [pathname]);

  // When covering animation completes → swap content → start revealing
  const handleCoverComplete = () => {
    if (phase !== "covering") return;
    setDisplayChildren(children);
    setPhase("revealing");
  };

  // When revealing animation completes → idle
  const handleRevealComplete = () => {
    if (phase !== "revealing") return;
    setPhase("idle");
  };

  const isAnimating = phase === "covering" || phase === "revealing";

  return (
    <>
      {/* Page content — no animation wrapper needed, swap happens during cover */}
      <div key={pathname}>
        {displayChildren}
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            key="transition-overlay"
            className="fixed inset-0 z-[9000] flex items-center justify-center pointer-events-none"
            style={{ background: "linear-gradient(135deg, #0d1117 0%, #160d2e 50%, #0d1117 100%)" }}
            initial={{ scaleY: 0, transformOrigin: "bottom" }}
            animate={
              phase === "covering"
                ? { scaleY: 1, transformOrigin: "bottom", transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] } }
                : { scaleY: 0, transformOrigin: "top",    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] } }
            }
            onAnimationComplete={phase === "covering" ? handleCoverComplete : handleRevealComplete}
          >
            {/* Logo + dots */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.15, duration: 0.25 } }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/pixza-logo.png" alt="" className="w-10 h-10 object-cover" />
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-violet-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
