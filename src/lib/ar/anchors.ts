/**
 * Anchor extraction: convert raw MediaPipe landmark output into the
 * normalized {center, size, rotation} transforms the renderer consumes.
 *
 * MediaPipe landmark conventions (Tasks Vision 0.10.x):
 *   - HandLandmarker: 21 landmarks per hand, indexed per the standard
 *     MediaPipe hand topology (0=wrist, 5=index MCP, 9=middle MCP, 13=ring MCP,
 *     14=ring PIP, 17=pinky MCP, ...).
 *   - FaceLandmarker: 478 landmarks per face (FaceMesh topology). The indices
 *     used below were chosen for stability:
 *        152 → chin
 *        10  → forehead (top center)
 *        234 → left  cheek / earlobe vicinity
 *        454 → right cheek / earlobe vicinity
 *        323 → right tragion (more accurate ear landmark)
 *        93  → left  tragion
 */

import type { AnchorTransform, NormalizedPoint, ARAnchorKind } from './types';

interface LandmarkLike {
  x: number;
  y: number;
  z?: number;
}

function distance(a: NormalizedPoint, b: NormalizedPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function midpoint(a: NormalizedPoint, b: NormalizedPoint, t = 0.5): NormalizedPoint {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function angleBetween(a: NormalizedPoint, b: NormalizedPoint): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/** Hand-based anchors. `landmarks` must be the 21-point landmark array. */
export function handAnchor(
  kind: Extract<ARAnchorKind, 'finger' | 'wrist' | 'palm'>,
  landmarks: LandmarkLike[]
): AnchorTransform | null {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const middleMcp = landmarks[9];
  const ringMcp = landmarks[13];
  const ringPip = landmarks[14];
  const pinkyMcp = landmarks[17];
  if (!wrist || !indexMcp || !middleMcp || !ringMcp || !ringPip || !pinkyMcp) return null;

  switch (kind) {
    case 'finger': {
      // Center the ring sprite between the MCP and PIP of the ring finger;
      // size it relative to the inter-knuckle distance so it stays in scale
      // as the hand approaches/recedes from the camera.
      const center = midpoint(ringMcp, ringPip, 0.45);
      const fingerWidth = distance(indexMcp, pinkyMcp) * 0.18;
      // Perpendicular to the finger bone so the ring band is upright.
      const bone = angleBetween(ringMcp, ringPip);
      const rotation = bone - Math.PI / 2;
      return { center, size: Math.max(fingerWidth, 0.02), rotation };
    }
    case 'wrist': {
      const handAxis = angleBetween(wrist, middleMcp);
      // Approximate forearm direction by extending the wrist→knuckle vector.
      const span = distance(indexMcp, pinkyMcp);
      const center: NormalizedPoint = {
        x: wrist.x + Math.cos(handAxis + Math.PI) * span * 0.15,
        y: wrist.y + Math.sin(handAxis + Math.PI) * span * 0.15,
      };
      const rotation = handAxis - Math.PI / 2;
      return { center, size: Math.max(span * 1.1, 0.06), rotation };
    }
    case 'palm': {
      // Palm center ~ centroid of wrist + index/middle/ring/pinky MCPs.
      const center: NormalizedPoint = {
        x: (wrist.x + indexMcp.x + middleMcp.x + ringMcp.x + pinkyMcp.x) / 5,
        y: (wrist.y + indexMcp.y + middleMcp.y + ringMcp.y + pinkyMcp.y) / 5,
      };
      const span = distance(indexMcp, pinkyMcp);
      const rotation = angleBetween(wrist, middleMcp) - Math.PI / 2;
      return { center, size: Math.max(span * 1.4, 0.08), rotation };
    }
    default:
      return null;
  }
}

/** Earring anchor: returns transforms for left + right ears. */
export function earAnchors(landmarks: LandmarkLike[]): AnchorTransform[] {
  if (!landmarks || landmarks.length < 468) return [];

  const chin = landmarks[152];
  const forehead = landmarks[10];
  const leftEar = landmarks[234];
  const rightEar = landmarks[454];
  if (!chin || !forehead || !leftEar || !rightEar) return [];

  const headHeight = distance(forehead, chin);
  if (!Number.isFinite(headHeight) || headHeight <= 0) return [];

  // Align earrings to the face tilt so they swing realistically.
  const rotation = angleBetween(forehead, chin) - Math.PI / 2;
  const size = headHeight * 0.18;

  // Drop slightly below the cheek landmark so the earring hangs from the lobe.
  const dropY = headHeight * 0.04;
  return [
    { center: { x: leftEar.x, y: leftEar.y + dropY }, size, rotation },
    { center: { x: rightEar.x, y: rightEar.y + dropY }, size, rotation },
  ];
}

/** Neck / chest anchor for necklaces and pendants. */
export function neckAnchor(landmarks: LandmarkLike[]): AnchorTransform | null {
  if (!landmarks || landmarks.length < 468) return null;

  const chin = landmarks[152];
  const forehead = landmarks[10];
  const leftJaw = landmarks[234];
  const rightJaw = landmarks[454];
  if (!chin || !forehead || !leftJaw || !rightJaw) return null;

  const headHeight = distance(forehead, chin);
  const faceWidth = distance(leftJaw, rightJaw);
  if (!Number.isFinite(headHeight) || headHeight <= 0) return null;

  const tilt = angleBetween(forehead, chin);
  // Project a point a fraction of a head-height below the chin along the
  // face axis. This sits roughly where a pendant rests on the chest.
  const drop = headHeight * 0.7;
  const center: NormalizedPoint = {
    x: chin.x + Math.cos(tilt) * drop * 0.55,
    y: chin.y + Math.sin(tilt) * drop * 0.55,
  };
  const rotation = tilt - Math.PI / 2;
  const size = Math.max(faceWidth, headHeight) * 1.3;

  return { center, size, rotation };
}
