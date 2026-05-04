"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useWorkflowStore, useProviderApiKeys } from "@/store/workflowStore";
import { deduplicatedFetch, clearFetchCache } from "@/utils/deduplicatedFetch";
import { useReactFlow } from "@xyflow/react";
import { ProviderType, RecentModel } from "@/types";
import { ProviderModel, ModelCapability, isPremiumModel } from "@/lib/providers/types";

// localStorage cache for models (persists across dev server restarts)
const MODELS_CACHE_KEY = "node-banana-models-cache";
const MODELS_CACHE_TTL = 48 * 60 * 60 * 1000; // 48 hours

interface ModelsCacheEntry {
  models: ProviderModel[];
  availableProviders?: string[];
  timestamp: number;
}

function getCachedModels(cacheKey: string): ModelsCacheEntry | null {
  try {
    const cache = JSON.parse(localStorage.getItem(MODELS_CACHE_KEY) || "{}");
    const entry = cache[cacheKey];
    if (entry && Date.now() - entry.timestamp < MODELS_CACHE_TTL) {
      return entry;
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function setCachedModels(cacheKey: string, models: ProviderModel[], availableProviders?: string[]) {
  try {
    const cache = JSON.parse(localStorage.getItem(MODELS_CACHE_KEY) || "{}");
    cache[cacheKey] = { models, availableProviders, timestamp: Date.now() };
    localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore cache errors
  }
}

// Provider icons — all normalized to w-3.5 h-3.5 with viewBoxes cropped to fill consistently
const StandardIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

const PremiumIcon = () => (
  <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ExperimentalIcon = () => (
  <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

// Get the center of the React Flow pane in screen coordinates
function getPaneCenter() {
  const pane = document.querySelector(".react-flow");
  if (pane) {
    const rect = pane.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

// Capability filter options
type CapabilityFilter = "all" | "image" | "video" | "3d" | "audio";

// API response type
interface ModelsResponse {
  success: boolean;
  models?: ProviderModel[];
  /** Providers with API keys configured (env or client header) */
  availableProviders?: string[];
  error?: string;
}

interface ModelSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialProvider?: ProviderType | null;
  /** When provided, calls this callback instead of creating a new node */
  onModelSelected?: (model: ProviderModel) => void;
  /** Initial capability filter - 'image' for image nodes, 'video' for video nodes */
  initialCapabilityFilter?: CapabilityFilter;
}

export function ModelSearchDialog({
  isOpen,
  onClose,
  initialProvider,
  onModelSelected,
  initialCapabilityFilter,
}: ModelSearchDialogProps) {
  const {
    addNode,
    incrementModalCount,
    decrementModalCount,
    recentModels,
    trackModelUsage,
  } = useWorkflowStore();
  // Use stable selector for API keys to prevent unnecessary re-fetches
  const { falApiKey, kieApiKey, wavespeedApiKey } = useProviderApiKeys();
  const { screenToFlowPosition } = useReactFlow();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState<ProviderType | "all">(
    initialProvider || "all"
  );
  const [capabilityFilter, setCapabilityFilter] =
    useState<CapabilityFilter>(initialCapabilityFilter || "all");
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverAvailableProviders, setServerAvailableProviders] = useState<string[]>([]);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Track request version to ignore stale responses
  const requestVersionRef = useRef(0);

  // Register modal with store
  useEffect(() => {
    if (isOpen) {
      incrementModalCount();
      return () => decrementModalCount();
    }
  }, [isOpen, incrementModalCount, decrementModalCount]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update provider filter when initialProvider changes
  useEffect(() => {
    if (initialProvider) {
      setProviderFilter(initialProvider);
    }
  }, [initialProvider]);

  // Fetch models
  const fetchModels = useCallback(async (bypassCache = false) => {
    // Increment version to track this request
    const thisVersion = ++requestVersionRef.current;

    // Build cache key from filters
    const cacheKey = `${providerFilter}:${capabilityFilter}:${debouncedSearch}`;

    // Check localStorage cache first (skip when bypassing)
    if (!bypassCache) {
      const cached = getCachedModels(cacheKey);
      if (cached) {
        setModels(cached.models);
        if (cached.availableProviders) {
          setServerAvailableProviders(cached.availableProviders);
        }
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      if (providerFilter !== "all") {
        params.set("provider", providerFilter);
      }
      if (capabilityFilter !== "all") {
        const capabilities =
          capabilityFilter === "image"
            ? "text-to-image,image-to-image"
            : capabilityFilter === "video"
            ? "text-to-video,image-to-video,audio-to-video"
            : capabilityFilter === "3d"
            ? "text-to-3d,image-to-3d"
            : "text-to-audio";
        params.set("capabilities", capabilities);
      }
      if (bypassCache) {
        params.set("refresh", "true");
      }

      // Empty headers, relying on server-side configuration
      const headers: Record<string, string> = {};

      const response = await deduplicatedFetch(`/api/models?${params.toString()}`, {
        headers,
      });

      // Check if this request is still current
      if (thisVersion !== requestVersionRef.current) {
        return; // Ignore stale response
      }

      const data: ModelsResponse = await response.json();

      if (data.success && data.models) {
        setModels(data.models);
        // Cache the successful result (including available providers)
        setCachedModels(cacheKey, data.models, data.availableProviders);
        // Update server-reported available providers
        if (data.availableProviders) {
          setServerAvailableProviders(data.availableProviders);
        }
      } else {
        setError(data.error || "Failed to fetch models");
        setModels([]);
      }
    } catch (err) {
      // Check if this request is still current
      if (thisVersion !== requestVersionRef.current) {
        return; // Ignore stale error
      }
      setError(err instanceof Error ? err.message : "Failed to fetch models");
      setModels([]);
    } finally {
      // Only update loading state if this is still the current request
      if (thisVersion === requestVersionRef.current) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearch, providerFilter, capabilityFilter, falApiKey, kieApiKey, wavespeedApiKey]);

  // Fetch models when filters change
  useEffect(() => {
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen, fetchModels]);

  // Clear all caches and re-fetch models from scratch
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Clear localStorage model cache
      localStorage.removeItem(MODELS_CACHE_KEY);
      // Clear localStorage schema cache (keep in sync with ModelParameters.tsx)
      localStorage.removeItem("node-banana-schema-cache");
      // Clear in-memory deduplicatedFetch cache
      clearFetchCache();
      // Re-fetch with cache bypass
      await fetchModels(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchModels]);

  // Focus search input when dialog opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle model selection
  const handleSelectModel = useCallback(
    (model: ProviderModel) => {
      // Track model usage for "recently used" feature
      trackModelUsage({
        provider: model.provider,
        modelId: model.id,
        displayName: model.name,
      });

      // If onModelSelected is provided, use it to update an existing node
      if (onModelSelected) {
        onModelSelected(model);
        onClose();
        return;
      }

      // Otherwise, create a new node
      const center = getPaneCenter();
      const position = screenToFlowPosition({
        x: center.x + Math.random() * 100 - 50,
        y: center.y + Math.random() * 100 - 50,
      });

      // Determine node type based on model capabilities
      const isVideoModel = model.capabilities.some(
        (cap) => cap === "text-to-video" || cap === "image-to-video" || cap === "audio-to-video"
      );
      const is3DModel = model.capabilities.some(
        (cap) => cap === "text-to-3d" || cap === "image-to-3d"
      );
      const isAudioModel = model.capabilities.some(
        (cap) => cap === "text-to-audio"
      );

      const nodeType = isVideoModel ? "generateVideo" : is3DModel ? "generate3d" : isAudioModel ? "generateAudio" : "nanoBanana";

      addNode(nodeType, position, {
        selectedModel: {
          provider: model.provider,
          modelId: model.id,
          displayName: model.name,
          capabilities: model.capabilities,
        },
      });

      onClose();
    },
    [screenToFlowPosition, addNode, onClose, onModelSelected, trackModelUsage]
  );

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Get provider badge color
  const getProviderBadgeColor = (provider: ProviderType) => {
    switch (provider) {
      case "gemini":     return "bg-green-500/20 text-green-300";
      case "kie":        return "bg-orange-500/20 text-orange-300";
      case "wavespeed":  return "bg-purple-500/20 text-purple-300";
      case "cloudflare": return "bg-neutral-500/20 text-neutral-300";
      default:           return "bg-neutral-500/20 text-neutral-300";
    }
  };

  // Get provider display name
  const getProviderDisplayName = (provider: ProviderType) => {
    switch (provider) {
      case "gemini":     return "Assistant Engine";
      case "kie":        return "KIE Engine";
      case "wavespeed":  return "Hyper-Speed Engine";
      case "cloudflare": return "Standard Engine";
      default:           return provider;
    }
  };

  // Compute which providers are available based on client API keys + server env vars
  const availableProviders = useMemo(() => {
    const providers = new Set<ProviderType>(["gemini", "cloudflare"]); // Always available
    // Client-side keys (from localStorage/provider settings)
    if (kieApiKey) providers.add("kie");
    if (wavespeedApiKey) providers.add("wavespeed");
    // Server-side keys (from env vars, reported by /api/models)
    for (const p of serverAvailableProviders) {
      providers.add(p as ProviderType);
    }
    return providers;
  }, [kieApiKey, wavespeedApiKey, serverAvailableProviders]);

  // Reset provider filter if current selection becomes unavailable
  useEffect(() => {
    if (providerFilter !== "all" && !availableProviders.has(providerFilter as ProviderType)) {
      setProviderFilter("all");
    }
  }, [providerFilter, availableProviders]);

  // Filter recent models by capability
  const filteredRecentModels = useMemo(() => {
    return recentModels
      .filter((recent) => {
        // Find matching model in current models list to check capabilities
        const matchingModel = models.find((m) => m.id === recent.modelId);
        if (!matchingModel && capabilityFilter !== "all") {
          // If model not loaded yet and filter is active, exclude it
          return false;
        }
        if (capabilityFilter === "all") return true;
        if (!matchingModel) return true; // Show if we can't verify capabilities

        const isImage = matchingModel.capabilities.some(
          (cap) => cap === "text-to-image" || cap === "image-to-image"
        );
        const isVideo = matchingModel.capabilities.some(
          (cap) => cap === "text-to-video" || cap === "image-to-video" || cap === "audio-to-video"
        );
        const is3D = matchingModel.capabilities.some(
          (cap) => cap === "text-to-3d" || cap === "image-to-3d"
        );
        const isAudio = matchingModel.capabilities.some(
          (cap) => cap === "text-to-audio"
        );

        if (capabilityFilter === "image") return isImage;
        if (capabilityFilter === "video") return isVideo;
        if (capabilityFilter === "3d") return is3D;
        if (capabilityFilter === "audio") return isAudio;
        return true;
      })
      .slice(0, 4); // Show max 4
  }, [recentModels, models, capabilityFilter]);

  // Get display name with suffix for fal.ai models to differentiate variants
  const getDisplayName = (model: ProviderModel): string => {
    if (model.provider === "fal") {
      // Extract the last segment of the ID (e.g., "effects" from "kling-video/v1.6/pro/effects")
      const segments = model.id.split("/");
      const lastSegment = segments[segments.length - 1];

      // Only add suffix if it's not already in the name (case-insensitive)
      if (lastSegment && !model.name.toLowerCase().includes(lastSegment.toLowerCase())) {
        return `${model.name} - ${lastSegment}`;
      }
    }
    return model.name;
  };

  // Get model page URL for the provider's website
  const getModelUrl = (model: ProviderModel): string | null => {
    if (model.pageUrl) return model.pageUrl;
    switch (model.provider) {
      case "wavespeed": return `https://wavespeed.ai`;
      case "kie":       return `https://kie.ai`;
      default:          return null;
    }
  };

  // Get capability badges - show all capabilities to differentiate similar models
  const getCapabilityBadges = (capabilities: ModelCapability[]) => {
    const badges: React.ReactNode[] = [];

    capabilities.forEach((cap) => {
      let color = "";
      let label = "";

      switch (cap) {
        case "text-to-image":
          color = "bg-green-500/20 text-green-300";
          label = "txt→img";
          break;
        case "image-to-image":
          color = "bg-cyan-500/20 text-cyan-300";
          label = "img→img";
          break;
        case "text-to-video":
          color = "bg-purple-500/20 text-purple-300";
          label = "txt→vid";
          break;
        case "image-to-video":
          color = "bg-pink-500/20 text-pink-300";
          label = "img→vid";
          break;
        case "text-to-3d":
          color = "bg-orange-500/20 text-orange-300";
          label = "txt→3d";
          break;
        case "image-to-3d":
          color = "bg-amber-500/20 text-amber-300";
          label = "img→3d";
          break;
        case "text-to-audio":
          color = "bg-fuchsia-500/20 text-fuchsia-300";
          label = "txt→audio";
          break;
        case "audio-to-video":
          color = "bg-violet-500/20 text-violet-300";
          label = "audio→vid";
          break;
      }

      if (label) {
        badges.push(
          <span
            key={cap}
            className={`text-[10px] px-1.5 py-0.5 rounded ${color}`}
          >
            {label}
          </span>
        );
      }
    });

    return badges;
  };

  if (!isOpen) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-100">
            Browse Models
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 rounded transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-neutral-700">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-700 border border-neutral-600 rounded text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>

            <div className="flex items-center gap-0.5 bg-neutral-700/50 rounded p-0.5">
              <button
                onClick={() => setProviderFilter("all")}
                title="All Pipelines"
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  providerFilter === "all"
                    ? "bg-neutral-600 text-neutral-100"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
                }`}
              >
                All
              </button>
              {availableProviders.has("cloudflare") && (
                <button
                  onClick={() => setProviderFilter("cloudflare")}
                  title="Standard Engine"
                  className={`p-2 rounded transition-colors ${
                    providerFilter === "cloudflare"
                      ? "bg-neutral-500/20 text-neutral-300"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
                  }`}
                >
                  <StandardIcon />
                </button>
              )}
              {availableProviders.has("gemini") && (
                <button
                  onClick={() => setProviderFilter("gemini")}
                  title="Assistant Engine"
                  className={`p-2 rounded transition-colors ${
                    providerFilter === "gemini"
                      ? "bg-green-500/20 text-green-300"
                      : "text-neutral-400 hover:text-green-300 hover:bg-neutral-700"
                  }`}
                >
                  <StandardIcon />
                </button>
              )}
              {availableProviders.has("fal") && (
                <button
                  onClick={() => setProviderFilter("fal")}
                  title="Premium Engine"
                  className={`p-2 rounded transition-colors ${
                    providerFilter === "fal"
                      ? "bg-blue-500/20 text-blue-300"
                      : "text-neutral-400 hover:text-blue-300 hover:bg-neutral-700"
                  }`}
                >
                  <PremiumIcon />
                </button>
              )}
              {(availableProviders.has("kie") || availableProviders.has("wavespeed")) && (
                <button
                  onClick={() => setProviderFilter(availableProviders.has("kie") ? "kie" : "wavespeed")}
                  title="Advanced Pipelines"
                  className={`p-2 rounded transition-colors ${
                    (providerFilter === "kie" || providerFilter === "wavespeed")
                      ? "bg-amber-500/20 text-amber-300"
                      : "text-neutral-400 hover:text-amber-300 hover:bg-neutral-700"
                  }`}
                >
                  <ExperimentalIcon />
                </button>
              )}
            </div>

            {/* Capability Filter */}
            <select
              value={capabilityFilter}
              onChange={(e) =>
                setCapabilityFilter(e.target.value as CapabilityFilter)
              }
              className="px-3 py-2 text-sm bg-neutral-700 border border-neutral-600 rounded text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            >
              <option value="all">All Types</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="3d">3D</option>
              <option value="audio">Audio</option>
            </select>

            {/* Refresh Cache */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              title="Refresh models & schemas"
              className="p-2 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-4 h-4${isRefreshing ? " animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0113.292-6.036M20 15a8 8 0 01-13.292 6.036"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Model List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="w-8 h-8 animate-spin text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm text-neutral-400">
                  Loading models...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm text-neutral-400 text-center max-w-xs">
                {error}
              </p>
              <button
                onClick={handleRefresh}
                className="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : models.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <svg
                className="w-10 h-10 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-neutral-400">No models found</p>
              <p className="text-xs text-neutral-500">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Recently Used Section */}
              {filteredRecentModels.length > 0 && !searchQuery && (
                <div className="bg-neutral-700/30 rounded-lg p-3">
                  <h3 className="text-xs font-medium text-neutral-500 mb-2">
                    Recently Used
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredRecentModels.map((recent) => {
                      const matchingModel = models.find(
                        (m) => m.id === recent.modelId
                      );
                      // Create a ProviderModel from RecentModel for handleSelectModel
                      const model: ProviderModel = matchingModel || {
                        id: recent.modelId,
                        name: recent.displayName,
                        description: null,
                        provider: recent.provider,
                        capabilities: [],
                      };
                      return (
                        <button
                          key={`recent-${recent.modelId}`}
                          onClick={() => handleSelectModel(model)}
                          className="flex items-center gap-3 p-3 bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600/30 hover:border-neutral-500 rounded-lg transition-colors text-left cursor-pointer group"
                        >
                          {/* Small cover image */}
                          <div className="w-10 h-10 rounded bg-neutral-600 overflow-hidden flex-shrink-0">
                            {matchingModel?.coverImage ? (
                              <img
                                src={matchingModel.coverImage}
                                alt={recent.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-neutral-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-neutral-100 text-sm truncate flex items-center gap-1.5">
                              {recent.displayName}
                              {isPremiumModel(recent.provider, recent.modelId) && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-400 to-amber-500 text-black shadow-sm" title="Requires PRO subscription">
                                  PRO
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${getProviderBadgeColor(recent.provider)}`}
                            >
                              {getProviderDisplayName(recent.provider)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Main Model List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {models.map((model) => (
                <button
                  key={`${model.provider}-${model.id}`}
                  onClick={() => handleSelectModel(model)}
                  className="flex items-start gap-3 p-4 bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600/50 hover:border-neutral-500 rounded-lg transition-colors text-left cursor-pointer group"
                >
                  {/* Cover Image - larger */}
                  <div className="w-20 h-20 rounded bg-neutral-600 overflow-hidden flex-shrink-0">
                    {model.coverImage ? (
                      <img
                        src={model.coverImage}
                        alt={model.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken images
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-neutral-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Model Info */}
                  <div className="flex-1 min-w-0">
                    {/* Model name with variant suffix for fal.ai */}
                    <div className="font-medium text-neutral-100 text-sm truncate flex items-center gap-1.5">
                      {getDisplayName(model)}
                      {isPremiumModel(model.provider, model.id) && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-400 to-amber-500 text-black shadow-sm" title="Requires PRO subscription">
                          PRO
                        </span>
                      )}
                      {model.isFree && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20 shadow-sm">
                          FREE
                        </span>
                      )}
                    </div>

                    {/* Model ID with link to provider page */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-neutral-500 truncate font-mono">
                        {model.id}
                      </span>
                    </div>

                    {/* Badges row */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${getProviderBadgeColor(model.provider)}`}
                      >
                        {getProviderDisplayName(model.provider)}
                      </span>
                      {getCapabilityBadges(model.capabilities)}
                    </div>

                    {/* Description - more lines */}
                    {model.description && (
                      <p className="mt-1.5 text-xs text-neutral-400 line-clamp-3">
                        {model.description}
                      </p>
                    )}
                  </div>

                  {/* Hover indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center">
                    <svg
                      className="w-5 h-5 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </button>
              ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with model count */}
        {!isLoading && !error && models.length > 0 && (
          <div className="px-6 py-3 border-t border-neutral-700 text-xs text-neutral-400">
            {models.length} model{models.length !== 1 ? "s" : ""} found
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render outside React Flow stacking context
  return createPortal(dialogContent, document.body);
}
