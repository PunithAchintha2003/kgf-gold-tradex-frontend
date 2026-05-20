/**
 * Shared types for the AR try-on engine.
 *
 * All coordinates returned by the engine are in *normalized* image space
 * (0..1 across width and 0..1 down height). The renderer is responsible for
 * mapping them to canvas pixels. Keeping the engine output normalized makes
 * the same data usable for both the live preview canvas and the snapshot
 * compositing canvas (which may be a different size).
 */

export type ARAnchorKind = 'finger' | 'wrist' | 'ear' | 'neck' | 'palm';

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface AnchorTransform {
  /** Anchor center in normalized image coords. */
  center: NormalizedPoint;
  /**
   * Approximate width of the anchor area (e.g. finger width, head width)
   * in normalized image coords. Renderer multiplies this by a user-tunable
   * factor and the configured `scale` to size the overlay sprite.
   */
  size: number;
  /** Counter-clockwise rotation in radians to align the overlay. */
  rotation: number;
}

export interface ARProcessResult {
  /**
   * Resolved anchor transforms. For most anchors this contains exactly one
   * entry; for earrings it contains two (left ear then right ear).
   * Empty array means tracking failed for this frame.
   */
  anchors: AnchorTransform[];
  /** True when at least one valid anchor was produced. */
  tracked: boolean;
}
