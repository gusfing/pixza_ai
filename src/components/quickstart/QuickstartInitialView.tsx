"use client";

import { motion } from "framer-motion";

interface QuickstartInitialViewProps {
  onNewProject: () => void;
  onSelectTemplates: () => void;
  onSelectVibe: () => void;
  onSelectLoad: () => void;
}

const actions = [
  {
    key: "new",
    title: "New project",
    description: "Start with a blank canvas",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    ),
    accent: "rgba(255,255,255,0.06)",
    accentHover: "rgba(255,255,255,0.1)",
  },
  {
    key: "load",
    title: "Open workflow",
    description: "Load an existing file",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
    ),
    accent: "rgba(255,255,255,0.06)",
    accentHover: "rgba(255,255,255,0.1)",
  },
  {
    key: "templates",
    title: "Templates",
    description: "Start from a pre-built workflow",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    ),
    accent: "rgba(255,255,255,0.06)",
    accentHover: "rgba(255,255,255,0.1)",
  },
  {
    key: "vibe",
    title: "Prompt a workflow",
    description: "Describe it, AI builds it",
    badge: "Beta",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    ),
    accent: "rgba(255,255,255,0.06)",
    accentHover: "rgba(255,255,255,0.1)",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] } },
};

export function QuickstartInitialView({
  onNewProject, onSelectTemplates, onSelectVibe, onSelectLoad,
}: QuickstartInitialViewProps) {
  const handlers: Record<string, () => void> = {
    new: onNewProject, load: onSelectLoad, templates: onSelectTemplates, vibe: onSelectVibe,
  };

  return (
    <div className="flex h-full min-h-0">
      {/* ── Left panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="w-60 shrink-0 flex flex-col p-7"
        style={{
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background: "linear-gradient(160deg, #141414 0%, #0e0e0e 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <img src="/pixza-logo.png" alt="" className="w-5 h-5 invert" />
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-white">Pixza Studio</div>
            <div className="text-[10px] text-white/30">Node Workflow Editor</div>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-white/40 mb-8">
          Build generative AI pipelines with a visual node editor. Connect models, transform images, generate video and audio.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-8">
          {[
            { label: "Models", value: "47+" },
            { label: "Templates", value: "12" },
            { label: "Providers", value: "6" },
            { label: "Node types", value: "30+" },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="text-base font-black text-white tracking-tight">{s.value}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="mt-auto flex flex-col gap-2.5">
          {[
            { href: "https://node-banana-docs.vercel.app/", label: "Documentation" },
            { href: "https://discord.com/invite/89Nr6EKkTf", label: "Discord community" },
          ].map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-white/25 hover:text-white/70 transition-colors">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              {l.label}
            </a>
          ))}
        </div>
      </motion.div>

      {/* ── Right panel: actions ── */}
      <div className="flex-1 flex flex-col justify-center p-7 gap-2.5"
        style={{ background: "#111111" }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1"
        >
          Get started
        </motion.p>

        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-2">
          {actions.map((a) => (
            <motion.button
              key={a.key}
              variants={item}
              onClick={handlers[a.key]}
              className="group flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.07)" }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {a.icon}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{a.title}</span>
                  {a.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md bg-white/10 text-white/40">
                      {a.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 text-white/30">{a.description}</p>
              </div>
              <svg className="w-3.5 h-3.5 shrink-0 text-white/20 group-hover:text-white/50 transition-all group-hover:translate-x-0.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
