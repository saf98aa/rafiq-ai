import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon';
import { l } from '../../data/content';
import { dests, destById, floors, youAreHere, type DestId, type Dest, type FloorId } from '../../data/blueprint';
import { useStore } from '../../store';
import { useVoice } from '../../voice/VoiceProvider';
import { ListenBar } from '../../voice/VoiceUI';
import { suggestedDest } from '../journeyUtil';
import { Header, Notice } from '../ui';

type View = { s: number; x: number; y: number };
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

/** Pan / pinch / wheel zoomable viewer over a real floor-plan image, with route + destination overlays. */
function BlueprintViewer({ floor, dest }: { floor: FloorId; dest: Dest | null }) {
  const { t } = useStore();
  const f = floors.find((x) => x.id === floor)!;
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 });
  const [anim, setAnim] = useState(true);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ view: View; mid: { x: number; y: number }; dist: number } | null>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const fitS = size.w ? Math.min(size.w / f.w, size.h / f.h) : 1;
  const minS = fitS * 0.9;
  const maxS = fitS * 5;

  const limit = useCallback(
    (v: View): View => {
      const s = clamp(v.s, minS, maxS);
      const mw = f.w * s;
      const mh = f.h * s;
      const padX = size.w * 0.35;
      const padY = size.h * 0.35;
      const x = mw <= size.w ? (size.w - mw) / 2 : clamp(v.x, size.w - mw - padX, padX);
      const y = mh <= size.h ? (size.h - mh) / 2 : clamp(v.y, size.h - mh - padY, padY);
      return { s, x, y };
    },
    [f.w, f.h, size.w, size.h, minS, maxS]
  );

  const frame = useCallback(
    (pts: [number, number][]) => {
      if (!size.w) return;
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      const bw = Math.max(x1 - x0, 140) + 90;
      const bh = Math.max(y1 - y0, 140) + 90;
      const s = clamp(Math.min(size.w / bw, size.h / bh), fitS, fitS * 2.6);
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      setAnim(true);
      setView(limit({ s, x: size.w / 2 - cx * s, y: size.h / 2 - cy * s }));
    },
    [size.w, size.h, fitS, limit]
  );

  const fit = useCallback(() => {
    setAnim(true);
    setView(limit({ s: fitS, x: 0, y: 0 }));
  }, [fitS, limit]);

  // frame the destination (and route) whenever it or the floor changes
  useEffect(() => {
    if (!size.w) return;
    if (dest && dest.floor === floor) {
      const a = dest.area;
      const pts: [number, number][] = [...(dest.route ?? []), [a[0], a[1]], [a[0] + a[2], a[1] + a[3]]];
      frame(pts);
    } else fit();
  }, [dest, floor, size.w, size.h, frame, fit]);

  const zoomAt = (factor: number, cx = size.w / 2, cy = size.h / 2) => {
    setView((v) => {
      const s = clamp(v.s * factor, minS, maxS);
      const k = s / v.s;
      return limit({ s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
    });
  };

  const local = (e: React.PointerEvent | React.WheelEvent) => {
    const r = box.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, local(e));
    setAnim(false);
    startGesture();
  };
  const startGesture = () => {
    const p = [...ptrs.current.values()];
    const mid = p.length === 2 ? { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 } : p[0];
    const dist = p.length === 2 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
    gesture.current = { view, mid, dist };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!ptrs.current.has(e.pointerId) || !gesture.current) return;
    ptrs.current.set(e.pointerId, local(e));
    const p = [...ptrs.current.values()];
    const g = gesture.current;
    if (p.length >= 2 && g.dist) {
      const mid = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 };
      const dist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      const s = clamp(g.view.s * (dist / g.dist), minS, maxS);
      const k = s / g.view.s;
      setView(limit({ s, x: mid.x - (g.mid.x - g.view.x) * k, y: mid.y - (g.mid.y - g.view.y) * k }));
    } else {
      setView(limit({ s: g.view.s, x: g.view.x + (p[0].x - g.mid.x), y: g.view.y + (p[0].y - g.mid.y) }));
    }
  };
  const onUp = (e: React.PointerEvent) => {
    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size) startGesture();
    else gesture.current = null;
  };
  const onWheel = (e: React.WheelEvent) => {
    const p = local(e);
    setAnim(false);
    zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step = 40;
    const k: Record<string, () => void> = {
      '+': () => zoomAt(1.25),
      '=': () => zoomAt(1.25),
      '-': () => zoomAt(0.8),
      ArrowUp: () => setView((v) => limit({ ...v, y: v.y + step })),
      ArrowDown: () => setView((v) => limit({ ...v, y: v.y - step })),
      ArrowLeft: () => setView((v) => limit({ ...v, x: v.x + step })),
      ArrowRight: () => setView((v) => limit({ ...v, x: v.x - step })),
      '0': fit,
    };
    if (k[e.key]) {
      e.preventDefault();
      setAnim(true);
      k[e.key]();
    }
  };

  const route = dest && dest.floor === floor ? dest.route : null;
  const d = route ? route.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ') : '';
  const onFloorDests = dests.filter((x) => x.floor === floor);
  const screen = (x: number, y: number) => ({ left: view.x + x * view.s, top: view.y + y * view.s });

  return (
    <div className="bp">
      <div
        ref={box}
        className="bp__view"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
        onKeyDown={onKey}
        tabIndex={0}
        role="application"
        aria-roledescription={t(l('خريطة قابلة للتكبير', 'zoomable map'))}
        aria-label={`${t(f.label)} — ${t(l('اسحب للتحريك، واستخدم الأزرار أو الأسهم للتكبير والتحريك', 'Drag to pan; use the buttons or arrow keys to zoom and move'))}`}
      >
        <div className={`bp__layer ${anim ? 'is-anim' : ''}`} style={{ width: f.w, height: f.h, transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}>
          <img src={f.img} alt={t(l(`مخطط ${f.label.ar} الأصلي`, `Original ${f.label.en} plan`))} draggable={false} />
          <svg viewBox={`0 0 ${f.w} ${f.h}`} className="bp__svg" aria-hidden="true">
            {onFloorDests.map((x) => (
              <rect
                key={x.id}
                x={x.area[0]}
                y={x.area[1]}
                width={x.area[2]}
                height={x.area[3]}
                rx="8"
                className={`bp__area ${dest?.id === x.id ? 'is-on' : ''}`}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {route && (
              <>
                <path d={d} className="bp__route-bg" vectorEffect="non-scaling-stroke" />
                <motion.path key={`r-${dest!.id}`} d={d} className="bp__route" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: [0.3, 0, 0.2, 1] }} />
                <circle r={5 / view.s + 2} className="bp__walker">
                  <animateMotion key={`w-${dest!.id}`} dur="3.2s" repeatCount="indefinite" path={d} />
                </circle>
              </>
            )}
          </svg>
        </div>

        {/* constant-size overlays */}
        {floor === youAreHere.floor && (
          <span className="bp__you" style={screen(youAreHere.x, youAreHere.y)}>
            <i />
            <b>{t(youAreHere.label)}</b>
          </span>
        )}
        {onFloorDests.map((x) => (
          <span key={x.id} className={`bp__label ${dest?.id === x.id ? 'is-on' : ''}`} style={screen(x.anchor[0], x.anchor[1])}>
            <Icon name={x.icon} size={12} />
            {t(x.name)}
          </span>
        ))}
        {dest && dest.floor === floor && (
          <motion.span key={`pin-${dest.id}`} className="bp__pin" style={screen(dest.anchor[0], dest.area[1])} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 16 }}>
            <Icon name="pin" size={26} stroke={2} />
          </motion.span>
        )}

        <div className="bp__zoom">
          <button onClick={() => (setAnim(true), zoomAt(1.3))} aria-label={t(l('تكبير', 'Zoom in'))}>
            <Icon name="plus" size={18} />
          </button>
          <button onClick={() => (setAnim(true), zoomAt(1 / 1.3))} aria-label={t(l('تصغير', 'Zoom out'))}>
            <Icon name="minus" size={18} />
          </button>
          <button onClick={fit} aria-label={t(l('عرض المخطط كاملًا', 'Show the whole plan'))}>
            <Icon name="scan" size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Interactive hospital map — real floor plans, verified destinations, spoken route explanations. */
export default function MapScreen() {
  const { t, mapDest, stage, a11y } = useStore();
  const v = useVoice();
  const initial = destById(mapDest ?? (suggestedDest(stage) as DestId));
  const [dest, setDest] = useState<Dest>(initial);
  const [floor, setFloor] = useState<FloorId>(initial.floor);
  const suggested = suggestedDest(stage);

  useEffect(() => {
    if (!mapDest) return;
    const d = destById(mapDest);
    setDest(d);
    setFloor(d.floor);
  }, [mapDest]);

  const chips = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chips.current?.querySelector('.is-on') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [dest]);

  const choose = (d: Dest) => {
    setDest(d);
    setFloor(d.floor);
    if (a11y.voiceGuide) v.speak(`route.${d.id}`);
  };
  const f = floors.find((x) => x.id === floor)!;
  const otherFloor = dest.floor !== floor;

  return (
    <div className="screen screen--map">
      <Header title={l('خريطة المستشفى', 'Hospital map')} sub={l('من المخططات المعمارية الحقيقية', 'From the real architectural plans')} />
      <div className="floors" role="tablist" aria-label={t(l('اختر الطابق', 'Choose a floor'))}>
        <Icon name="layers" size={16} />
        {floors.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === floor} className={x.id === floor ? 'is-on' : ''} onClick={() => setFloor(x.id)}>
            {t(x.short)}
          </button>
        ))}
      </div>

      <div className="dests" ref={chips} role="listbox" aria-label={t(l('اختر وجهتك', 'Choose a destination'))}>
        {dests.map((x) => (
          <button key={x.id} role="option" aria-selected={x.id === dest.id} className={`dest ${x.id === dest.id ? 'is-on' : ''}`} onClick={() => choose(x)}>
            <Icon name={x.icon} size={15} />
            {t(x.name)}
            {x.id === suggested && <i className="dest__sug">{t(l('مقترح', 'Next'))}</i>}
          </button>
        ))}
      </div>

      <BlueprintViewer floor={floor} dest={dest} />
      <p className="bp__note">
        <Icon name="info" size={13} />
        {t(f.note)}
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={dest.id} className="routecard routecard--bp" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          <div className="routecard__row">
            <span className="routecard__ic">
              <Icon name={dest.route ? 'nav' : 'pin'} size={20} />
            </span>
            <div>
              <small>{t(l('الوجهة', 'Destination'))}</small>
              <b>{t(dest.name)}</b>
              <small className="routecard__plan">
                {t(l('في المخطط:', 'On the plan:'))} {t(dest.planName)} · {t(floors.find((x) => x.id === dest.floor)!.label)}
              </small>
            </div>
          </div>
          {otherFloor && (
            <button className="btn btn--soft btn--sm" onClick={() => setFloor(dest.floor)}>
              <Icon name="layers" size={15} />
              {t(l('اعرض طابق الوجهة', "Show the destination's floor"))}
            </button>
          )}
          <p className="routecard__how">
            {dest.route
              ? t(l('اتبع الخط الأزرق من موقعك التجريبي عبر الممرات الموضحة في المخطط.', 'Follow the blue line from your demo location through the corridors shown on the plan.'))
              : t(l('يُعرض الموقع فقط: المخطط لا يوضح الطريق بين الطوابق.', 'Location only: the plan does not show the way between floors.'))}
          </p>
          <ListenBar line={`route.${dest.id}`} label={l('استمع إلى الاتجاهات', 'Listen to the directions')} />
        </motion.div>
      </AnimatePresence>

      <div className="screen__pad">
        <Notice>
          {t(
            l(
              'المخطط مأخوذ من رسومات معمارية لمستشفى الولادة ويُستخدم هنا كمثال لطريقة الملاحة. موقعك محاكاة — لا يستخدم رفيق تحديد موقع داخلي أو GPS.',
              "The plan comes from a maternity hospital's architectural drawings and is used here to demonstrate navigation. Your position is simulated — Rafiq uses no indoor positioning or GPS."
            )
          )}
        </Notice>
      </div>
    </div>
  );
}
