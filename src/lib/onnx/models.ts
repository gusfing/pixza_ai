// ONNX model registry — only the models we use in Pixza
export type OnnxTool = "remover" | "upscaler" | "colorizer";

export interface OnnxModel {
  tool: OnnxTool;
  url: string;
  cacheKey: string;
  label: string;
  description: string;
  size: string;
  inputType: string;
}

export const ONNX_MODELS = {
  // ── Background Removal ──────────────────────────────────────
  ormbg_quantized: {
    tool: "remover" as OnnxTool,
    url: "https://huggingface.co/onnx-community/ormbg-ONNX/resolve/main/onnx/model_quantized.onnx",
    cacheKey: "ormbg_quantized_v1",
    label: "ORMBG (Fast)",
    description: "44 MB · Fast & accurate",
    size: "~44 MB",
    inputType: "pixel_values",
  },
  birefnet_lite_fp16: {
    tool: "remover" as OnnxTool,
    url: "https://huggingface.co/onnx-community/BiRefNet_lite-ONNX/resolve/main/onnx/model_fp16.onnx",
    cacheKey: "birefnet_lite_fp16_v2",
    label: "BiRefNet (Quality)",
    description: "115 MB · Best edge quality",
    size: "~115 MB",
    inputType: "input_image",
  },
  // ── Upscaler ────────────────────────────────────────────────
  swin2sr_quantized: {
    tool: "upscaler" as OnnxTool,
    url: "https://huggingface.co/onnx-community/swin2SR-realworld-sr-x4-64-bsrgan-psnr-ONNX/resolve/main/onnx/model_quantized.onnx",
    cacheKey: "swin2sr_quantized_v1",
    label: "Swin2SR 4× (Fast)",
    description: "18 MB · 4× super-resolution",
    size: "~18 MB",
    inputType: "pixel_values",
  },
  // ── Colorizer ───────────────────────────────────────────────
  deoldify_quantized: {
    tool: "colorizer" as OnnxTool,
    url: "https://huggingface.co/thookham/DeOldify-on-Browser/resolve/main/deoldify-quant.onnx",
    cacheKey: "deoldify_artistic_quantized_v2",
    label: "DeOldify (Fast)",
    description: "61 MB · Colorize B&W photos",
    size: "~61 MB",
    inputType: "input",
  },
} as const;

export type OnnxModelKey = keyof typeof ONNX_MODELS;
