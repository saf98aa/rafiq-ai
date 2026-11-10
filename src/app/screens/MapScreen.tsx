import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon';
import { destLabel, l, rooms, routes, youAreHere, type DestId } from '../../data/content';
import { useStore } from '../../store';
import { minutesText, suggestedDest } from '../journeyUtil';
import { Header, Notice } from '../ui';

const DESTS: DestId[] = ['clinics', 'lab', 'radiology', 'pharmacy', 'reception', 'waiting'];
const ICON: Record<DestId, string> = { clinics: 'stethoscope', lab: 'flask', radiology: 'scan', pharmacy: 'pill', reception: 'desk', waiting: 'chair' };
const SHORT: Record<DestId, ReturnType<typeof l>> = {
  clinics: l('العيادات', 'Clinics'),
  lab: l('المختبر', 'Lab'),
  radiology: l('الأشعة', 'Radiology'),
  pharmacy: l('الصيدلية', 'Pharmacy'),
  reception: l('الاستقبال', 'Reception'),
  waiting: l('الانتظار', 'Waiting'),
};

const len = (pts: [number, number][]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

export default function MapScreen() {
  const { t, mapDest, stage } = useStore();
  const suggested = suggestedDest(stage);
  const [dest, setDest] = useState<DestId>(mapDest ?? suggested);
  useEffect(() => {
    if (mapDest) setDest(mapDest);
  }, [mapDest]);

  const chips = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chips.current?.querySelector('.is-on') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [dest]);

  const pts = routes[dest];
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  const meters = Math.round(len(pts) * 0.45);
  const mins = Math.max(1, Math.round(meters / 55));
  const end = pts[pts.length - 1];

  return (
    <div className="screen screen--map">
      <Header title={l('خريطة المستشفى', 'Hospital map')} sub={l('الطابق الأرضي', 'Ground floor')} />

      <div className="dests" ref={chips} role="listbox" aria-label={t(l('اختر وجهتك', 'Choose a destination'))}>
        {DESTS.map((x) => (
          <button key={x} role="option" aria-selected={x === dest} className={`dest ${x === dest ? 'is-on' : ''}`} onClick={() => setDest(x)}>
            <Icon name={ICON[x]} size={15} />
            {t(SHORT[x])}
            {x === suggested && <i className="dest__sug">{t(l('مقترح', 'Next'))}</i>}
          </button>
        ))}
      </div>

      <div className="map">
        <svg viewBox="0 0 340 440" className="map__svg" role="img" aria-label={t(l('خريطة مبسّطة للطابق الأرضي', 'Simplified ground-floor map'))}>
          <defs>
            <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M12 0H0V12" fill="none" stroke="#DCEAF3" strokeWidth=".6" />
            </pattern>
            <linearGradient id="route" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#1F7FD0" />
              <stop offset="1" stopColor="#22C3D6" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <rect x="0" y="0" width="340" height="440" rx="18" fill="#F5FAFD" />
          <rect x="0" y="0" width="340" height="440" rx="18" fill="url(#grid)" />
          {/* corridors */}
          <g className="map__corr">
            <rect x="162" y="38" width="16" height="372" rx="8" />
            <rect x="26" y="102" width="288" height="16" rx="8" />
            <rect x="26" y="222" width="288" height="16" rx="8" />
            <rect x="26" y="298" width="288" height="16" rx="8" />
          </g>
          {/* rooms */}
          {rooms.map((r) => {
            const on = r.id === dest;
            return (
              <g key={r.id} className={`map__room ${on ? 'is-on' : ''} ${r.id === 'main' ? 'is-here' : ''}`}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="10" />
                <text x={r.x + r.w / 2} y={r.y + 18} textAnchor="middle">
                  {t(r.label)}
                </text>
              </g>
            );
          })}
          {/* entrance */}
          <g className="map__entry">
            <rect x="128" y="406" width="84" height="22" rx="11" />
            <text x="170" y="421" textAnchor="middle">
              {t(l('المدخل الرئيسي', 'Main entrance'))}
            </text>
          </g>

          {/* route */}
          <path d={d} className="map__route-bg" />
          <motion.path key={dest} d={d} className="map__route" stroke="url(#route)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: [0.3, 0, 0.2, 1] }} />
          <path key={`dash-${dest}`} d={d} className="map__route-dash" />
          {/* walker dot */}
          <circle r="5" className="map__walker">
            <animateMotion key={dest} dur={`${Math.max(2.2, len(pts) / 70)}s`} repeatCount="indefinite" path={d} />
          </circle>

          {/* destination pin */}
          <motion.g key={`pin-${dest}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.9, type: 'spring', stiffness: 300, damping: 14 }} style={{ originX: `${end[0]}px`, originY: `${end[1]}px` }}>
            <circle cx={end[0]} cy={end[1]} r="14" fill="#22C3D6" opacity=".25" filter="url(#glow)" />
            <path d={`M${end[0]} ${end[1]} c-7-9-10-13-10-18a10 10 0 0 1 20 0c0 5-3 9-10 18z`} transform={`translate(0 -2)`} fill="#0B2545" />
            <circle cx={end[0]} cy={end[1] - 20} r="4" fill="#fff" />
          </motion.g>

          {/* you are here */}
          <g className="map__here">
            <circle cx={youAreHere.x} cy={youAreHere.y} r="14" className="map__here-pulse" />
            <circle cx={youAreHere.x} cy={youAreHere.y} r="7" className="map__here-dot" />
          </g>
        </svg>
        <span className="map__you">
          <i />
          {t(l('أنت هنا', 'You are here'))}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={dest} className="routecard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          <span className="routecard__ic">
            <Icon name="nav" size={20} />
          </span>
          <div>
            <small>{t(l('الوجهة', 'Destination'))}</small>
            <b>{t(destLabel[dest])}</b>
          </div>
          <div className="routecard__m">
            <b dir="ltr">~{meters} m</b>
            <small>{t(minutesText(mins))}</small>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="screen__pad">
        <Notice>{t(l('خريطة مبسّطة ومسار مقترح لأغراض العرض — لا يستخدم رفيق هنا تحديد موقع داخلي فعلي.', 'A simplified map and suggested route for this demo — no real indoor positioning is used.'))}</Notice>
      </div>
    </div>
  );
}
