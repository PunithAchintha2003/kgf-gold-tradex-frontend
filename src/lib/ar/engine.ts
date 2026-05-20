/**
 * MediaPipe Tasks Vision wrapper used by the AR try-on modal.
 *
 * Loads the minimum number of models needed for a given anchor kind:
 *   - finger / wrist / palm → HandLandmarker
 *   - ear / neck           → FaceLandmarker
 *
 * The WASM runtime and `.task` model bundles are served from
 * jsdelivr / googleapis CDNs (the standard MediaPipe distribution channels).
 * Both are cacheable, so subsequent try-ons load instantly.
 */

import {
  FilesetResolver,
  HandLandmarker,
  FaceLandmarker,
  type HandLandmarkerResult,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';

import { handAnchor, earAnchors, neckAnchor } from './anchors';
import type { ARAnchorKind, AnchorTransform, ARProcessResult } from './types';

// The WASM bundle is copied from `node_modules/@mediapipe/tasks-vision/wasm`
// into `public/mediapipe/wasm` at install/build time (see
// `scripts/copy-mediapipe-assets.js`). Serving from our own origin keeps the
// WASM runtime byte-for-byte compatible with the JS bundle, avoids the
// jsDelivr "version not found" 404 we hit when CDN pins drifted, and works
// offline once the page is cached.
const WASM_BASE = '/mediapipe/wasm';

// Model `.task` files are stable, public, CORS-enabled URLs published by
// Google. They rarely change and aren't tied to the runtime JS version, so
// hot-linking them is safe. (If you need fully offline support, host these
// alongside the WASM bundle and swap the URLs here.)
const HAND_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task';
const FACE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

let cachedFileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null = null;
async function getFileset() {
  if (!cachedFileset) {
    cachedFileset = await FilesetResolver.forVisionTasks(WASM_BASE);
  }
  return cachedFileset;
}

type DelegateMode = 'GPU' | 'CPU';

export class ARTryOnEngine {
  private hand: HandLandmarker | null = null;
  private face: FaceLandmarker | null = null;
  private anchor: ARAnchorKind;
  private disposed = false;

  constructor(anchor: ARAnchorKind) {
    this.anchor = anchor;
  }

  /** Lazily initialize whichever landmarker the current anchor needs. */
  async init(): Promise<void> {
    if (this.disposed) return;
    const fileset = await getFileset();

    const needsHand = this.anchor === 'finger' || this.anchor === 'wrist' || this.anchor === 'palm';
    const needsFace = this.anchor === 'ear' || this.anchor === 'neck';

    // Try GPU first, fall back to CPU on platforms (e.g. some iOS Safari) that
    // refuse WebGL inference. This keeps the experience working everywhere.
    if (needsHand && !this.hand) {
      this.hand = await this.createHand(fileset, 'GPU').catch(() => this.createHand(fileset, 'CPU'));
    }
    if (needsFace && !this.face) {
      this.face = await this.createFace(fileset, 'GPU').catch(() => this.createFace(fileset, 'CPU'));
    }
  }

  /** Switch the active anchor at runtime (e.g. when the product changes). */
  async setAnchor(anchor: ARAnchorKind): Promise<void> {
    this.anchor = anchor;
    await this.init();
  }

  /**
   * Process one video frame. The video element must have non-zero
   * `videoWidth` / `videoHeight` (i.e. metadata loaded) before calling.
   */
  process(video: HTMLVideoElement, timestampMs: number): ARProcessResult {
    if (this.disposed) return { anchors: [], tracked: false };
    if (!video || video.readyState < 2 || !video.videoWidth) {
      return { anchors: [], tracked: false };
    }

    if (this.anchor === 'finger' || this.anchor === 'wrist' || this.anchor === 'palm') {
      if (!this.hand) return { anchors: [], tracked: false };
      const result: HandLandmarkerResult = this.hand.detectForVideo(video, timestampMs);
      const lm = result.landmarks?.[0];
      if (!lm) return { anchors: [], tracked: false };
      const t = handAnchor(this.anchor, lm);
      return t ? { anchors: [t], tracked: true } : { anchors: [], tracked: false };
    }

    if (!this.face) return { anchors: [], tracked: false };
    const result: FaceLandmarkerResult = this.face.detectForVideo(video, timestampMs);
    const lm = result.faceLandmarks?.[0];
    if (!lm) return { anchors: [], tracked: false };

    if (this.anchor === 'ear') {
      const pair = earAnchors(lm);
      return pair.length ? { anchors: pair, tracked: true } : { anchors: [], tracked: false };
    }
    const neck = neckAnchor(lm);
    return neck ? { anchors: [neck], tracked: true } : { anchors: [], tracked: false };
  }

  dispose(): void {
    this.disposed = true;
    try {
      this.hand?.close();
    } catch {
      // ignore
    }
    try {
      this.face?.close();
    } catch {
      // ignore
    }
    this.hand = null;
    this.face = null;
  }

  private createHand(
    fileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
    delegate: DelegateMode
  ): Promise<HandLandmarker> {
    return HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  private createFace(
    fileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
    delegate: DelegateMode
  ): Promise<FaceLandmarker> {
    return FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
  }
}

/**
 * Exponential smoother for normalized anchor transforms. The raw landmark
 * stream is jittery at ~30Hz; lerping toward the latest reading by ~30%
 * removes high-frequency noise without adding visible latency.
 */
export class AnchorSmoother {
  private last: AnchorTransform | null = null;

  constructor(private readonly alpha = 0.35) {}

  smooth(next: AnchorTransform | null): AnchorTransform | null {
    if (!next) {
      // Don't reset on a lost frame — let the renderer fade out via opacity.
      return this.last;
    }
    if (!this.last) {
      this.last = next;
      return next;
    }
    const a = this.alpha;
    const lerp = (p: number, q: number) => p + (q - p) * a;
    const lerpAngle = (p: number, q: number) => {
      // Lerp along the shorter arc to avoid 359°→0° flips.
      let d = q - p;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      return p + d * a;
    };
    this.last = {
      center: { x: lerp(this.last.center.x, next.center.x), y: lerp(this.last.center.y, next.center.y) },
      size: lerp(this.last.size, next.size),
      rotation: lerpAngle(this.last.rotation, next.rotation),
    };
    return this.last;
  }

  reset() {
    this.last = null;
  }
}
