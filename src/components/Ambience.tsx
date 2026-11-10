import { useEffect, useRef, useState } from 'react';

/* ---------------------------------------------------------------
   Foreground passers-by: out-of-focus figures crossing close to
   the camera. They give each still render real depth and life.
---------------------------------------------------------------- */

type Kind = 'thobe' | 'nurse' | 'abaya' | 'coat';
type Walker = { id: number; kind: Kind; dir: 1 | -1; dur: number; scale: number; blur: number; op: number; bottom: number };

const palette: Record<Kind, { body: string; head: string; trim: string; leg: string }> = {
  thobe: { body: '#EEF2F5', head: '#E9E4E4', trim: '#C8313B', leg: '#D9DEE3' },
  nurse: { body: '#1E3A66', head: '#1A2F55', trim: '#2A4C82', leg: '#1E3A66' },
  abaya: { body: '#15181D', head: '#121417', trim: '#24282F', leg: '#15181D' },
  coat: { body: '#F7F9FB', head: '#3A2A22', trim: '#7FB6DA', leg: '#2C4A73' },
};

function Figure({ kind }: { kind: Kind }) {
  const c = palette[kind];
  const long = kind === 'thobe' || kind === 'abaya';
  return (
    <svg viewBox="0 0 120 360" className="walker__svg" aria-hidden="true">
      <g className="walker__bob">
        {/* back arm */}
        <g className="walker__arm walker__arm--b">
          <rect x="52" y="78" width="16" height="104" rx="8" fill={c.body} opacity=".82" />
        </g>
        {/* legs */}
        <g className="walker__leg walker__leg--a">
          <rect x="47" y={long ? 250 : 200} width="16" height={long ? 100 : 150} rx="8" fill={c.leg} />
        </g>
        <g className="walker__leg walker__leg--b">
          <rect x="57" y={long ? 250 : 200} width="16" height={long ? 100 : 150} rx="8" fill={c.leg} opacity=".9" />
        </g>
        {/* body */}
        {long ? (
          <path d="M38 74 Q60 62 82 74 L94 296 Q60 306 26 296 Z" fill={c.body} />
        ) : (
          <path d="M38 74 Q60 62 82 74 L88 214 Q60 222 32 214 Z" fill={c.body} />
        )}
        {kind === 'coat' && <path d="M58 76 L62 76 L62 214 L58 214 Z" fill={c.trim} opacity=".5" />}
        {/* head */}
        <circle cx="60" cy="42" r="23" fill={c.head} />
        {kind === 'thobe' && (
          <>
            <path d="M34 40 Q60 10 86 40 L92 96 Q60 84 28 96 Z" fill={c.head} />
            <path d="M34 40 Q60 10 86 40" stroke={c.trim} strokeWidth="5" fill="none" strokeDasharray="5 5" opacity=".75" />
            <rect x="36" y="26" width="48" height="7" rx="3.5" fill="#1b1b1b" opacity=".85" />
          </>
        )}
        {(kind === 'nurse' || kind === 'abaya') && <path d="M34 44 Q60 2 86 44 L88 86 Q60 96 32 86 Z" fill={c.head} />}
        {/* front arm */}
        <g className="walker__arm walker__arm--a">
          <rect x="52" y="78" width="16" height="108" rx="8" fill={c.body} />
        </g>
      </g>
    </svg>
  );
}

export function Walkers({ kinds = ['thobe', 'nurse', 'abaya', 'coat', 'thobe'], every = [3800, 7600], density = 1 }: { kinds?: Kind[]; every?: [number, number]; density?: number }) {
  const [list, setList] = useState<Walker[]>([]);
  const n = useRef(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let t: number;
    const spawn = (delay: number) => {
      t = window.setTimeout(() => {
        const near = Math.random() < 0.55;
        const w: Walker = {
          id: ++n.current,
          kind: kinds[Math.floor(Math.random() * kinds.length)],
          dir: Math.random() < 0.5 ? 1 : -1,
          dur: near ? 5.2 + Math.random() * 2 : 9 + Math.random() * 4,
          scale: near ? 1.05 + Math.random() * 0.35 : 0.55 + Math.random() * 0.2,
          blur: near ? 9 + Math.random() * 6 : 3.5 + Math.random() * 2,
          op: near ? 0.82 : 0.55,
          bottom: near ? -22 - Math.random() * 10 : -2 + Math.random() * 6,
        };
        setList((l) => [...l.slice(-4), w]);
        spawn((every[0] + Math.random() * (every[1] - every[0])) / density);
      }, delay);
    };
    spawn(900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="walkers" aria-hidden="true">
      {list.map((w) => (
        <div
          key={w.id}
          className={`walker walker--${w.dir > 0 ? 'ltr' : 'rtl'}`}
          style={
            {
              '--dur': `${w.dur}s`,
              '--s': w.scale,
              '--blur': `${w.blur}px`,
              opacity: w.op,
              bottom: `${w.bottom}%`,
              zIndex: w.scale > 1 ? 3 : 1,
            } as React.CSSProperties
          }
          onAnimationEnd={(e) => {
            if (e.animationName === 'walk-ltr' || e.animationName === 'walk-rtl') setList((l) => l.filter((x) => x.id !== w.id));
          }}
        >
          <div className="walker__flip">
            <Figure kind={w.kind} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Dust motes drifting through light, a slow light sweep, vignette and grain. */
export function Atmosphere({ tint = 'cool', motes = 18, sweep = true }: { tint?: 'cool' | 'warm' | 'rafiq'; motes?: number; sweep?: boolean }) {
  const dots = useRef(
    Array.from({ length: motes }, () => ({
      l: Math.random() * 100,
      t: 20 + Math.random() * 75,
      s: 2 + Math.random() * 4,
      d: 9 + Math.random() * 14,
      dl: -Math.random() * 20,
    }))
  );
  return (
    <div className={`atmo atmo--${tint}`} aria-hidden="true">
      {sweep && <div className="atmo__sweep" />}
      <div className="atmo__motes">
        {dots.current.map((d, i) => (
          <span key={i} style={{ left: `${d.l}%`, top: `${d.t}%`, width: d.s, height: d.s, animationDuration: `${d.d}s`, animationDelay: `${d.dl}s` }} />
        ))}
      </div>
      <div className="atmo__vignette" />
      <div className="atmo__grain" />
    </div>
  );
}
