/**
 * Client for the `/api/v1/ar-tryon` REST surface.
 *
 * The AR try-on feature does all of its computer vision (face / hand landmark
 * tracking) entirely in the browser. The backend is only consulted to:
 *   1. Resolve a default AR configuration for a given product (anchor type,
 *      default scale, which camera to open, etc.), and
 *   2. Record lightweight analytics about the session (no images sent).
 */

import { getNodeApiV1Base } from '@/utils/env';

export type ARAnchor = 'finger' | 'wrist' | 'ear' | 'neck' | 'palm';
export type ARCameraFacing = 'user' | 'environment';

export interface ARConfig {
  anchor: ARAnchor;
  camera: ARCameraFacing;
  scale: number;
  rotationOffsetDeg: number;
  xOffset: number;
  yOffset: number;
  mirrored: boolean;
}

export interface ARConfigResponse {
  productId: string;
  title: string;
  category: string;
  overlayImage: string;
  config: ARConfig;
}

export interface ARSession {
  _id: string;
  user: string | null;
  product: string;
  anchor: ARAnchor;
  camera: ARCameraFacing;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  frameCount: number;
  trackedFrameCount: number;
  snapshotCount: number;
  shareCount: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: { field?: string; message: string }[];
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function unwrap<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | undefined;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    body = undefined;
  }
  if (!res.ok || !body?.success || body?.data == null) {
    const msg =
      body?.errors?.map((e) => e.message).join(' ') ||
      body?.error ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body.data;
}

export async function fetchARConfig(productId: string, signal?: AbortSignal): Promise<ARConfigResponse> {
  const init: RequestInit = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  };
  if (signal) init.signal = signal;
  const res = await fetch(`${getNodeApiV1Base()}/ar-tryon/config/${productId}`, init);
  return unwrap<ARConfigResponse>(res);
}

export interface StartSessionPayload {
  productId: string;
  anchor?: ARAnchor;
  camera?: ARCameraFacing;
  client?: {
    userAgent?: string;
    viewport?: { width: number; height: number };
  };
}

export async function startARSession(payload: StartSessionPayload): Promise<ARSession> {
  const res = await fetch(`${getNodeApiV1Base()}/ar-tryon/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await unwrap<{ session: ARSession }>(res);
  return data.session;
}

export interface EndSessionPayload {
  frameCount?: number;
  trackedFrameCount?: number;
  snapshotCount?: number;
  shareCount?: number;
  endReason?: 'closed' | 'error' | 'addedToCart' | 'navigated' | 'timeout';
  errorMessage?: string;
}

export async function endARSession(sessionId: string, payload: EndSessionPayload = {}): Promise<ARSession> {
  // `keepalive` is critical: the browser may be unloading when we send this,
  // so the request must survive page close.
  const res = await fetch(`${getNodeApiV1Base()}/ar-tryon/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    keepalive: true,
  });
  const data = await unwrap<{ session: ARSession }>(res);
  return data.session;
}

export async function recordARSnapshot(
  sessionId: string,
  kind: 'snapshot' | 'share' = 'snapshot'
): Promise<{ snapshotCount: number; shareCount: number }> {
  const res = await fetch(`${getNodeApiV1Base()}/ar-tryon/sessions/${sessionId}/snapshots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ kind }),
  });
  return unwrap<{ snapshotCount: number; shareCount: number }>(res);
}

/**
 * Map a frontend `Product['category']` slug onto the AR config the backend
 * would have returned. Used as an immediate fallback before the network
 * request resolves so the camera can start instantly.
 */
export function inferARConfigFromCategory(category: string): ARConfig {
  switch ((category || '').toLowerCase()) {
    case 'rings':
      return { anchor: 'finger', camera: 'user', scale: 1.4, rotationOffsetDeg: 0, xOffset: 0, yOffset: 0.05, mirrored: true };
    case 'bracelets':
      return { anchor: 'wrist', camera: 'user', scale: 2.0, rotationOffsetDeg: 0, xOffset: 0, yOffset: 0, mirrored: true };
    case 'earrings':
      return { anchor: 'ear', camera: 'user', scale: 1.0, rotationOffsetDeg: 0, xOffset: 0, yOffset: 0.05, mirrored: true };
    case 'necklaces':
      return { anchor: 'neck', camera: 'user', scale: 1.8, rotationOffsetDeg: 0, xOffset: 0, yOffset: 0.18, mirrored: true };
    case 'pendants':
      return { anchor: 'neck', camera: 'user', scale: 1.2, rotationOffsetDeg: 0, xOffset: 0, yOffset: 0.16, mirrored: true };
    case 'coins':
      return { anchor: 'palm', camera: 'user', scale: 1.6, rotationOffsetDeg: 0, xOffset: 0, yOffset: 0, mirrored: true };
    case 'bars':
      return { anchor: 'palm', camera: 'user', scale: 2.0, rotationOffsetDeg: 0, xOffset: 0, yOffset: 0, mirrored: true };
    case 'biscuits':
      return { anchor: 'palm', camera: 'user', scale: 1.8, rotationOffsetDeg: 0, xOffset: 0, yOffset: 0, mirrored: true };
    default:
      return { anchor: 'palm', camera: 'user', scale: 1.5, rotationOffsetDeg: 0, xOffset: 0, yOffset: 0, mirrored: true };
  }
}
