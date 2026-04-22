// ONNX pre/post processing pipeline — adapted from removerized
type Ort = typeof import("onnxruntime-web");

const INFERENCE_SIZE = 1024;

export const preprocessImage = (imgEl: HTMLImageElement, ort: Ort) => {
  const S = INFERENCE_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const ratio = Math.min(S / imgEl.naturalWidth, S / imgEl.naturalHeight);
  const nw = imgEl.naturalWidth * ratio, nh = imgEl.naturalHeight * ratio;
  ctx.fillStyle = "black"; ctx.fillRect(0, 0, S, S);
  ctx.drawImage(imgEl, (S - nw) / 2, (S - nh) / 2, nw, nh);
  const { data } = ctx.getImageData(0, 0, S, S);
  const f32 = new Float32Array(3 * S * S);
  for (let i = 0; i < S * S; i++) {
    f32[i] = data[i * 4] / 255;
    f32[S * S + i] = data[i * 4 + 1] / 255;
    f32[S * S * 2 + i] = data[i * 4 + 2] / 255;
  }
  return new ort.Tensor("float32", f32, [1, 3, S, S]);
};

export const applyMaskAsAlpha = (maskTensor: any, imgEl: HTMLImageElement, quality = 0.9): Promise<Blob> =>
  new Promise((resolve) => {
    const ow = imgEl.naturalWidth, oh = imgEl.naturalHeight;
    const mH = (maskTensor.dims[2] as number) ?? INFERENCE_SIZE;
    const mW = (maskTensor.dims[3] as number) ?? INFERENCE_SIZE;
    const maskData = maskTensor.data as Float32Array;
    const origCanvas = document.createElement("canvas");
    origCanvas.width = ow; origCanvas.height = oh;
    const origCtx = origCanvas.getContext("2d")!;
    origCtx.drawImage(imgEl, 0, 0);
    const origPx = origCtx.getImageData(0, 0, ow, oh);
    const ratio = Math.min(mW / ow, mH / oh);
    const dx = (mW - ow * ratio) / 2, dy = (mH - oh * ratio) / 2;
    for (let i = 0; i < ow * oh; i++) {
      const x = i % ow, y = Math.floor(i / ow);
      const mx = Math.floor(x * ratio + dx), my = Math.floor(y * ratio + dy);
      if (mx < 0 || my < 0 || mx >= mW || my >= mH) { origPx.data[i * 4 + 3] = 0; continue; }
      let v = maskData[my * mW + mx];
      if (v < 0 || v > 1) v = 1 / (1 + Math.exp(-v));
      origPx.data[i * 4 + 3] = Math.round(v * 255);
    }
    const out = document.createElement("canvas");
    out.width = ow; out.height = oh;
    out.getContext("2d")!.putImageData(origPx, 0, 0);
    out.toBlob((b) => resolve(b!), "image/webp", quality);
  });

export const preprocessImageToImage = (
  imgEl: HTMLImageElement, ort: Ort, size = 512,
  opts: { keepAspectRatio?: boolean; grayscale?: boolean; useByteRange?: boolean } = {}
) => {
  const { keepAspectRatio = false, grayscale = false, useByteRange = false } = opts;
  let dw = size, dh = size, ox = 0, oy = 0;
  if (keepAspectRatio) {
    const r = Math.min(size / imgEl.naturalWidth, size / imgEl.naturalHeight);
    dw = Math.max(1, Math.round(imgEl.naturalWidth * r));
    dh = Math.max(1, Math.round(imgEl.naturalHeight * r));
    ox = Math.round((size - dw) / 2); oy = Math.round((size - dh) / 2);
  }
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "black"; ctx.fillRect(0, 0, size, size);
  ctx.drawImage(imgEl, ox, oy, dw, dh);
  const { data } = ctx.getImageData(0, 0, size, size);
  const f32 = new Float32Array(3 * size * size);
  for (let i = 0; i < size * size; i++) {
    let r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    if (grayscale) { const gray = 0.299 * r + 0.587 * g + 0.114 * b; r = g = b = gray; }
    const scale = useByteRange ? 1 : 1 / 255;
    f32[i] = r * scale; f32[size * size + i] = g * scale; f32[size * size * 2 + i] = b * scale;
  }
  return new ort.Tensor("float32", f32, [1, 3, size, size]);
};

export const tensorToImageBlob = (tensor: any, w: number, h: number, quality = 0.9): Promise<Blob> =>
  new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(w, h);
    const data = tensor.data as Float32Array;
    const size = w * h;
    for (let i = 0; i < size; i++) {
      img.data[i * 4] = Math.max(0, Math.min(255, data[i] * 255));
      img.data[i * 4 + 1] = Math.max(0, Math.min(255, data[size + i] * 255));
      img.data[i * 4 + 2] = Math.max(0, Math.min(255, data[size * 2 + i] * 255));
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    canvas.toBlob((b) => resolve(b!), "image/webp", quality);
  });

export const applyColorizerChroma = (tensor: any, imgEl: HTMLImageElement, quality = 0.9): Promise<Blob> =>
  new Promise((resolve) => {
    const ow = imgEl.naturalWidth, oh = imgEl.naturalHeight;
    const tH = Number(tensor.dims[2]) || oh, tW = Number(tensor.dims[3]) || ow;
    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = tW; colorCanvas.height = tH;
    const colorCtx = colorCanvas.getContext("2d")!;
    const colorImg = colorCtx.createImageData(tW, tH);
    const data = tensor.data as Float32Array;
    const size = tW * tH;
    for (let i = 0; i < size; i++) {
      colorImg.data[i * 4] = Math.max(0, Math.min(255, data[i]));
      colorImg.data[i * 4 + 1] = Math.max(0, Math.min(255, data[size + i]));
      colorImg.data[i * 4 + 2] = Math.max(0, Math.min(255, data[size * 2 + i]));
      colorImg.data[i * 4 + 3] = 255;
    }
    colorCtx.putImageData(colorImg, 0, 0);
    const out = document.createElement("canvas");
    out.width = ow; out.height = oh;
    const outCtx = out.getContext("2d")!;
    outCtx.drawImage(imgEl, 0, 0, ow, oh);
    outCtx.globalCompositeOperation = "color";
    outCtx.drawImage(colorCanvas, 0, 0, ow, oh);
    outCtx.globalCompositeOperation = "source-over";
    out.toBlob((b) => resolve(b!), "image/webp", quality);
  });
