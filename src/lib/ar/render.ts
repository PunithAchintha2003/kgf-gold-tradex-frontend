/**
 * Drawing utilities for the AR try-on canvas overlay.
 *
 * The renderer is intentionally stateless: it takes the latest anchor
 * transforms + the user's manual adjustments and paints a single frame.
 * That makes it trivial to reuse for the live preview canvas and for the
 * one-shot snapshot canvas used when capturing a still.
 */

import type { AnchorTransform } from './types';

export interface RenderTransformAdjustments {
  /** User-tunable extra scale (1.0 = engine default). */
  scaleMul: number;
  /** Extra rotation in degrees added to the anchor rotation. */
  rotationDeg: number;
  /** Horizontal offset in normalized coords applied after centering. */
  xOffset: number;
  /** Vertical offset in normalized coords applied after centering. */
  yOffset: number;
  /** When true, x-coordinates are mirrored so the overlay tracks a CSS-mirrored video. */
  mirrored: boolean;
}

export interface DrawFrameOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  anchors: AnchorTransform[];
  overlay: HTMLImageElement | HTMLCanvasElement;
  adjustments: RenderTransformAdjustments;
  /**
   * Multiplies the anchor `size` to convert it to an overlay pixel width.
   * Tuned per anchor kind because, e.g., a finger anchor describes finger
   * width and a face anchor describes head width.
   */
  baseSizeMul: number;
  /** When 0 the overlay is invisible. The HUD uses this for fade-in/out. */
  opacity: number;
}

export function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.restore();
}

export function drawFrame(opts: DrawFrameOptions): void {
  const { ctx, width, height, anchors, overlay, adjustments, baseSizeMul, opacity } = opts;
  clearCanvas(ctx, width, height);
  if (!anchors.length || opacity <= 0) return;

  const overlayAspect =
    overlay instanceof HTMLImageElement
      ? overlay.naturalWidth / Math.max(1, overlay.naturalHeight)
      : overlay.width / Math.max(1, overlay.height);

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

  for (const a of anchors) {
    const nx = adjustments.mirrored ? 1 - a.center.x : a.center.x;
    // Anchor center → canvas pixels (apply user xy offset in normalized space).
    const cx = (nx + adjustments.xOffset) * width;
    const cy = (a.center.y + adjustments.yOffset) * height;
    const sizePx = a.size * Math.min(width, height) * baseSizeMul * Math.max(0.1, adjustments.scaleMul);
    const overlayW = sizePx;
    const overlayH = sizePx / Math.max(0.2, overlayAspect);
    // When the video is CSS-mirrored, x-axis rotations flip too; negate.
    const rot = (adjustments.mirrored ? -1 : 1) * a.rotation + (adjustments.rotationDeg * Math.PI) / 180;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.drawImage(overlay, -overlayW / 2, -overlayH / 2, overlayW, overlayH);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Compose a snapshot PNG: video frame + overlay baked together. The video is
 * drawn with horizontal mirror (when applicable) so the saved image matches
 * what the user just saw on screen.
 */
export function composeSnapshot(
  video: HTMLVideoElement,
  overlay: HTMLImageElement | HTMLCanvasElement,
  anchors: AnchorTransform[],
  adjustments: RenderTransformAdjustments,
  baseSizeMul: number
): HTMLCanvasElement {
  const w = video.videoWidth || 1280;
  const h = video.videoHeight || 720;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.save();
  if (adjustments.mirrored) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);
  ctx.restore();

  drawFrame({
    ctx,
    width: w,
    height: h,
    anchors,
    overlay,
    adjustments,
    baseSizeMul,
    opacity: 1,
  });

  return canvas;
}
