import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import CameraStage, { Pin } from '../components/CameraStage';
import { Atmosphere, Walkers } from '../components/Ambience';
import Icon from '../components/Icon';
import { hotspots, l, type Hotspot, type L } from '../data/content';
import { useStore } from '../store';
import { Bubble, M, useCycle, useIsPortrait } from './shared';

type StationId = Hotspot['station'];

const STATIONS: Record<StationId, { src: string; icon: string; name: L; caption: L; time: string; shot: (p: boolean) => { x: number; y: number; z: number }; bounds?: [number, number] }> = {
  waiting: {
    src: M.S02,
    icon: 'chair',
    name: l('صالة الانتظار', 'Waiting hall'),
    caption: l('الصالة مزدحمة… ومحمد لا يعرف متى سيحين دوره.', 'The hall is busy… and Mohammed has no idea when his turn will come.'),
    time: '09:12',
    shot: (p) => ({ x: p ? 0.46 : 0.42, y: 0.45, z: p ? 1 : 1.02 }),
  },
  corridor: {
    src: M.S07,
    icon: 'route',
    name: l('الممرات', 'Corridors'),
    caption: l('ممرات متشابهة ولافتات كثيرة… أين المختبر؟', 'Similar corridors and too many signs… where is the lab?'),
    time: '10:20',
    shot: () => ({ x: 0.91, y: 0.42, z: 1.1 }),
    bounds: [0.81, 1],
  },
  entrance: {
    src: M.S01,
    icon: 'door',
    name: l('المدخل', 'Entrance'),
    caption: l('وصل محمد ومعه مرافقه… من أين يبدأ؟', 'Mohammed arrives with his companion… where should he start?'),
    time: '08:40',
    shot: (p) => ({ x: p ? 0.64 : 0.6, y: 0.62, z: p ? 1.15 : 1.25 }),
  },
};
const ORDER: StationId[] = ['waiting', 'corridor', 'entrance'];

const QUESTIONS = [
  l('متى دوري؟', 'When is my turn?'),
  l('وش الخطوة الجاية؟', "What's next?"),
  l('هل فاتني اسمي؟', 'Did I miss my name?'),
  l('وين العيادة؟', 'Where is the clinic?'),
];
const SIGNS = [
  [l('المختبر', 'Laboratory'), 'arrowBack'],
  [l('الأشعة', 'Radiology'), 'arrow'],
  [l('العيادات', 'Clinics'), 'arrowBack'],
  [l('الصيدلية', 'Pharmacy'), 'arrow'],
] as const;

export default function SceneProblem() {
  const { t, goScene, discovered, discover, lang } = useStore();
  const portrait = useIsPortrait();
  const [station, setStation] = useState<StationId>('waiting');
  const [active, setActive] = useState<Hotspot | null>(null);
  const [hint, setHint] = useState(true);
  const st = STATIONS[station];
  const q = useCycle(QUESTIONS.length, 2600);
  const sign = useCycle(SIGNS.length, 1700, station === 'corridor');
  const [serving, setServing] = useState(38);
  const [famSay, setFamSay] = useState(false);

  useEffect(() => {
    const a = window.setInterval(() => setServing((s) => (s >= 41 ? 38 : s + 1)), 3800);
    const b = window.setInterval(() => setFamSay((v) => !v), 3400);
    const c = window.setTimeout(() => setHint(false), 6500);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
      window.clearTimeout(c);
    };
  }, []);

  const spots = useMemo(() => hotspots.filter((h) => h.station === station), [station]);
  const count = discovered.length;
  const total = hotspots.length;
  const ready = count >= 3;

  const open = (h: Hotspot) => {
    setActive(h);
    discover(h.id);
    setHint(false);
  };

  const go = (s: StationId) => {
    setActive(null);
    setStation(s);
  };

  const nextUndiscoveredStation = ORDER.find((s) => s !== station && hotspots.some((h) => h.station === s && !discovered.includes(h.id)));

  return (
    <section className="scene scene--problem" aria-label={t(l('المشهد الثاني: التحدي', 'Scene 2: The problem'))}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={station}
          className="scene__plate"
          initial={{ opacity: 0, x: lang === 'ar' ? '-6%' : '6%', filter: 'blur(16px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: lang === 'ar' ? '6%' : '-6%', filter: 'blur(16px)' }}
          transition={{ duration: 0.9, ease: [0.3, 0, 0.2, 1] }}
        >
          <CameraStage
            src={st.src}
            shot={st.shot(portrait)}
            draggable
            bounds={st.bounds}
            dof={station === 'corridor' ? 0 : 2.5}
            imgStyle={station === 'corridor' ? { filter: 'saturate(.9)' } : undefined}
          >
            {station === 'waiting' && (
              <>
                <Pin x={0.16} y={0.17} counter={false}>
                  <div className="dscreen">
                    <div className="dscreen__head">{t(l('يُخدم الآن', 'Now serving'))}</div>
                    <AnimatePresence mode="popLayout">
                      <motion.div key={serving} className="dscreen__num" initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-60%', opacity: 0 }}>
                        A-0{serving}
                      </motion.div>
                    </AnimatePresence>
                    <div className="dscreen__row">
                      <span>B-112</span>
                      <span>C-07</span>
                      <span>A-0{serving - 1}</span>
                    </div>
                  </div>
                </Pin>
                <Pin x={portrait ? 0.52 : 0.6} y={portrait ? 0.09 : 0.24}>
                  <div className="bubble-slot">
                    <Bubble show key={q}>
                      {t(QUESTIONS[q])}
                    </Bubble>
                  </div>
                </Pin>
                <Pin x={0.7} y={0.24}>
                  <div className="bubble-slot">
                    <Bubble show={famSay} tone="say">
                      <small>{t(l('المرافق', 'Companion'))}</small>
                      {t(l('طيب وش قالوا لك؟ وش بعده؟', 'So what did they say? What happens next?'))}
                    </Bubble>
                  </div>
                </Pin>
              </>
            )}
            {station === 'corridor' && (
              <>
                <Pin x={0.86} y={0.5}>
                  <AnimatePresence mode="popLayout">
                    <motion.div key={sign} className="hsign" initial={{ opacity: 0, rotateX: -60 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0, rotateX: 60 }}>
                      <Icon name={SIGNS[sign][1]} size={14} />
                      {t(SIGNS[sign][0])}
                    </motion.div>
                  </AnimatePresence>
                </Pin>
                <Pin x={0.94} y={0.86}>
                  <div className="bubble-slot">
                    <Bubble show>{t(l('المختبر… يمين ولا يسار؟', 'The lab… left or right?'))}</Bubble>
                  </div>
                </Pin>
              </>
            )}
            {station === 'entrance' && (
              <>
                <Pin x={0.247} y={0.545} counter={false}>
                  <span className="siren" />
                </Pin>
                <Pin x={0.6} y={0.52}>
                  <div className="bubble-slot">
                    <Bubble show>{t(l('التسجيل من وين؟', 'Where do I register?'))}</Bubble>
                  </div>
                </Pin>
              </>
            )}

            {spots.map((h) => (
              <Pin key={h.id} x={h.x} y={h.y}>
                <button
                  className={`hotspot ${discovered.includes(h.id) ? 'is-found' : ''} ${active?.id === h.id ? 'is-active' : ''}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => open(h)}
                  aria-label={t(h.title)}
                >
                  <span className="hotspot__ring" />
                  <span className="hotspot__core">
                    <Icon name={discovered.includes(h.id) ? 'check' : h.icon} size={16} stroke={2.2} />
                  </span>
                </button>
              </Pin>
            ))}
          </CameraStage>
        </motion.div>
      </AnimatePresence>

      <Walkers kinds={station === 'entrance' ? ['thobe', 'abaya', 'coat'] : ['nurse', 'thobe', 'coat', 'abaya', 'thobe']} density={station === 'waiting' ? 1.3 : 1} />
      <Atmosphere tint={station === 'entrance' ? 'warm' : 'cool'} />
      <div className="scene__scrim scene__scrim--problem" />

      {/* Caption + discovery progress */}
      <div className="problem-hud">
        <div className="problem-hud__top">
          <div className="eyebrow">
            <span className="eyebrow__dot eyebrow__dot--warn" />
            {st.time} — {t(st.name)}
          </div>
          <div className="discover" aria-live="polite">
            <div className="discover__dots">
              {hotspots.map((h) => (
                <span key={h.id} className={discovered.includes(h.id) ? 'on' : ''} />
              ))}
            </div>
            <span>
              {t(l('اكتشفت', 'Found'))} <b>{count}</b> {t(l('من', 'of'))} {total} {t(l('تحديات', 'challenges'))}
            </span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={station} className="problem-hud__caption" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            {t(st.caption)}
          </motion.p>
        </AnimatePresence>
        <AnimatePresence>
          {hint && (
            <motion.div className="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Icon name="hand" size={16} />
              {t(l('اضغط على النقاط المضيئة لتكتشف ما يواجهه محمد — واسحب لاستكشاف المكان', 'Tap the glowing points to discover what Mohammed faces — drag to look around'))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hotspot detail */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="pcard"
            role="dialog"
            aria-label={t(active.title)}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <button className="pcard__close" onClick={() => setActive(null)} aria-label={t(l('إغلاق', 'Close'))}>
              <Icon name="close" size={18} />
            </button>
            <div className="pcard__tag">
              <Icon name={active.icon} size={16} />
              {t(l('تحدٍّ يواجهه المريض', 'A patient challenge'))}
            </div>
            <h3 className="pcard__title">{t(active.title)}</h3>
            <p className="pcard__body">{t(active.body)}</p>
            <div className="pcard__fix">
              <span className="pcard__fixmark">
                <Icon name="sparkle" size={16} />
              </span>
              <div>
                <small>{t(l('كيف يعالجها رفيق', 'How Rafiq addresses it'))}</small>
                <b>{t(active.fix)}</b>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Station switcher + continue */}
      <div className="problem-dock">
        <div className="stations" role="tablist">
          {ORDER.map((s) => {
            const left = hotspots.filter((h) => h.station === s && !discovered.includes(h.id)).length;
            return (
              <button key={s} role="tab" aria-selected={s === station} className={`station ${s === station ? 'is-on' : ''}`} onClick={() => go(s)}>
                <Icon name={STATIONS[s].icon} size={17} />
                <span>{t(STATIONS[s].name)}</span>
                {left > 0 && <i className="station__badge">{left}</i>}
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          {ready ? (
            <motion.button
              key="go"
              className="btn btn--primary btn--lg btn--glow problem-dock__cta"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => goScene('transform')}
            >
              {t(l('كيف تصبح الرحلة أوضح؟', 'How could this journey be clearer?'))}
              <Icon name="arrow" size={18} className="flip-rtl" />
            </motion.button>
          ) : (
            <motion.div key="more" className="problem-dock__more" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {nextUndiscoveredStation && count > 0 && spots.every((h) => discovered.includes(h.id)) ? (
                <button className="btn btn--glass" onClick={() => go(nextUndiscoveredStation)}>
                  {t(l('انتقل إلى', 'Go to'))} {t(STATIONS[nextUndiscoveredStation].name)}
                  <Icon name="arrow" size={16} className="flip-rtl" />
                </button>
              ) : (
                <span>{t(l('اكتشف 3 تحديات على الأقل للمتابعة', 'Discover at least 3 challenges to continue'))}</span>
              )}
              <button className="linkbtn" onClick={() => goScene('transform')}>
                {t(l('تابع القصة', 'Continue'))}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
