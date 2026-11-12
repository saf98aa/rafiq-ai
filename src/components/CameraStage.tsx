import { animate, motion, useMotionValue, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export type Shot = { x: number; y: number; z: number };

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const EASE = [0.33, 0, 0.15, 1] as const;

/**
 * A virtual camera over a still render.
 * - Covers its container (like object-fit: cover) at zoom 1.
 * - Frames a focal point (x,y in 0..1 image space) at zoom z, clamped so the image always covers the view.
 * - Children are laid out in image space (percent), so hotspots stay locked to what they point at.
 * - Optional horizontal drag-to-explore, with optional [min,max] image-space bounds.
 */
export default function CameraStage({
  src,
  aspect = 1600 / 612,
  shot,
  duration = 6,
  draggable = false,
  bounds,
  dof = 0,
  breathe = true,
  className = '',
  imgStyle,
  children,
  onReady,
  bandFill = 0.6,
}: {
  src: string;
  aspect?: number;
  shot: Shot;
  duration?: number;
  draggable?: boolean;
  bounds?: [number, number];
  dof?: number;
  breathe?: boolean;
  className?: string;
  imgStyle?: React.CSSProperties;
  children?: ReactNode;
  onReady?: () => void;
  /** portrait screens: band height as a fraction of the screen (smaller = more of a wide photo visible) */
  bandFill?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(shot.z);
  const first = useRef(true);
  const dragging = useRef<{ px: number; x0: number } | null>(null);
  const [focus, setFocus] = useState({ x: shot.x, y: shot.y });

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // On tall (portrait) screens the wide render is framed as a cinematic band over a
  // blurred fill of itself, instead of being cropped down to a sliver.
  const tall = size.h > 0 && size.w / size.h < 0.8;
  const band = tall ? bandFill : 1;
  const rw = Math.max(size.w, size.h * band * aspect);
  const rh = rw / aspect;

  const minZ = bounds && size.w ? size.w / ((bounds[1] - bounds[0]) * rw) : 0;
  const zOf = (z: number) => Math.max(z, minZ);
  const limitsX = (z: number) => {
    let lo = size.w - z * rw;
    let hi = 0;
    if (bounds) {
      hi = Math.min(hi, -bounds[0] * rw * z);
      lo = Math.max(lo, size.w - bounds[1] * rw * z);
      if (lo > hi) lo = hi = (lo + hi) / 2;
    }
    return [lo, hi] as const;
  };
  const target = (s: Shot) => {
    const z = zOf(s.z);
    const [lo, hi] = limitsX(z);
    return {
      z,
      tx: clamp(size.w / 2 - z * s.x * rw, lo, hi),
      ty: z * rh <= size.h ? (size.h - z * rh) * (tall ? 0.56 : 0.5) : clamp(size.h / 2 - z * s.y * rh, size.h - z * rh, 0),
    };
  };

  useEffect(() => {
    if (!size.w) return;
    const { tx, ty, z } = target(shot);
    setFocus({ x: shot.x, y: shot.y });
    if (first.current) {
      first.current = false;
      x.set(tx);
      y.set(ty);
      scale.set(z);
      onReady?.();
      return;
    }
    const opts = { duration, ease: EASE };
    const a = animate(x, tx, opts);
    const b = animate(y, ty, opts);
    const c = animate(scale, z, opts);
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shot.x, shot.y, shot.z, size.w, size.h]);

  // keep hotspot counter-scale in sync with zoom
  useMotionValueEvent(scale, 'change', (v) => layer.current?.style.setProperty('--z', String(v)));
  useEffect(() => {
    layer.current?.style.setProperty('--z', String(scale.get()));
  }, [scale]);

  const onDown = (e: React.PointerEvent) => {
    if (!draggable) return;
    x.stop();
    dragging.current = { px: e.clientX, x0: x.get() };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const [lo, hi] = limitsX(scale.get());
    x.set(clamp(dragging.current.x0 + (e.clientX - dragging.current.px), lo, hi));
  };
  const onUp = () => {
    dragging.current = null;
  };

  return (
    <div
      ref={box}
      className={`cam ${draggable ? 'cam--drag' : ''} ${className}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {tall && <img className="cam__backdrop" src={src} alt="" draggable={false} style={imgStyle} />}
      {size.w > 0 && (
        <motion.div ref={layer} className={`cam__layer ${tall ? 'cam__layer--band' : ''}`} style={{ width: rw, height: rh, x, y, scale, transformOrigin: '0 0' }}>
          <div className={`cam__breathe ${breathe ? 'is-on' : ''}`} style={{ transformOrigin: `${focus.x * 100}% ${focus.y * 100}%` }}>
            <img className="cam__img" src={src} alt="" draggable={false} style={imgStyle} />
            {dof > 0 && (
              <img
                className="cam__dof"
                src={src}
                alt=""
                draggable={false}
                style={{
                  filter: `blur(${dof}px)`,
                  WebkitMaskImage: `radial-gradient(ellipse 34% 52% at ${focus.x * 100}% ${focus.y * 100}%, transparent 35%, #000 100%)`,
                  maskImage: `radial-gradient(ellipse 34% 52% at ${focus.x * 100}% ${focus.y * 100}%, transparent 35%, #000 100%)`,
                  ...imgStyle,
                }}
              />
            )}
            {children}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/** Element pinned to image-space coordinates inside a CameraStage, kept at constant on-screen size. */
export function Pin({ x, y, children, className = '', counter = true }: { x: number; y: number; children: ReactNode; className?: string; counter?: boolean }) {
  return (
    <div className={`pin ${counter ? 'pin--counter' : ''} ${className}`} style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
      {children}
    </div>
  );
}

export type { MotionValue };
