"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useWPAuth } from "@/lib/wp-auth-context";
import { wpUpdateUserMeta } from "@/lib/wordpress";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "welcome", title: "Welcome to Pixza", subtitle: "The AI creative studio for everyone", content: "welcome" },
  { id: "mode",    title: "How do you want to create?", subtitle: "You can always switch later", content: "mode" },
  { id: "done",    title: "You're all set!", subtitle: "Let's make something amazing", content: "done" },
];

const MODES = [
  { id: "simple", icon: "✦", label: "Simple Mode",  desc: "One prompt, one output. Perfect for getting started fast." },
  { id: "studio", icon: "⬡", label: "Node Studio",  desc: "Build complex multi-step AI pipelines visually." },
  { id: "both",   icon: "◈", label: "Both",          desc: "I'll use both depending on what I need." },
];

const FEATURES = [
  { icon: "✦", label: "Gemini + FLUX models",   desc: "Imagen 4, FLUX Dev, Seedance video and more" },
  { icon: "⬡", label: "Visual node editor",     desc: "Build complex pipelines without code" },
  { icon: "◈", label: "Simple create mode",     desc: "One prompt, instant results" },
  { icon: "◉", label: "Community templates",    desc: "Start from proven workflows" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { token } = useWPAuth();
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const current = STEPS[step];
  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      if (token) {
        try { await wpUpdateUserMeta(token, { onboarding_done: true } as any); } catch { /* non-fatal */ }
      }
      router.push(selectedMode === "studio" ? "/studio" : "/create");
    }
  };

  const canNext = current.content === "mode" ? !!selectedMode : true;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans antialiased flex flex-col items-center justify-center px-5 py-20">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5">
        <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Logo */}
      <div className="fixed top-5 left-6 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg overflow-hidden">
          <img src="/pixza-logo.png" alt="" className="w-7 h-7 object-cover" />
        </div>
        <span className="text-sm font-bold text-white/70">Pixza Studio</span>
      </div>

      {/* Step counter */}
      <div className="fixed top-6 right-6 text-xs text-white/30 font-bold tabular-nums">
        {step + 1} / {STEPS.length}
      </div>

      {/* Card */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] as [number,number,number,number] }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black tracking-tighter text-white mb-2">{current.title}</h1>
              <p className="text-sm text-white/40">{current.subtitle}</p>
            </div>

            {/* Welcome */}
            {current.content === "welcome" && (
              <div className="flex flex-col gap-3">
                {FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/8">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-base shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{f.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mode selection */}
            {current.content === "mode" && (
              <div className="flex flex-col gap-3">
                {MODES.map(m => (
                  <button key={m.id} onClick={() => setSelectedMode(m.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
                      selectedMode === m.id
                        ? "bg-violet-500/10 border-violet-500/30"
                        : "bg-white/[0.03] border-white/8 hover:border-white/15"
                    )}>
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all",
                      selectedMode === m.id ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-white/40")}>
                      {m.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold transition-colors", selectedMode === m.id ? "text-white" : "text-white/80")}>{m.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{m.desc}</p>
                    </div>
                    {selectedMode === m.id && (
                      <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Done */}
            {current.content === "done" && (
              <div className="text-center">
                <div className="text-6xl mb-6">🎉</div>
                <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto mb-8">
                  Your workspace is ready. Start with a simple prompt or explore the node canvas.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {[
                    { label: "Simple Mode", href: "/create" },
                    { label: "Node Studio", href: "/studio" },
                    { label: "Examples",    href: "/examples" },
                  ].map(l => (
                    <Link key={l.label} href={l.href}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:text-white hover:border-white/20 transition-all">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.push("/landing")}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/40 text-sm font-bold hover:text-white hover:border-white/20 transition-all"
          >
            {step === 0 ? "← Back" : "← Previous"}
          </button>

          <button
            onClick={handleNext}
            disabled={!canNext}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all",
              canNext ? "bg-white text-black hover:bg-white/90" : "bg-white/8 text-white/20 cursor-not-allowed"
            )}
          >
            {step === STEPS.length - 1 ? "Go to Studio" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
