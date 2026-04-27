"use client";

import { ReactNode, useCallback, useRef, useLayoutEffect } from "react";
import { Node, NodeResizer, OnResize, useReactFlow } from "@xyflow/react";
import { useWorkflowStore } from "@/store/workflowStore";
import { isPanningRef, isDraggingNodeRef } from "@/components/WorkflowCanvas";
import { getMediaDimensions, calculateAspectFitSize } from "@/utils/nodeDimensions";

const DEFAULT_NODE_DIMENSION = 300;

interface BaseNodeProps {
  id: string;
  children: ReactNode;
  selected?: boolean;
  isExecuting?: boolean;
  hasError?: boolean;
  className?: string;
  contentClassName?: string;
  minWidth?: number;
  minHeight?: number;
  fullBleed?: boolean;
  aspectFitMedia?: string | null;
  settingsExpanded?: boolean;
  settingsPanel?: ReactNode;
  accentColor?: string;
}

function getNodeDimension(node: Node, axis: "width" | "height"): number {
  return (
    (node[axis] as number) ??
    (node.style?.[axis] as number) ??
    (node.measured?.[axis] as number) ??
    DEFAULT_NODE_DIMENSION
  );
}

function applyNodeDimensions(node: Node, width: number, height: number): Node {
  return {
    ...node,
    width,
    height,
    style: { ...node.style, width, height },
  };
}

export function BaseNode({
  id,
  children,
  selected = false,
  isExecuting = false,
  hasError = false,
  className = "",
  contentClassName,
  minWidth = 180,
  minHeight = 100,
  fullBleed = false,
  aspectFitMedia,
  settingsExpanded = false,
  settingsPanel,
  accentColor,
}: BaseNodeProps) {
  const currentNodeIds = useWorkflowStore((state) => state.currentNodeIds);
  const setHoveredNodeId = useWorkflowStore((state) => state.setHoveredNodeId);
  const isCurrentlyExecuting = currentNodeIds.includes(id);
  const { getNodes, setNodes } = useReactFlow();

  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trackedSettingsHeightRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    const contentEl = contentRef.current;
    const ANIMATION_MS = 160;

    if (!settingsExpanded && trackedSettingsHeightRef.current > 0) {
      const heightToRemove = trackedSettingsHeightRef.current;
      trackedSettingsHeightRef.current = 0;
      isAnimatingRef.current = true;
      if (contentEl) contentEl.style.height = contentEl.offsetHeight + "px";

      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id !== id) return node;
          const currentHeight = getNodeDimension(node, "height");
          const newHeight = Math.max(minHeight, currentHeight - heightToRemove);
          return {
            ...applyNodeDimensions(node, getNodeDimension(node, "width"), newHeight),
            data: { ...node.data, _settingsPanelHeight: 0 },
          };
        })
      );

      animationTimeoutRef.current = setTimeout(() => {
        isAnimatingRef.current = false;
        if (contentEl) contentEl.style.height = "";
      }, ANIMATION_MS);
    } else if (settingsExpanded && settingsPanel) {
      isAnimatingRef.current = true;
      if (contentEl) {
        const wrapperEl = contentEl.parentElement as HTMLElement | null;
        if (wrapperEl) {
          wrapperEl.style.flex = "none";
          wrapperEl.style.height = wrapperEl.offsetHeight + "px";
        }
      }

      animationTimeoutRef.current = setTimeout(() => {
        isAnimatingRef.current = false;
        const finalHeight = trackedSettingsHeightRef.current;
        if (finalHeight > 0) {
          setNodes((nodes) =>
            nodes.map((node) => {
              if (node.id !== id) return node;
              const savedPanelHeight = typeof (node.data as Record<string, unknown>)?._settingsPanelHeight === "number"
                ? (node.data as Record<string, unknown>)._settingsPanelHeight as number
                : 0;
              const heightToAdd = finalHeight - savedPanelHeight;
              const currentHeight = getNodeDimension(node, "height");
              const newHeight = Math.max(minHeight, currentHeight + heightToAdd);
              return {
                ...applyNodeDimensions(node, getNodeDimension(node, "width"), newHeight),
                data: { ...node.data, _settingsPanelHeight: finalHeight },
              };
            })
          );
        }

        if (contentEl) {
          const wrapperEl = contentEl.parentElement as HTMLElement | null;
          if (wrapperEl) {
            wrapperEl.style.flex = "";
            wrapperEl.style.height = "";
          }
        }
      }, ANIMATION_MS);
    }
  }, [settingsExpanded]);

  useLayoutEffect(() => {
    if (!settingsExpanded || !settingsPanel) return;
    const panelEl = settingsPanelRef.current;
    if (!panelEl) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newPanelHeight = entry.contentRect.height;
        if (newPanelHeight === 0) continue;
        const delta = newPanelHeight - trackedSettingsHeightRef.current;
        if (Math.abs(delta) < 2) continue;

        trackedSettingsHeightRef.current = newPanelHeight;
        if (isAnimatingRef.current) continue;

        const contentEl = contentRef.current;
        if (contentEl) contentEl.style.height = contentEl.offsetHeight + "px";

        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id !== id) return node;
            const currentHeight = getNodeDimension(node, "height");
            const newHeight = Math.max(minHeight, currentHeight + delta);
            return {
              ...applyNodeDimensions(node, getNodeDimension(node, "width"), newHeight),
              data: { ...node.data, _settingsPanelHeight: newPanelHeight },
            };
          })
        );

        requestAnimationFrame(() => {
          if (contentEl) contentEl.style.height = "";
        });
      }
    });

    observer.observe(panelEl);
    return () => observer.disconnect();
  }, [settingsExpanded, settingsPanel]);

  const handleResize: OnResize = useCallback(
    (_event, params) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.selected && node.id !== id) {
            return applyNodeDimensions(node, params.width, params.height);
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  const handleResizeHandleDblClick = useCallback(
    async (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".react-flow__resize-control")) return;
      if (!aspectFitMedia) return;

      e.stopPropagation();
      const dims = await getMediaDimensions(aspectFitMedia);
      if (!dims) return;

      const thisNode = getNodes().find((n) => n.id === id);
      if (!thisNode) return;

      const nodeHeight = getNodeDimension(thisNode, "height");
      const contentHeight = nodeHeight - trackedSettingsHeightRef.current;

      const newSize = calculateAspectFitSize(
        dims.width / dims.height,
        getNodeDimension(thisNode, "width"),
        contentHeight,
        fullBleed
      );

      const finalHeight = newSize.height + trackedSettingsHeightRef.current;

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id || (n.selected && n.id !== id)) {
            return applyNodeDimensions(n, newSize.width, finalHeight);
          }
          return n;
        })
      );
    },
    [aspectFitMedia, id, fullBleed, getNodes, setNodes]
  );

  const hasExpandedSettings = settingsExpanded && settingsPanel;

  return (
    <div
      className={hasExpandedSettings
        ? `relative flex flex-col w-full h-full overflow-visible bg-white rounded-lg ${selected ? "ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10" : "shadow-sm"}`
        : "contents"}
      onDoubleClick={handleResizeHandleDblClick}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={minWidth}
        minHeight={minHeight}
        lineClassName="!border-transparent"
        handleClassName="!w-5 !h-5 !bg-transparent !border-none"
        onResize={handleResize}
      />
      <div
        className={`
          ${hasExpandedSettings ? "flex-1 min-h-0 w-full" : "h-full w-full"} flex flex-col overflow-visible relative
          ${fullBleed
            ? `${settingsExpanded ? "rounded-t-lg border-b-0" : "rounded-lg"} bg-white border border-gray-200/80`
            : `bg-white ${settingsExpanded ? "rounded-t-lg border-b-0" : "rounded-lg"} shadow-sm border`}
          ${fullBleed ? "" : (isCurrentlyExecuting || isExecuting ? "border-blue-400 ring-1 ring-blue-400/20" : "border-gray-200")}
          ${fullBleed ? "" : (hasError ? "border-red-400" : "")}
          ${fullBleed && selected && !settingsExpanded ? "ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10" : ""}
          ${!fullBleed && selected && !settingsExpanded ? "border-blue-400 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10" : ""}
          ${!fullBleed && selected && settingsExpanded ? "border-blue-400" : ""}
          ${className}
        `}
        onMouseEnter={(e) => {
          if (e.buttons !== 0 || isPanningRef.current || isDraggingNodeRef.current) return;
          setHoveredNodeId(id);
        }}
        onMouseLeave={(e) => {
          if (e.buttons !== 0 || isPanningRef.current || isDraggingNodeRef.current) return;
          setHoveredNodeId(null);
        }}
      >
        <div ref={contentRef} style={{ contain: "layout style" }}
          className={contentClassName ?? (fullBleed ? "flex-1 min-h-0 relative" : "px-3 pb-4 flex-1 min-h-0 overflow-visible flex flex-col")}>
          {children}
        </div>
      </div>
      {settingsPanel && (
        <div ref={settingsPanelRef}>
          {settingsPanel}
        </div>
      )}
    </div>
  );
}
