"use client";

import { TemplateCategory } from "@/types/quickstart";

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: TemplateCategory;
    tags: string[];
  };
  nodeCount: number;
  previewImage?: string;
  hoverImage?: string;
  isLoading?: boolean;
  onUseWorkflow: () => void;
  disabled?: boolean;
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  simple: "Simple",
  advanced: "Advanced",
  community: "Community",
};

const CATEGORY_COLORS: Record<TemplateCategory, { bg: string; text: string }> = {
  simple:    { bg: "rgba(146,220,229,0.12)", text: "#92dce5" },
  advanced:  { bg: "rgba(214,73,51,0.12)",   text: "#d64933" },
  community: { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24" },
};

export function TemplateCard({
  template,
  nodeCount,
  previewImage,
  hoverImage,
  isLoading = false,
  onUseWorkflow,
  disabled = false,
}: TemplateCardProps) {
  return (
    <div
      className="group w-full rounded-xl p-4 transition-all flex gap-4"
      style={{
        background: isLoading ? "rgba(146,220,229,0.05)" : "var(--surface-2)",
        border: `1px solid ${isLoading ? "rgba(146,220,229,0.2)" : "var(--border)"}`,
        opacity: disabled && !isLoading ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-md)";
          (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
        }
      }}
    >
      {/* Thumbnail */}
      <div
        className="w-32 h-32 shrink-0 rounded-lg overflow-hidden relative"
        style={{ background: "var(--surface-3)" }}
      >
        {previewImage ? (
          <>
            <img
              src={previewImage}
              alt={`${template.name} preview`}
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
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: "var(--text-3)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={template.icon} />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
            {template.name}
          </h3>
          <span
            className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
            style={{
              background: CATEGORY_COLORS[template.category].bg,
              color: CATEGORY_COLORS[template.category].text,
            }}
          >
            {CATEGORY_LABELS[template.category]}
          </span>
        </div>

        <p className="text-xs line-clamp-2 flex-1" style={{ color: "var(--text-2)" }}>
          {template.description}
        </p>

        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-3)" }}
            >
              {tag}
            </span>
          ))}
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-3)" }}
          >
            {nodeCount} nodes
          </span>
        </div>

        <div className="flex justify-end mt-3">
          <button
            onClick={onUseWorkflow}
            disabled={disabled || isLoading}
            className="btn btn-accent"
            style={{ padding: "5px 12px", fontSize: "11px" }}
          >
            {isLoading ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading…
              </>
            ) : (
              <>
                Use workflow
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
