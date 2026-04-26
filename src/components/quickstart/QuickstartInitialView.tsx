"use client";

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
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
  },
  {
    key: "load",
    title: "Open workflow",
    description: "Load an existing file",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />,
  },
  {
    key: "templates",
    title: "Templates",
    description: "Start from a pre-built workflow",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
  },
  {
    key: "vibe",
    title: "Prompt a workflow",
    description: "Describe it, AI builds it",
    badge: "Beta",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />,
  },
];

export function QuickstartInitialView({ onNewProject, onSelectTemplates, onSelectVibe, onSelectLoad }: QuickstartInitialViewProps) {
  const handlers: Record<string, () => void> = { new: onNewProject, load: onSelectLoad, templates: onSelectTemplates, vibe: onSelectVibe };

  return (
    <div className="flex h-full">
      {/* ── Left panel: brand + info ── */}
      <div
        className="w-64 shrink-0 flex flex-col p-8"
        style={{ borderRight: "1px solid var(--border)", background: "#3b82f6" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(146,220,229,0.1)", border: "1px solid rgba(146,220,229,0.2)" }}
          >
            <img src="/pixza-logo.png" alt="" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-semibold" style={{ color: "#ffffff" }}>Pixza Studio</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>by Lekh Labs</div>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.75)" }}>
          A node-based workflow editor for generative AI. Build pipelines that transform and generate images, video, audio and 3D.
        </p>

        {/* Links */}
        <div className="mt-auto flex flex-col gap-3">
          {[
            { href: "https://node-banana-docs.vercel.app/", label: "Documentation" },
            { href: "https://discord.com/invite/89Nr6EKkTf", label: "Discord community" },
            { href: "https://lekhlabs.com", label: "Lekh Labs" },
          ].map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.6)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ffffff"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Right panel: actions ── */}
      <div
        className="flex-1 flex flex-col justify-center p-8 gap-3"
        style={{
          background: "rgba(29, 27, 27, 0.8)",
          backdropFilter: "blur(80px)",
          WebkitBackdropFilter: "blur(80px)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>Get started</p>
        {actions.map((a, i) => (
          <button
            key={a.key}
            onClick={handlers[a.key]}
            className="group flex items-center gap-4 p-4 rounded-xl text-left transition-all"
            style={{
              background: "var(--surface-2)",
              border: "none",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              style={{ background: "rgba(146,220,229,0.08)", border: "1px solid rgba(146,220,229,0.12)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--accent)" }}>
                {a.icon}
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{a.title}</span>
                {a.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md"
                    style={{ background: "var(--action-dim)", color: "var(--action)" }}>
                    {a.badge}
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{a.description}</p>
            </div>
            <svg className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--text-2)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
