"use client";

import { useCallback, useRef, useState } from "react";
import { checkAndDownloadModel } from "@/lib/onnx/idb";
import {
  applyColorizerChroma,
  applyMaskAsAlpha,
  preprocessImage,
  preprocessImageToImage,
  tensorToImageBlob,
} from "@/lib/onnx/pipeline";
import { ONNX_MODELS, type OnnxModelKey } from "@/lib/onnx/models";

type Ort = typeof import("onnxruntime-web");
type Session = Awaited<ReturnType<Ort["InferenceSession"]["create"]>>;

export type OnnxStatus = "idle" | "downloading" | "loading" | "running" | "done" | "error";

export function useOnnx() {
  const ortRef = useRef<Ort | null>(null);
  const sessionCache = useRef<Partial<Record<OnnxModelKey, Session>>>({});
  const [status, setStatus] = useState<OnnxStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const loadOrt = async (): Promise<Ort> => {
    if (ortRef.current) return ortRef.current;
    const ort = await import("onnxruntime-web");
    ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/";
    ortRef.current = ort;
    return ort;
  };

  const getSession = useCallback(async (modelKey: OnnxModelKey): Promise<Session> => {
    if (sessionCache.current[modelKey]) return sessionCache.current[modelKey]!;
    const ort = await loadOrt();
    const model = ONNX_MODELS[modelKey];
    setStatus("downloading");
    setStatusText(`Downloading ${model.label}…`);
    const buffer = await checkAndDownloadModel(model.url, model.cacheKey, (pct) => {
      setProgress(pct);
      setStatusText(pct < 100 ? `Downloading ${model.label}… ${pct}%` : "Loading model…");
    });
    setStatus("loading");
    setStatusText("Initializing…");
    const session = await ort.InferenceSession.create(buffer, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
    sessionCache.current[modelKey] = session;
    return session;
  }, []);

  /** Remove background from an image element. Returns a transparent WebP blob. */
  const removeBackground = useCallback(async (imgEl: HTMLImageElement, modelKey: OnnxModelKey = "ormbg_quantized"): Promise<Blob> => {
    setStatus("running"); setStatusText("Removing background…"); setProgress(0);
    try {
      const ort = await loadOrt();
      const session = await getSession(modelKey);
      const input = preprocessImage(imgEl, ort);
      const results = await session.run({ [ONNX_MODELS[modelKey].inputType]: input });
      const mask = results[session.outputNames[0]];
      const blob = await applyMaskAsAlpha(mask, imgEl);
      setStatus("done"); setStatusText("Done");
      return blob;
    } catch (e) {
      setStatus("error"); setStatusText((e as Error).message);
      throw e;
    }
  }, [getSession]);

  /** Upscale an image 4×. Returns a WebP blob. */
  const upscaleImage = useCallback(async (imgEl: HTMLImageElement, modelKey: OnnxModelKey = "swin2sr_quantized"): Promise<Blob> => {
    setStatus("running"); setStatusText("Upscaling 4×…"); setProgress(0);
    try {
      const ort = await loadOrt();
      const session = await getSession(modelKey);
      const input = preprocessImageToImage(imgEl, ort, 512, { keepAspectRatio: true });
      const results = await session.run({ [ONNX_MODELS[modelKey].inputType]: input });
      const out = results[session.outputNames[0]];
      const w = (out.dims[3] as number) || 2048;
      const h = (out.dims[2] as number) || 2048;
      const blob = await tensorToImageBlob(out, w, h);
      setStatus("done"); setStatusText("Done");
      return blob;
    } catch (e) {
      setStatus("error"); setStatusText((e as Error).message);
      throw e;
    }
  }, [getSession]);

  /** Colorize a B&W image. Returns a WebP blob. */
  const colorizeImage = useCallback(async (imgEl: HTMLImageElement, modelKey: OnnxModelKey = "deoldify_quantized"): Promise<Blob> => {
    setStatus("running"); setStatusText("Colorizing…"); setProgress(0);
    try {
      const ort = await loadOrt();
      const session = await getSession(modelKey);
      const input = preprocessImageToImage(imgEl, ort, 256, { keepAspectRatio: true, grayscale: true, useByteRange: true });
      const results = await session.run({ [ONNX_MODELS[modelKey].inputType]: input });
      const out = results[session.outputNames[0]];
      const blob = await applyColorizerChroma(out, imgEl);
      setStatus("done"); setStatusText("Done");
      return blob;
    } catch (e) {
      setStatus("error"); setStatusText((e as Error).message);
      throw e;
    }
  }, [getSession]);

  return { status, progress, statusText, removeBackground, upscaleImage, colorizeImage };
}
