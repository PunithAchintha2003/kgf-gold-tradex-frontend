/**
 * Camera-based, full-screen AR Try-On experience.
 *
 * Architecture
 * ────────────
 *   1. On open we hit `GET /api/v1/ar-tryon/config/:productId` to resolve the
 *      anchor type for this product (rings → finger, earrings → ear, …) and a
 *      sane set of default scale/rotation/offset values.
 *   2. We request camera access (`getUserMedia`) and start a video stream.
 *   3. `ARTryOnEngine` loads the matching MediaPipe model (HandLandmarker for
 *      hand-based jewelry, FaceLandmarker for face-based jewelry) and runs
 *      inference on every video frame.
 *   4. The detected anchor (smoothed) is fed into the canvas renderer which
 *      composites the product image at the correct position, scale and
 *      rotation, in sync with the video.
 *   5. Snapshot / share buttons composite the video + overlay into a still
 *      PNG; "Add to cart" hands off to the existing cart context.
 *   6. Sessions are recorded against the backend for analytics (only counters,
 *      no images), and finalized on unmount.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  RefreshCcw,
  Share2,
  X,
  ShoppingCart,
  RotateCcw,
  Download,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Hand,
  Smile,
  AlertTriangle,
  Loader2,
  FlipHorizontal2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Slider } from '../../components/ui/slider';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../components/ui/utils';
import {
  fetchARConfig,
  inferARConfigFromCategory,
  startARSession,
  endARSession,
  recordARSnapshot,
  type ARConfig,
  type ARAnchor,
  type ARSession,
} from '../../services/arTryOnService';
import { ARTryOnEngine, AnchorSmoother } from '../../lib/ar/engine';
import { drawFrame, composeSnapshot, type RenderTransformAdjustments } from '../../lib/ar/render';
import type { AnchorTransform } from '../../lib/ar/types';

export interface ARTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

/** Engine sizing multipliers — different anchors describe different body parts. */
const BASE_SIZE_MUL: Record<ARAnchor, number> = {
  finger: 0.9,
  wrist: 0.55,
  ear: 0.75,
  neck: 0.8,
  palm: 0.7,
};

const ANCHOR_LABELS: Record<ARAnchor, { title: string; hint: string; icon: React.ReactNode }> = {
  finger: {
    title: 'Show your hand to the camera',
    hint: 'Open your palm and keep your fingers visible.',
    icon: <Hand className="h-5 w-5" />,
  },
  wrist: {
    title: 'Show the back of your hand',
    hint: 'Keep your wrist roughly horizontal in frame.',
    icon: <Hand className="h-5 w-5" />,
  },
  palm: {
    title: 'Hold your palm to the camera',
    hint: 'Center your palm in the camera view.',
    icon: <Hand className="h-5 w-5" />,
  },
  ear: {
    title: 'Look straight at the camera',
    hint: 'Pull hair back so both earlobes are visible.',
    icon: <Smile className="h-5 w-5" />,
  },
  neck: {
    title: 'Center your face on the camera',
    hint: 'Sit so your collarbone is visible in frame.',
    icon: <Smile className="h-5 w-5" />,
  },
};

function defaultAdjustments(cfg: ARConfig): RenderTransformAdjustments {
  return {
    scaleMul: cfg.scale,
    rotationDeg: cfg.rotationOffsetDeg,
    xOffset: cfg.xOffset,
    yOffset: cfg.yOffset,
    mirrored: cfg.mirrored,
  };
}

/**
 * Load a remote product image into an HTMLImageElement we can draw on canvas.
 * Cross-origin is set so the resulting canvas isn't tainted (snapshot export
 * stays available even when the image is hosted on Cloudinary).
 */
function useOverlayImage(src: string | null): {
  image: HTMLImageElement | null;
  loaded: boolean;
  error: boolean;
} {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImage(null);
      setLoaded(false);
      setError(false);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    setError(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.decoding = 'async';
    img.onload = () => {
      if (cancelled) return;
      setImage(img);
      setLoaded(true);
    };
    img.onerror = () => {
      if (cancelled) return;
      setError(true);
      setLoaded(false);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return { image, loaded, error };
}

interface RuntimeState {
  status: 'idle' | 'requestingCamera' | 'loadingModel' | 'ready' | 'denied' | 'error';
  errorMessage?: string;
}

export const ARTryOnModal: React.FC<ARTryOnModalProps> = ({ isOpen, onClose, product }) => {
  const { addItem, openCart } = useCart();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ARTryOnEngine | null>(null);
  const smoothersRef = useRef<AnchorSmoother[]>([]);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastAnchorsRef = useRef<AnchorTransform[]>([]);
  const sessionRef = useRef<ARSession | null>(null);
  const frameCountRef = useRef(0);
  const trackedFrameCountRef = useRef(0);
  const snapshotCountRef = useRef(0);
  const shareCountRef = useRef(0);
  const fadeRef = useRef(0);

  const [runtime, setRuntime] = useState<RuntimeState>({ status: 'idle' });
  const [config, setConfig] = useState<ARConfig | null>(null);
  const [overlaySrc, setOverlaySrc] = useState<string | null>(null);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [mirrored, setMirrored] = useState(true);
  const [adjustments, setAdjustments] = useState<RenderTransformAdjustments>({
    scaleMul: 1.4,
    rotationDeg: 0,
    xOffset: 0,
    yOffset: 0,
    mirrored: true,
  });
  const [showPanel, setShowPanel] = useState(true);
  const [tracking, setTracking] = useState(false);

  const { image: overlayImage, loaded: overlayReady, error: overlayLoadError } =
    useOverlayImage(overlaySrc);

  // ── 1. Resolve AR config from backend ────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !product) return;
    const fallback = inferARConfigFromCategory(product.category);
    setConfig(fallback);
    setAdjustments(defaultAdjustments(fallback));
    setFacing(fallback.camera);
    setMirrored(fallback.mirrored);
    // Provide an immediate overlay source; the backend response may override it.
    setOverlaySrc(product.images?.[0] || null);

    const controller = new AbortController();
    fetchARConfig(product.id, controller.signal)
      .then((resp) => {
        if (controller.signal.aborted) return;
        setConfig(resp.config);
        setAdjustments(defaultAdjustments(resp.config));
        setFacing(resp.config.camera);
        setMirrored(resp.config.mirrored);
        if (resp.overlayImage) setOverlaySrc(resp.overlayImage);
      })
      .catch(() => {
        // Keep the heuristic fallback; the AR experience still works offline.
      });
    return () => controller.abort();
  }, [isOpen, product]);

  // ── 2. Start try-on session against backend (anonymous-friendly).
  // We deliberately exclude `facing` from the deps so flipping the camera
  // does not spawn a brand-new analytics session.
  useEffect(() => {
    if (!isOpen || !product || !config) return;
    if (sessionRef.current) return;
    let cancelled = false;
    frameCountRef.current = 0;
    trackedFrameCountRef.current = 0;
    snapshotCountRef.current = 0;
    shareCountRef.current = 0;
    startARSession({
      productId: product.id,
      anchor: config.anchor,
      camera: facing,
      client: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        viewport: {
          width: typeof window !== 'undefined' ? window.innerWidth : 0,
          height: typeof window !== 'undefined' ? window.innerHeight : 0,
        },
      },
    })
      .then((s) => {
        if (cancelled) return;
        sessionRef.current = s;
      })
      .catch(() => {
        // Non-fatal: AR still works without analytics.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product, config]);

  // Reset session ref when modal closes so the next open starts fresh.
  useEffect(() => {
    if (!isOpen) {
      sessionRef.current = null;
    }
  }, [isOpen]);

  // ── 3. Camera lifecycle ──────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (animationRef.current != null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }
    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }
    smoothersRef.current = [];
    lastAnchorsRef.current = [];
    fadeRef.current = 0;
  }, []);

  const startCamera = useCallback(async () => {
    if (!isOpen || !config) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setRuntime({ status: 'error', errorMessage: 'Camera APIs are not available in this browser.' });
      return;
    }
    setRuntime({ status: 'requestingCamera' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      video.srcObject = stream;
      // Some browsers require an explicit play() after assigning srcObject.
      await video.play().catch(() => undefined);

      setRuntime({ status: 'loadingModel' });
      const engine = new ARTryOnEngine(config.anchor);
      await engine.init();
      engineRef.current = engine;
      smoothersRef.current = config.anchor === 'ear' ? [new AnchorSmoother(), new AnchorSmoother()] : [new AnchorSmoother()];
      setRuntime({ status: 'ready' });
    } catch (e) {
      const err = e as DOMException | Error;
      const code = (err as DOMException).name;
      if (code === 'NotAllowedError' || code === 'SecurityError') {
        setRuntime({
          status: 'denied',
          errorMessage:
            'Camera access was blocked. Allow camera permission in your browser settings, then reopen AR Try-On.',
        });
      } else if (code === 'NotFoundError' || code === 'OverconstrainedError') {
        setRuntime({
          status: 'error',
          errorMessage: 'We could not find a working camera that matches the requested mode.',
        });
      } else {
        setRuntime({ status: 'error', errorMessage: err.message || 'Could not start the camera.' });
      }
    }
  }, [isOpen, config, facing]);

  // (Re)start camera whenever the modal opens or the active camera changes.
  useEffect(() => {
    if (!isOpen) return;
    void startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Match canvas backing-store size to the rendered video so we draw 1:1.
  useEffect(() => {
    if (!isOpen) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const handle = () => {
      const rect = video.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
    };
    handle();
    const ro = new ResizeObserver(handle);
    ro.observe(video);
    window.addEventListener('resize', handle);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handle);
    };
  }, [isOpen, runtime.status]);

  // ── 4. Animation loop (process video → draw canvas) ───────────────────────
  useEffect(() => {
    if (runtime.status !== 'ready') return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stopped = false;
    const renderLoop = () => {
      if (stopped) return;
      animationRef.current = requestAnimationFrame(renderLoop);
      const engine = engineRef.current;
      if (!engine || video.readyState < 2 || !video.videoWidth) return;

      frameCountRef.current += 1;
      const ts = performance.now();
      const result = engine.process(video, ts);

      const smoothers = smoothersRef.current;
      const smoothed: AnchorTransform[] = [];
      if (result.anchors.length > 0) {
        for (let i = 0; i < smoothers.length; i++) {
          const smoother = smoothers[i];
          if (!smoother) continue;
          const incoming = result.anchors[i] ?? null;
          const s = smoother.smooth(incoming);
          if (s) smoothed.push(s);
        }
        if (smoothed.length > 0) {
          trackedFrameCountRef.current += 1;
          lastAnchorsRef.current = smoothed;
          fadeRef.current = Math.min(1, fadeRef.current + 0.15);
          setTracking((prev) => (prev ? prev : true));
        }
      } else {
        fadeRef.current = Math.max(0, fadeRef.current - 0.05);
        setTracking((prev) => (fadeRef.current > 0 ? prev : prev ? false : prev));
      }

      if (!overlayImage || !config) return;
      drawFrame({
        ctx,
        width: canvas.width,
        height: canvas.height,
        anchors: lastAnchorsRef.current,
        overlay: overlayImage,
        adjustments,
        baseSizeMul: BASE_SIZE_MUL[config.anchor],
        opacity: fadeRef.current,
      });
    };

    animationRef.current = requestAnimationFrame(renderLoop);
    return () => {
      stopped = true;
      if (animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [runtime.status, overlayImage, adjustments, config]);

  // ── 5. Session finalization on close / unmount ───────────────────────────
  const closeSession = useCallback(
    (reason: 'closed' | 'addedToCart' | 'error' | 'navigated', message?: string) => {
      const session = sessionRef.current;
      if (!session) return;
      sessionRef.current = null;
      const payload = {
        frameCount: frameCountRef.current,
        trackedFrameCount: trackedFrameCountRef.current,
        snapshotCount: snapshotCountRef.current,
        shareCount: shareCountRef.current,
        endReason: reason,
        ...(message ? { errorMessage: message } : {}),
      } as const;
      endARSession(session._id, payload).catch(() => {
        // Best-effort analytics; ignore failures.
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      stopCamera();
      closeSession('closed');
    };
  }, [stopCamera, closeSession]);

  const handleClose = useCallback(() => {
    closeSession('closed');
    stopCamera();
    onClose();
  }, [onClose, stopCamera, closeSession]);

  const handleSwitchCamera = useCallback(() => {
    setFacing((f) => (f === 'user' ? 'environment' : 'user'));
  }, []);

  const handleToggleMirror = useCallback(() => {
    setMirrored((m) => {
      const next = !m;
      setAdjustments((adj) => ({ ...adj, mirrored: next }));
      return next;
    });
  }, []);

  const handleResetAdjustments = useCallback(() => {
    if (!config) return;
    setAdjustments(defaultAdjustments(config));
  }, [config]);

  // ── 6. Snapshot / share / add to cart ─────────────────────────────────────
  const downloadSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || !overlayImage) {
      toast.error('Snapshot not ready', { description: 'Wait for tracking to start.' });
      return;
    }
    if (!lastAnchorsRef.current.length) {
      toast.warning('No tracking yet', { description: 'Show the relevant body part to the camera first.' });
      return;
    }
    const composed = composeSnapshot(
      video,
      overlayImage,
      lastAnchorsRef.current,
      adjustments,
      BASE_SIZE_MUL[config?.anchor ?? 'palm']
    );
    const dataUrl = composed.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${(product?.name || 'kgf-ar-tryon').replace(/[^a-z0-9-_]+/gi, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    snapshotCountRef.current += 1;
    const sid = sessionRef.current?._id;
    if (sid) recordARSnapshot(sid, 'snapshot').catch(() => undefined);
    toast.success('Snapshot saved', { description: 'Your AR try-on photo has been downloaded.' });
  }, [overlayImage, adjustments, config, product]);

  const shareSnapshot = useCallback(async () => {
    const blob = await new Promise<Blob | null>((resolve) => {
      const video = videoRef.current;
      if (!video || !overlayImage || !lastAnchorsRef.current.length) {
        resolve(null);
        return;
      }
      const composed = composeSnapshot(
        video,
        overlayImage,
        lastAnchorsRef.current,
        adjustments,
        BASE_SIZE_MUL[config?.anchor ?? 'palm']
      );
      composed.toBlob((b) => resolve(b), 'image/png');
    });
    if (!blob) {
      toast.error('Nothing to share', { description: 'Capture a tracked frame first.' });
      return;
    }
    const file = new File([blob], `kgf-ar-${product?.id || 'tryon'}.png`, { type: 'image/png' });
    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof (navigator as Navigator & { canShare?: (data: ShareData) => boolean }).canShare ===
          'function' &&
        (navigator as Navigator & { canShare?: (data: ShareData) => boolean }).canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: product?.name ? `Try on: ${product.name}` : 'KGF AR Try-On',
          text: 'Look at me trying this on KGF Gold TradeX!',
        });
        shareCountRef.current += 1;
        const sid = sessionRef.current?._id;
        if (sid) recordARSnapshot(sid, 'share').catch(() => undefined);
        return;
      }
    } catch {
      // User dismissed or share API failed → fall through to download fallback.
    }
    // Fallback: same as download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kgf-ar-${product?.id || 'tryon'}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.info('Shared via download', { description: 'Your browser does not support direct sharing. Saved as a file instead.' });
  }, [overlayImage, adjustments, config, product]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      priceLkr: product.price,
      image: product.images?.[0] || '',
      seller: product.seller?.name || 'Merchant',
      purity: `${product.karat}K`,
      weight: product.weight ? `${product.weight}g` : '—',
      quantity: 1,
      ...(product.seller?.id ? { merchantId: product.seller.id } : {}),
    });
    closeSession('addedToCart');
    stopCamera();
    toast.success('Added to cart', { description: `${product.name} is in your cart.` });
    onClose();
    openCart();
  }, [addItem, product, closeSession, stopCamera, onClose, openCart]);

  // Reflect mirror changes into the active adjustments object so the renderer
  // re-mirrors immediately (the slider value is stored *in* adjustments).
  useEffect(() => {
    setAdjustments((adj) => (adj.mirrored === mirrored ? adj : { ...adj, mirrored }));
  }, [mirrored]);

  // Re-init engine if anchor changes (driven by config reload).
  useEffect(() => {
    if (!config || runtime.status !== 'ready') return;
    if (!engineRef.current) return;
    let cancelled = false;
    const switchAnchor = async () => {
      if (cancelled) return;
      const engine = engineRef.current;
      if (!engine) return;
      await engine.setAnchor(config.anchor);
      smoothersRef.current = config.anchor === 'ear'
        ? [new AnchorSmoother(), new AnchorSmoother()]
        : [new AnchorSmoother()];
      lastAnchorsRef.current = [];
    };
    void switchAnchor();
    return () => {
      cancelled = true;
    };
  }, [config, runtime.status]);

  const anchorMeta = config ? ANCHOR_LABELS[config.anchor] : null;

  // ── 7. Markup ────────────────────────────────────────────────────────────
  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const overlayBlocked = overlayLoadError || (!overlayReady && runtime.status === 'ready');

  // Portal to <body> so the modal really covers the page (Radix Dialog gives
  // us z-50 but the dashboard layout already has high z-indices; using a
  // dedicated portal element keeps stacking deterministic).
  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="AR Try-On"
      className={cn(
        'fixed inset-0 z-[100] flex flex-col bg-black text-white',
        'animate-in fade-in-0 duration-150'
      )}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 bg-black/60 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex w-10 h-10 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-white/5">
            {product?.images?.[0] && (
              <ImageWithFallback
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm md:text-base font-semibold truncate">
              {product?.name || 'AR Try-On'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-white/70">
              {anchorMeta && (
                <span className="inline-flex items-center gap-1">
                  {anchorMeta.icon}
                  <span className="hidden md:inline">{anchorMeta.title}</span>
                </span>
              )}
              {tracking ? (
                <Badge className="bg-emerald-500/90 text-white border-emerald-500/50 hover:bg-emerald-500">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-white mr-1 animate-pulse" />
                  Tracking
                </Badge>
              ) : (
                <Badge className="bg-amber-500/90 text-white border-amber-500/50 hover:bg-amber-500">
                  Looking…
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => setShowPanel((p) => !p)}
            aria-label={showPanel ? 'Hide controls' : 'Show controls'}
          >
            {showPanel ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="hidden md:inline ml-1">{showPanel ? 'Hide' : 'Show'} controls</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={handleClose}
            aria-label="Close AR Try-On"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Stage */}
        <div className="relative flex-1 bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={cn(
              'w-full h-full object-cover',
              mirrored && 'scale-x-[-1]'
            )}
          />
          <canvas
            ref={canvasRef}
            className={cn(
              'absolute inset-0 w-full h-full pointer-events-none',
              mirrored && 'scale-x-[-1]'
            )}
          />

          {/* HUD: status messages */}
          {(runtime.status === 'requestingCamera' || runtime.status === 'loadingModel') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg font-medium">
                  {runtime.status === 'requestingCamera'
                    ? 'Asking your browser for camera access…'
                    : 'Loading AR engine…'}
                </p>
                <p className="text-sm text-white/70 max-w-sm">
                  {runtime.status === 'requestingCamera'
                    ? 'Tap "Allow" when the browser prompts you.'
                    : 'First load may take a few seconds while we fetch the on-device model.'}
                </p>
              </div>
            </div>
          )}
          {runtime.status === 'denied' && (
            <PermissionDeniedHUD
              message={runtime.errorMessage || ''}
              onRetry={() => void startCamera()}
              onClose={handleClose}
            />
          )}
          {runtime.status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 max-w-md text-center">
                <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">Could not start AR Try-On</h3>
                <p className="text-sm text-white/70 mb-4">{runtime.errorMessage}</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => void startCamera()}>
                    <RefreshCcw className="h-4 w-4 mr-2" /> Try again
                  </Button>
                  <Button variant="ghost" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom guidance */}
          {runtime.status === 'ready' && !tracking && anchorMeta && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-32 md:bottom-28 max-w-md text-center px-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-sm">
                {anchorMeta.icon}
                <span>{anchorMeta.title}</span>
              </div>
              <p className="text-xs text-white/70 mt-2">{anchorMeta.hint}</p>
            </div>
          )}

          {overlayBlocked && runtime.status === 'ready' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-100 text-xs">
              {overlayLoadError
                ? 'Could not load the product image; using a placeholder overlay.'
                : 'Loading product image…'}
            </div>
          )}

          {/* Action bar */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 md:px-6 md:pb-6">
            <div className="mx-auto max-w-3xl bg-black/60 backdrop-blur border border-white/10 rounded-2xl p-2 flex items-center justify-between gap-2">
              <ActionButton onClick={handleSwitchCamera} label="Switch camera" disabled={runtime.status !== 'ready'}>
                <RefreshCcw className="h-5 w-5" />
              </ActionButton>
              <ActionButton onClick={handleToggleMirror} label={mirrored ? 'Flip off' : 'Flip on'} disabled={runtime.status !== 'ready'}>
                <FlipHorizontal2 className="h-5 w-5" />
              </ActionButton>
              <button
                type="button"
                onClick={downloadSnapshot}
                disabled={runtime.status !== 'ready'}
                className={cn(
                  'mx-2 flex flex-col items-center justify-center h-16 w-16 rounded-full',
                  'bg-white text-black hover:bg-white/90 active:scale-95 transition',
                  'ring-4 ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Capture photo"
              >
                <Camera className="h-7 w-7" />
              </button>
              <ActionButton onClick={shareSnapshot} label="Share" disabled={runtime.status !== 'ready'}>
                <Share2 className="h-5 w-5" />
              </ActionButton>
              <ActionButton onClick={downloadSnapshot} label="Download" disabled={runtime.status !== 'ready'}>
                <Download className="h-5 w-5" />
              </ActionButton>
            </div>
          </div>
        </div>

        {/* Controls panel */}
        {showPanel && product && (
          <aside className="hidden md:flex w-[340px] shrink-0 bg-zinc-950 border-l border-white/10 flex-col">
            <ControlsPanel
              product={product}
              anchorMeta={anchorMeta}
              adjustments={adjustments}
              setAdjustments={setAdjustments}
              onResetAdjustments={handleResetAdjustments}
              onAddToCart={handleAddToCart}
            />
          </aside>
        )}
      </div>

      {/* Mobile controls (collapsible bottom sheet style) */}
      {product && (
        <div className="md:hidden border-t border-white/10 bg-zinc-950">
          <details className="group">
            <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between">
              <span className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Adjust & Buy
              </span>
              <ChevronLeft className="h-4 w-4 -rotate-90 group-open:rotate-90 transition" />
            </summary>
            <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
              <ControlsPanel
                product={product}
                anchorMeta={anchorMeta}
                adjustments={adjustments}
                setAdjustments={setAdjustments}
                onResetAdjustments={handleResetAdjustments}
                onAddToCart={handleAddToCart}
                compact
              />
            </div>
          </details>
        </div>
      )}
    </div>,
    document.body
  );
};

// ─────────────────────────────────────────────────────────────────────────────

interface ControlsPanelProps {
  product: Product;
  anchorMeta: (typeof ANCHOR_LABELS)[ARAnchor] | null;
  adjustments: RenderTransformAdjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<RenderTransformAdjustments>>;
  onResetAdjustments: () => void;
  onAddToCart: () => void;
  compact?: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  product,
  anchorMeta,
  adjustments,
  setAdjustments,
  onResetAdjustments,
  onAddToCart,
  compact,
}) => {
  return (
    <div className={cn('flex flex-col gap-5 p-4 md:p-5', compact && 'py-3')}>
      {!compact && (
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-white/5">
            {product.images?.[0] && (
              <ImageWithFallback
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-base truncate">{product.name}</h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <Badge className="bg-amber-500/90 text-black">{product.karat}K</Badge>
              {product.weight > 0 && (
                <Badge variant="outline" className="border-white/20 text-white/80">
                  {product.weight}g
                </Badge>
              )}
            </div>
            <p className="text-primary font-bold text-lg mt-1">
              {product.currency} {product.price.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {anchorMeta && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex gap-3">
          <div className="shrink-0 p-2 rounded-md bg-primary/15 text-primary">{anchorMeta.icon}</div>
          <div className="text-sm leading-snug">
            <p className="font-medium">{anchorMeta.title}</p>
            <p className="text-white/70">{anchorMeta.hint}</p>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <h4 className="text-sm font-semibold text-white/80">Fine-tune fit</h4>
        <SliderRow
          label="Size"
          value={Math.round(adjustments.scaleMul * 100)}
          unit="%"
          min={50}
          max={250}
          step={5}
          onChange={(v) => setAdjustments((a) => ({ ...a, scaleMul: v / 100 }))}
        />
        <SliderRow
          label="Rotation"
          value={Math.round(adjustments.rotationDeg)}
          unit="°"
          min={-180}
          max={180}
          step={5}
          onChange={(v) => setAdjustments((a) => ({ ...a, rotationDeg: v }))}
        />
        <SliderRow
          label="Horizontal"
          value={Math.round(adjustments.xOffset * 100)}
          unit="%"
          min={-25}
          max={25}
          step={1}
          onChange={(v) => setAdjustments((a) => ({ ...a, xOffset: v / 100 }))}
        />
        <SliderRow
          label="Vertical"
          value={Math.round(adjustments.yOffset * 100)}
          unit="%"
          min={-25}
          max={50}
          step={1}
          onChange={(v) => setAdjustments((a) => ({ ...a, yOffset: v / 100 }))}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={onResetAdjustments}
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Reset to defaults
        </Button>
      </section>

      <div className="mt-auto space-y-2">
        <Button className="w-full kgf-gradient text-white" onClick={onAddToCart}>
          <ShoppingCart className="h-4 w-4 mr-2" /> Add to cart
        </Button>
        <p className="text-[11px] text-white/40 leading-relaxed text-center">
          Tracking runs entirely on your device. No camera footage leaves your browser.
        </p>
      </div>
    </div>
  );
};

const SliderRow: React.FC<{
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
}> = ({ label, value, unit = '', min, max, step = 1, onChange }) => {
  // Slider expects array values.
  const handleChange = useMemo(
    () => (vals: number[]) => {
      const v = vals[0];
      if (typeof v === 'number') onChange(v);
    },
    [onChange]
  );
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>{label}</span>
        <span className="tabular-nums text-white">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
};

const ActionButton: React.FC<{
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, label, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={cn(
      'flex flex-col items-center justify-center h-12 w-12 rounded-full',
      'bg-white/10 text-white hover:bg-white/20 active:scale-95 transition',
      'disabled:opacity-40 disabled:cursor-not-allowed'
    )}
  >
    {children}
  </button>
);

const PermissionDeniedHUD: React.FC<{
  message: string;
  onRetry: () => void;
  onClose: () => void;
}> = ({ message, onRetry, onClose }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4">
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 max-w-md text-center">
      <Camera className="h-10 w-10 text-primary mx-auto mb-3" />
      <h3 className="text-lg font-semibold mb-1">Camera permission required</h3>
      <p className="text-sm text-white/70 mb-4">{message}</p>
      <ol className="text-xs text-left text-white/70 list-decimal pl-5 space-y-1 mb-4">
        <li>Click the camera icon in your address bar.</li>
        <li>Choose &ldquo;Allow&rdquo; for camera access.</li>
        <li>Press &ldquo;Try again&rdquo; below.</li>
      </ol>
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={onRetry}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Try again
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  </div>
);
