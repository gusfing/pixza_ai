"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { WorkflowFile } from "@/store/workflowStore";
import { getAllPresets, PRESET_TEMPLATES } from "@/lib/quickstart/templates";
import { QuickstartBackButton } from "./QuickstartBackButton";
import { CommunityWorkflowMeta, TemplateCategory, TemplateMetadata } from "@/types/quickstart";

interface TemplateExplorerViewProps {
  onBack: () => void;
  onWorkflowSelected: (workflow: WorkflowFile) => void;
}

type CategoryFilter = "all" | TemplateCategory;

const CATEGORY_OPTIONS: { id: CategoryFilter; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "simple",    label: "Simple" },
  { id: "advanced",  label: "Advanced" },
  { id: "community", label: "Community" },
];

const PRIMARY_THUMBS: Record<string, string> = {
  "product-shot":    "/template-thumbnails/primary/product-shot.jpg",
  "model-product":   "/template-thumbnails/primary/model-product.jpg",
  "color-variations":"/template-thumbnails/primary/color-variations.jpg",
  "background-swap": "/template-thumbnails/primary/background-swap.jpg",
  "style-transfer":  "/template-thumbnails/primary/style-transfer.jpg",
  "scene-composite": "/template-thumbnails/primary/scene-composite.jpg",
};

const HOVER_THUMBS: Record<string, string> = {
  "product-shot":    "/template-thumbnails/product-shot.png",
  "model-product":   "/template-thumbnails/model-product.png",
  "color-variations":"/template-thumbnails/color-variations.png",
  "background-swap": "/template-thumbnails/background-swap.png",
  "style-transfer":  "/template-thumbnails/style-transfer.png",
  "scene-composite": "/template-thumbnails/scene-composite.png",
};

const CATEGORY_BADGE: Record<TemplateCategory, { bg: string; color: string }> = {
  simple:    { bg: "rgba(0,0,0,0.12)", color: "#2b00ff" },
  advanced:  { bg: "rgba(0,0,0,0.12)", color: "#2b00ff" },
  community: { bg: "rgba(0,0,0,0.12)", color: "#2b00ff" },
};

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

interface GridCardProps {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  nodeCount: number;
  previewImage?: string;
  hoverImage?: string;
  author?: string;
  isLoading: boolean;
  disabled: boolean;
  onUse: () => void;
}

function GridCard({ id, name, description, category, tags, nodeCount, previewImage, hoverImage, author, isLoading, disabled, onUse }: GridCardProps) {
  const badge = CATEGORY_BADGE[category];

  return (
    <div
      className="group flex flex-col rounded-xl overflow-hidden transition-all"
      style={{
        background: "var(--surface-2)",
        border: `1px solid ${isLoading ? "rgba(146,220,229,0.25)" : "var(--border)"}`,
        opacity: disabled && !isLoading ? 0.45 : 1,
      }}
      onMouseEnter={e => {
        if (!disabled || isLoading) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-md)";
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = isLoading ? "rgba(146,220,229,0.25)" : "var(--border)";
      }}
    >
      {/* Thumbnail — 16:9 */}
      <div className="relative w-full aspect-video overflow-hidden" style={{ background: "var(--surface-3)" }}>
        {previewImage ? (
          <>
            <img
              src={previewImage}
              alt={name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hoverImage ? "group-hover:opacity-0" : ""}`}
            />
            {hoverImage && (
              <img
                src={hoverImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: "var(--text-3)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Category badge overlay */}
        <div className="absolute top-2 left-2">
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
            style={{
              background: badge.bg,
              color: badge.color,
              backdropFilter: "blur(70px)",
              WebkitBackdropFilter: "blur(70px)",
            }}
          >
            {category}
          </span>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(8,8,10,0.7)" }}>
            <Spinner />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-sm font-medium leading-tight" style={{ color: "var(--text-1)" }}>{name}</h3>
          </div>
          {author && (
            <p className="text-[11px] mt-0.5" style={{ color: "var(--accent)" }}>@{author}</p>
          )}
          <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-3)" }}>{description}</p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-3)" }}>
                {tag}
              </span>
            ))}
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-3)" }}>
              {nodeCount}n
            </span>
          </div>

          <button
            onClick={onUse}
            disabled={disabled || isLoading}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: "var(--accent)",
              color: "#080808",
              opacity: disabled && !isLoading ? 0.4 : 1,
            }}
            onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = "#aae8f0"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--accent)"; }}
          >
            {isLoading ? <Spinner /> : (
              <>
                Use
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TemplateExplorerView({ onBack, onWorkflowSelected }: TemplateExplorerViewProps) {
  const [communityWorkflows, setCommunityWorkflows] = useState<CommunityWorkflowMeta[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const presets = getAllPresets();

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 200);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // Node counts
  const presetMeta = useMemo(() => {
    const m: Record<string, TemplateMetadata> = {};
    PRESET_TEMPLATES.forEach(t => { m[t.id] = { nodeCount: t.workflow.nodes.length, category: t.category, tags: t.tags }; });
    return m;
  }, []);

  // Filtered presets
  const filteredPresets = useMemo(() => presets.filter(p => {
    if (category === "community") return false;
    if (category !== "all" && p.category !== category) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
    }
    if (selectedTags.size > 0 && !p.tags.some(t => selectedTags.has(t))) return false;
    return true;
  }), [presets, category, debouncedSearch, selectedTags]);

  // Filtered community
  const filteredCommunity = useMemo(() => {
    if (category !== "all" && category !== "community") return [];
    return communityWorkflows.filter(w => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!w.name.toLowerCase().includes(q) && !w.author.toLowerCase().includes(q) && !w.description.toLowerCase().includes(q)) return false;
      }
      if (selectedTags.size > 0 && !w.tags.some(t => selectedTags.has(t))) return false;
      return true;
    });
  }, [communityWorkflows, category, debouncedSearch, selectedTags]);

  // All tags
  const allTags = useMemo(() => {
    const s = new Set<string>();
    presets.forEach(p => p.tags.forEach(t => s.add(t)));
    communityWorkflows.forEach(w => w.tags.forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [presets, communityWorkflows]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch(""); setDebouncedSearch(""); setCategory("all"); setSelectedTags(new Set());
  }, []);

  const hasFilters = search || category !== "all" || selectedTags.size > 0;
  const isEmpty = filteredPresets.length === 0 && filteredCommunity.length === 0 && !isLoadingList;

  useEffect(() => {
    fetch("/api/community-workflows")
      .then(r => r.json())
      .then(d => { if (d.success) setCommunityWorkflows(d.workflows); })
      .catch(console.error)
      .finally(() => setIsLoadingList(false));
  }, []);

  const handlePresetSelect = useCallback(async (id: string) => {
    setLoadingId(id); setError(null);
    try {
      const r = await fetch("/api/quickstart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templateId: id, contentLevel: "full" }) });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || "Failed to load template");
      if (d.workflow) onWorkflowSelected(d.workflow);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load template");
    } finally {
      setLoadingId(null);
    }
  }, [onWorkflowSelected]);

  const handleCommunitySelect = useCallback(async (id: string) => {
    setLoadingId(id); setError(null);
    try {
      const r = await fetch(`/api/community-workflows/${id}`);
      const d = await r.json();
      if (!d.success || !d.downloadUrl) throw new Error(d.error || "Failed to get download URL");
      const wr = await fetch(d.downloadUrl);
      if (!wr.ok) throw new Error("Failed to download workflow");
      onWorkflowSelected(await wr.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workflow");
    } finally {
      setLoadingId(null);
    }
  }, [onWorkflowSelected]);

  const isLoading = loadingId !== null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Header ── */}
      <div
        className="shrink-0 flex items-center gap-3 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <QuickstartBackButton onClick={onBack} disabled={isLoading} />
        <div className="w-px h-4" style={{ background: "var(--border)" }} />
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Templates</h2>

        {/* Search */}
        <div className="relative ml-auto w-56">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--text-3)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="ui-input pl-8 py-1.5 text-xs"
            style={{ fontSize: "12px" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 btn-icon" style={{ width: 16, height: 16 }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Body: sidebar + grid ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar */}
        <aside
          className="w-44 shrink-0 flex flex-col gap-5 p-4 overflow-y-auto"
          style={{ borderRight: "1px solid var(--border)", background: "var(--surface-1)" }}
        >
          {/* Category */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>Category</p>
            <div className="flex flex-col gap-0.5">
              {CATEGORY_OPTIONS.map(opt => {
                const active = category === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setCategory(opt.id)}
                    className="text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: active ? "rgba(146,220,229,0.1)" : "transparent",
                      color: active ? "var(--accent)" : "var(--text-2)",
                      border: active ? "1px solid rgba(146,220,229,0.2)" : "1px solid transparent",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>Provider</p>
              <div className="flex flex-col gap-0.5">
                {allTags.map(tag => {
                  const active = selectedTags.has(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: active ? "rgba(146,220,229,0.1)" : "transparent",
                        color: active ? "var(--accent)" : "var(--text-2)",
                        border: active ? "1px solid rgba(146,220,229,0.2)" : "1px solid transparent",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs px-2.5 py-1.5 rounded-lg transition-colors mt-auto"
              style={{ color: "var(--text-3)", border: "1px solid var(--border)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-md)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
            >
              Clear filters
            </button>
          )}
        </aside>

        {/* Grid */}
        <main className="flex-1 min-h-0 overflow-y-auto p-5">

          {/* Empty state */}
          {isEmpty && hasFilters && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: "var(--text-3)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>No templates match</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn btn-secondary text-xs mt-1" style={{ padding: "5px 14px" }}>Clear filters</button>
            </div>
          )}

          {/* Preset grid */}
          {filteredPresets.length > 0 && (
            <section className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
                Quick Start · {filteredPresets.length}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {filteredPresets.map(p => (
                  <GridCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    description={p.description}
                    category={p.category}
                    tags={p.tags}
                    nodeCount={presetMeta[p.id]?.nodeCount ?? 0}
                    previewImage={PRIMARY_THUMBS[p.id]}
                    hoverImage={HOVER_THUMBS[p.id]}
                    isLoading={loadingId === p.id}
                    disabled={isLoading && loadingId !== p.id}
                    onUse={() => handlePresetSelect(p.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Divider */}
          {filteredPresets.length > 0 && (filteredCommunity.length > 0 || isLoadingList) && (
            <div className="mb-6" style={{ height: 1, background: "var(--border)" }} />
          )}

          {/* Community grid */}
          {(category === "all" || category === "community") && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  Community{!isLoadingList && ` · ${filteredCommunity.length}`}
                </p>
                <a
                  href="https://discord.com/invite/89Nr6EKkTf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] transition-colors"
                  style={{ color: "var(--text-3)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}
                >
                  Submit yours →
                </a>
              </div>

              {isLoadingList ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner />
                </div>
              ) : filteredCommunity.length === 0 ? (
                <p className="text-xs py-4" style={{ color: "var(--text-3)" }}>
                  {category === "community" && !debouncedSearch ? "No community workflows yet." : "No community workflows match."}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filteredCommunity.map(w => (
                    <GridCard
                      key={w.id}
                      id={w.id}
                      name={w.name}
                      description={w.description}
                      category="community"
                      tags={w.tags}
                      nodeCount={w.nodeCount}
                      previewImage={w.previewImage}
                      hoverImage={w.hoverImage}
                      author={w.author}
                      isLoading={loadingId === w.id}
                      disabled={isLoading && loadingId !== w.id}
                      onUse={() => handleCommunitySelect(w.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl mt-4"
              style={{ background: "rgba(214,73,51,0.08)", border: "1px solid rgba(214,73,51,0.2)" }}
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--action)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs" style={{ color: "var(--action)" }}>{error}</p>
                <button onClick={() => setError(null)} className="text-[11px] mt-1 transition-colors" style={{ color: "rgba(214,73,51,0.6)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--action)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(214,73,51,0.6)"}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
