import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import CameraStage, { type Shot } from '../components/CameraStage';
import { Atmosphere } from '../components/Ambience';
import Icon from '../components/Icon';
import { Mark } from '../components/Logo';
import { l, meds } from '../data/content';
import { destById, floors } from '../data/blueprint';
import { hospitalPhotos, people, type PersonId } from '../data/people';
import { useStore } from '../store';
import { lines, useVoice } from '../voice/VoiceProvider';
import { Waveform } from '../voice/VoiceUI';
import { Bubble, StoryLine, useCycle, useIsPortrait, useTimeline } from './shared';
import { PROBLEMS, QUESTIONS, STORY, type Problem } from './story-data';

/* ---------------- building blocks ---------------- */

/** A still photograph brought to life by a virtual camera move (dolly / push-in) with depth-of-field. */
function Plate({ src, aspect, from, to, dur = 9, dof = 0, filter, children }: { src: string; aspect: number; from: Shot; to: Shot; dur?: number; dof?: number; filter?: string; children?: ReactNode }) {
  const [shot, setShot] = useState(from);
  useEffect(() => {
    const id = window.setTimeout(() => setShot(to), 60);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="st-plate">
      <CameraStage src={src} aspect={aspect} shot={shot} duration={dur} dof={dof} imgStyle={filter ? { filter } : undefined}>
        {children}
      </CameraStage>
    </div>
  );
}

/** Full-frame portrait of a character: slow push-in towards the face. */
function PersonPlate({ id, z = [1.05, 1.25], filter, dur = 10 }: { id: PersonId; z?: [number, number]; filter?: string; dur?: number }) {
  const p = people[id];
  return <Plate src={p.photo} aspect={p.w / p.h} from={{ ...p.face, z: z[0] }} to={{ ...p.face, z: z[1] }} dur={dur} dof={2} filter={filter} />;
}

/** Framed photo card with name/role label (layered compositing, gentle parallax float). */
function PersonCard({ id, delay = 0.4, className = '', depth = 1 }: { id: PersonId; delay?: number; className?: string; depth?: number }) {
  const { t } = useStore();
  const p = people[id];
  return (
    <motion.figure
      className={`st-card ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: [0, -6 * depth, 0], scale: 1 }}
      transition={{ opacity: { delay, duration: 0.8 }, scale: { delay, duration: 0.8 }, y: { delay: delay + 0.8, duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <div className="st-card__img">
        <img src={p.photo} alt={`${t(p.name)} — ${t(p.role)}`} style={{ objectPosition: `${p.face.x * 100}% ${Math.max(0, p.face.y * 100 - 8)}%` }} />
      </div>
      <figcaption>
        <b>{t(p.name)}</b>
        <small>{t(p.role)}</small>
      </figcaption>
    </motion.figure>
  );
}

/** Small Rafiq phone that slides into the frame. */
function RafiqPhone({ children, delay = 0.6, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={`st-phone ${className}`} initial={{ opacity: 0, y: 60, rotate: -4, scale: 0.9 }} animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }} transition={{ delay, type: 'spring', stiffness: 120, damping: 18 }}>
      <div className="st-phone__bar">
        <Mark size={16} />
        <span>رفيق</span>
      </div>
      <div className="st-phone__body">{children}</div>
    </motion.div>
  );
}

function VoiceOrb({ line, person }: { line?: string; person?: PersonId }) {
  const { lang, t } = useStore();
  const v = useVoice();
  const speaking = v.status !== 'idle';
  const text = line ? lines[line]?.[v.voiceLang ?? lang] : '';
  return (
    <motion.div className={`st-orb ${speaking ? 'is-on' : ''}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
      <div className="st-orb__core">
        <span className="vc__ring" />
        <span className="vc__ring vc__ring--2" />
        {person ? <img className="st-orb__face" src={people[person].avatar} alt={`${t(people[person].name)}`} /> : <Mark size={30} light animated={speaking} />}
      </div>
      <Waveform bars={20} state={speaking ? v.status : 'idle'} />
      {text && (
        <p className="st-orb__cap" lang={v.voiceLang} dir={v.voiceLang === 'ar' ? 'rtl' : 'ltr'}>
          “{text}”
        </p>
      )}
    </motion.div>
  );
}

/* ---------------- scenes ---------------- */

function SArrival({ onStart }: { onStart: () => void }) {
  const { t } = useStore();
  const [p] = useTimeline([600, 3600, 5200]);
  const e = hospitalPhotos.exterior;
  return (
    <>
      <Plate src={e.src} aspect={e.w / e.h} from={{ x: 0.5, y: 0.5, z: 1 }} to={{ x: 0.68, y: 0.5, z: 1.35 }} dur={14} filter="brightness(.8) saturate(1.05)" />
      <Atmosphere tint="warm" motes={18} />
      <div className="st-copy st-copy--center">
        <StoryLine text={STORY[0].title} show={p >= 1} size="xl" />
        <StoryLine text={STORY[0].sub!} show={p >= 2} size="md" />
        <AnimatePresence>
          {p >= 3 && (
            <motion.button className="btn btn--primary btn--xl btn--glow" onClick={onStart} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Icon name="play" size={16} />
              {t(l('ابدأ التجربة', 'Start the experience'))}
            </motion.button>
          )}
        </AnimatePresence>
        {p >= 3 && <p className="st-hint">{t(l('القصة تتحدث بصوت رفيق — شغّل الصوت', "The story speaks in Rafiq's voice — turn your sound on"))}</p>}
      </div>
    </>
  );
}

function SEmergency() {
  const { t } = useStore();
  const [p] = useTimeline([4600]);
  const er = hospitalPhotos.emergency;
  const serving = 41 + useCycle(4, 2200);
  return (
    <>
      <AnimatePresence>
        {p < 1 ? (
          <motion.div key="er" className="st-layer" exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
            <Plate src={er.src} aspect={er.w / er.h} from={{ x: 0.62, y: 0.55, z: 1 }} to={{ x: 0.72, y: 0.66, z: 1.5 }} dur={6} filter="brightness(.82)" />
          </motion.div>
        ) : (
          <motion.div key="rc" className="st-layer" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }}>
            <PersonPlate id="receptionist" z={[1, 1.15]} filter="brightness(.8)" />
          </motion.div>
        )}
      </AnimatePresence>
      <Atmosphere tint="cool" motes={12} />
      <motion.div className="st-ticker" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} aria-hidden="true">
        <span>{t(l('يُخدم الآن', 'Now serving'))}</span>
        <b dir="ltr">A-0{serving}</b>
        <i />
        <span>{t(l('الطوارئ', 'Emergency'))}</span>
        <b>{t(l('مزدحم', 'Busy'))}</b>
      </motion.div>
      {p >= 1 && <PersonCard id="receptionist" className="st-card--tag" delay={0.6} />}
    </>
  );
}

function SChallenge({ onPause }: { onPause: () => void }) {
  const { t, discovered, discover } = useStore();
  const q = useCycle(QUESTIONS.length, 2300);
  const [open, setOpen] = useState<Problem | null>(null);
  return (
    <>
      <PersonPlate id="patient" z={[1.02, 1.18]} filter="brightness(.72) saturate(.9)" dur={12} />
      <div className="st-vignette" />
      <PersonCard id="companion" className="st-card--side" delay={0.8} />
      <div className="st-q">
        <Bubble show tone="q" key={q}>
          {t(QUESTIONS[q])}
        </Bubble>
      </div>
      <div className="st-hots" aria-label={t(l('اكتشف التحديات', 'Discover the challenges'))}>
        {PROBLEMS.map((h, i) => (
          <motion.button
            key={h.id}
            className={`st-hot ${discovered.includes(h.id) ? 'is-seen' : ''}`}
            style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 + i * 0.2, type: 'spring' }}
            onClick={() => {
              onPause();
              discover(h.id);
              setOpen(h);
            }}
            aria-label={t(h.title)}
          >
            <span className="st-hot__pulse" />
            <Icon name={discovered.includes(h.id) ? 'check' : h.icon} size={18} stroke={2} />
          </motion.button>
        ))}
      </div>
      <p className="st-count">
        <Icon name="hand" size={14} />
        {t(l(`اضغط على النقاط لاكتشاف التحديات · ${discovered.length}/${PROBLEMS.length}`, `Tap the points to discover the challenges · ${discovered.length}/${PROBLEMS.length}`))}
      </p>
      <AnimatePresence>
        {open && (
          <motion.div className="st-pcard" role="dialog" aria-label={t(open.title)} initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}>
            <button className="st-pcard__x" onClick={() => setOpen(null)} aria-label={t(l('إغلاق', 'Close'))}>
              <Icon name="close" size={16} />
            </button>
            <span className="st-pcard__ic">
              <Icon name={open.icon} size={20} />
            </span>
            <b>{t(open.title)}</b>
            <p>{t(open.body)}</p>
            <div className="st-pcard__fix">
              <Mark size={18} />
              <span>{t(open.fix)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SMeet() {
  const { t } = useStore();
  return (
    <>
      <PersonPlate id="companion" z={[1.05, 1.2]} filter="brightness(.55) saturate(.9) blur(2px)" />
      <Atmosphere tint="rafiq" motes={16} />
      <div className="st-center">
        <RafiqPhone>
          <div className="st-ui">
            <small>{t(l('مرحلتك الآن', 'Your stage now'))}</small>
            <b>{t(l('انتظار الطبيب', 'Waiting for the doctor'))}</b>
            <div className="st-ui__big">
              <span dir="ltr">3</span>
              {t(l('مرضى قبلك', 'patients ahead'))}
            </div>
            <div className="st-ui__row">
              <Icon name="clock" size={14} />
              {t(l('الوقت المتوقع: 15 دقيقة', 'Estimated: 15 minutes'))}
            </div>
            <div className="st-ui__next">
              <Icon name="route" size={14} />
              {t(l('التالي: الاستشارة مع د. سارة', 'Next: consultation with Dr. Sara'))}
            </div>
          </div>
        </RafiqPhone>
        <VoiceOrb line="story.meet" />
      </div>
    </>
  );
}

function SVoice() {
  const p = people.patient;
  // keep his face clear in the upper part of the frame while Rafiq's voice appears below
  return (
    <>
      <Plate src={p.photo} aspect={p.w / p.h} from={{ x: p.face.x, y: p.face.y + 0.1, z: 1.15 }} to={{ x: p.face.x, y: p.face.y + 0.16, z: 1.45 }} dur={12} dof={2} filter="brightness(.7)" />
      <div className="st-vignette" />
      <div className="st-center st-center--low">
        <VoiceOrb line="story.voice" />
      </div>
    </>
  );
}

function SNav() {
  const { t } = useStore();
  const f = floors[0];
  const d = destById('lab');
  const path = d.route!.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  return (
    <>
      <div className="st-navbg" />
      <Atmosphere tint="rafiq" motes={10} />
      <div className="st-center">
        <motion.div className="st-plan" initial={{ rotateX: 50, scale: 0.8, opacity: 0 }} animate={{ rotateX: 0, scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className="st-plan__in" style={{ aspectRatio: `${f.w} / ${f.h}` }}>
            <img src={f.img} alt={t(l('مخطط الطابق الأرضي الأصلي', 'Original ground-floor plan'))} />
            <svg viewBox={`0 0 ${f.w} ${f.h}`}>
              <motion.rect x={d.area[0]} y={d.area[1]} width={d.area[2]} height={d.area[3]} rx="10" className="bp__area is-on" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} />
              <path d={path} className="bp__route-bg" />
              <motion.path d={path} className="bp__route" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 2.2 }} />
              <circle cx={200} cy={262} r={9} className="st-plan__you" />
            </svg>
            <motion.span className="st-plan__tag" style={{ left: `${(d.anchor[0] / f.w) * 100}%`, top: `${(d.area[1] / f.h) * 100}%` }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6 }}>
              <Icon name="flask" size={13} />
              {t(d.name)}
            </motion.span>
          </div>
        </motion.div>
        <VoiceOrb line="route.lab" />
      </div>
    </>
  );
}

function SConsult() {
  const { t } = useStore();
  return (
    <>
      <PersonPlate id="doctor" z={[1, 1.15]} filter="brightness(.78)" />
      <div className="st-vignette" />
      <PersonCard id="nurse" className="st-card--side" delay={0.7} />
      <PersonCard id="patient" className="st-card--side2" delay={1.1} depth={0.6} />
      <motion.div className="st-chip st-chip--top" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}>
        <Mark size={16} light />
        {t(l('الاستشارة جارية — العيادة 4', 'Consultation in progress — Clinic 4'))}
      </motion.div>
    </>
  );
}

function SExams() {
  const { t } = useStore();
  const [p] = useTimeline([2600]);
  return (
    <>
      <div className="st-split">
        <motion.div className="st-split__half" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <PersonPlate id="lab" z={[1, 1.12]} filter="brightness(.8)" />
          <span className="st-split__tag">
            {t(people.lab.name)} · {t(people.lab.role)}
          </span>
          <motion.span className="st-split__status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <Icon name="drop" size={15} />
            {t(l('تحليل الدم', 'Blood test'))}
            <b className={p >= 1 ? 'ok' : ''}>{p >= 1 ? t(l('مكتمل', 'Done')) : t(l('قيد التنفيذ', 'In progress'))}</b>
          </motion.span>
        </motion.div>
        <motion.div className="st-split__half" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3 }}>
          <PersonPlate id="radiology" z={[1, 1.12]} filter="brightness(.8)" />
          <span className="st-split__tag">
            {t(people.radiology.name)} · {t(people.radiology.role)}
          </span>
          <motion.span className="st-split__status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
            <Icon name="scan" size={15} />
            {t(l('الموجات فوق الصوتية', 'Ultrasound'))}
            <b>{p >= 1 ? t(l('قيد التنفيذ', 'In progress')) : t(l('بالانتظار', 'Queued'))}</b>
          </motion.span>
        </motion.div>
      </div>
    </>
  );
}

function SResults() {
  const { t } = useStore();
  return (
    <>
      <PersonPlate id="patient" z={[1.05, 1.2]} filter="brightness(.5) saturate(.9) blur(3px)" />
      <Atmosphere tint="rafiq" motes={10} />
      <div className="st-center">
        <RafiqPhone>
          <div className="st-ui">
            <small>{t(l('النتائج', 'Results'))}</small>
            <div className="st-ui__res">
              <Icon name="checkCircle" size={18} />
              <span>{t(l('تحليل الدم الشامل', 'Complete blood count'))}</span>
              <b>{t(l('متاحة', 'Available'))}</b>
            </div>
            <div className="st-ui__res">
              <Icon name="checkCircle" size={18} />
              <span>{t(l('الموجات فوق الصوتية', 'Ultrasound'))}</span>
              <b>{t(l('متاحة', 'Available'))}</b>
            </div>
            <div className="st-ui__note">
              <Icon name="stethoscope" size={14} />
              {t(l('ستشرح لك طبيبتك التفاصيل — رفيق لا يفسّر النتائج.', 'Your doctor will explain the details — Rafiq does not interpret results.'))}
            </div>
          </div>
        </RafiqPhone>
        <VoiceOrb line="story.results" person="patient" />
      </div>
    </>
  );
}

function SPharmacy() {
  const { t } = useStore();
  const m = meds[0];
  return (
    <>
      <PersonPlate id="pharmacist" z={[1, 1.18]} filter="brightness(.72)" />
      <div className="st-vignette" />
      <div className="st-center st-center--low">
        <motion.div className="st-med" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="st-med__top">
            <Icon name="pill" size={18} />
            <b>{t(m.name)}</b>
            <small>{t(l('مثال توضيحي', 'Sample'))}</small>
          </div>
          <p>{t(m.instruction)}</p>
          <span className="st-med__btn">
            <Icon name="speaker" size={15} />
            {t(l('استمع إلى تعليمات الدواء', 'Listen to the medication instructions'))}
          </span>
        </motion.div>
        <VoiceOrb line="med.m1" />
      </div>
    </>
  );
}

function SDone({ onApp, onClosing }: { onApp: () => void; onClosing: () => void }) {
  const { t } = useStore();
  const [p] = useTimeline([1800]);
  return (
    <>
      <div className="st-split st-split--duo">
        <motion.div className="st-split__half" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
          <PersonPlate id="patient" z={[1, 1.1]} filter="brightness(.7)" />
        </motion.div>
        <motion.div className="st-split__half" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.3 }}>
          <PersonPlate id="companion" z={[1, 1.1]} filter="brightness(.7)" />
        </motion.div>
      </div>
      <Atmosphere tint="rafiq" motes={20} />
      <div className="st-copy st-copy--center st-copy--done">
        <motion.div className="st-done" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }}>
          <Icon name="check" size={34} stroke={2.6} />
        </motion.div>
        <StoryLine text={STORY[10].title} show size="xl" />
        <StoryLine text={l('شكرًا لثقتك برفيق.', 'Thank you for trusting Rafiq.')} show={p >= 1} size="md" />
        {p >= 1 && (
          <motion.div className="scene__actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button className="btn btn--primary btn--xl btn--glow" onClick={onApp}>
              <Icon name="phone" size={17} />
              {t(l('ادخل إلى تطبيق رفيق', 'Enter the Rafiq app'))}
            </button>
            <button className="btn btn--glass" onClick={onClosing}>
              {t(l('الختام', 'Closing'))}
              <Icon name="arrow" size={15} className="flip-rtl" />
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}

/* ---------------- player ---------------- */

export default function SceneStory() {
  const { t, storyIdx: idx, setStoryIdx: setIdx, goScene, lang } = useStore();
  const v = useVoice();
  const portrait = useIsPortrait();
  const [playing, setPlaying] = useState(idx > 0);
  const [sound, setSound] = useState(true);
  const meta = STORY[idx];
  const prog = useMotionValue(0);
  const elapsed = useRef(0);
  const spoke = useRef(false);
  const voiceDone = useRef(true);
  const advancing = useRef(false);

  // reset per scene; schedule Rafiq's line
  useEffect(() => {
    elapsed.current = 0;
    prog.set(0);
    advancing.current = false;
    spoke.current = false;
    voiceDone.current = !meta.voice;
    v.stop();
    if (!meta.voice || !sound || !playing) return;
    const id = window.setTimeout(() => {
      spoke.current = true;
      voiceDone.current = false;
      v.speak(meta.voice!, `story:${meta.id}`);
    }, 1300);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // when Rafiq finishes speaking, the scene may advance
  useEffect(() => {
    if (spoke.current && v.status === 'idle') voiceDone.current = true;
  }, [v.status]);

  useAnimationFrame((_, delta) => {
    if (!playing || !meta.dur) return;
    elapsed.current += Math.min(delta, 100);
    prog.set(Math.min(1, elapsed.current / meta.dur));
    if (!advancing.current && elapsed.current >= meta.dur && (voiceDone.current || !sound) && idx < STORY.length - 1) {
      advancing.current = true;
      setIdx(idx + 1);
    }
  });

  const go = (n: number) => {
    v.stop();
    setIdx(Math.max(0, Math.min(STORY.length - 1, n)));
  };
  const start = () => {
    setPlaying(true);
    setSound(true);
    go(1);
  };
  const toggle = () => {
    if (playing) {
      setPlaying(false);
      if (v.status === 'playing') v.pause();
    } else {
      setPlaying(true);
      if (v.status === 'paused') v.resume();
      else if (meta.voice && sound && !spoke.current) {
        spoke.current = true;
        voiceDone.current = false;
        v.speak(meta.voice, `story:${meta.id}`);
      }
    }
  };
  const toggleSound = () => {
    if (sound) v.stop();
    voiceDone.current = true;
    setSound(!sound);
  };

  // keyboard: arrows move between scenes, space pauses
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      const rtl = document.documentElement.dir === 'rtl';
      if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) go(idx + 1);
      if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) go(idx - 1);
      if (e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  });

  const pauseForInteraction = () => {
    setPlaying(false);
    if (v.status === 'playing') v.pause();
  };
  const width = useTransform(prog, (x) => `${x * 100}%`);

  const scene = (() => {
    switch (meta.id) {
      case 'arrival':
        return <SArrival onStart={start} />;
      case 'emergency':
        return <SEmergency />;
      case 'challenge':
        return <SChallenge onPause={pauseForInteraction} />;
      case 'meet':
        return <SMeet />;
      case 'voice':
        return <SVoice />;
      case 'nav':
        return <SNav />;
      case 'consult':
        return <SConsult />;
      case 'exams':
        return <SExams />;
      case 'results':
        return <SResults />;
      case 'pharmacy':
        return <SPharmacy />;
      default:
        return <SDone onApp={() => goScene('app')} onClosing={() => goScene('closing')} />;
    }
  })();

  const showCopy = meta.id !== 'arrival' && meta.id !== 'done';

  return (
    <section className={`scene scene--story st st--${meta.id} ${portrait ? 'is-portrait' : ''}`} aria-label={t(l('قصة رفيق', 'The Rafiq story'))} aria-roledescription={t(l('عرض قصصي', 'story'))}>
      <AnimatePresence mode="sync">
        <motion.div key={meta.id} className="st-scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
          {scene}
          {showCopy && (
            <div className="st-copy">
              <motion.span className="st-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <span dir="ltr">{String(idx + 1).padStart(2, '0')}</span> · {t(meta.kicker)}
              </motion.span>
              <StoryLine text={meta.title} show size="lg" delay={0.4} />
              {meta.sub && <StoryLine text={meta.sub} show size="md" delay={1.2} />}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {idx > 0 && (
        <div className="st-ctrl" role="group" aria-label={t(l('التحكم في القصة', 'Story controls'))}>
          <div className="st-seg">
            {STORY.map((s, i) => (
              <button key={s.id} className={`st-seg__b ${i < idx ? 'is-past' : ''} ${i === idx ? 'is-now' : ''}`} onClick={() => go(i)} aria-label={`${i + 1}. ${t(s.kicker)}`} aria-current={i === idx ? 'step' : undefined}>
                <span>{i === idx && <motion.i style={{ width }} />}</span>
              </button>
            ))}
          </div>
          <div className="st-ctrl__row">
            <button onClick={() => go(idx - 1)} aria-label={t(l('المشهد السابق', 'Previous scene'))}>
              <Icon name="chevron" size={20} className="flip-ltr" />
            </button>
            <button className="st-ctrl__pp" onClick={toggle} aria-label={playing ? t(l('إيقاف مؤقت', 'Pause')) : t(l('تشغيل', 'Play'))}>
              <Icon name={playing ? 'pause' : 'play'} size={20} stroke={2.4} />
            </button>
            <button onClick={() => go(idx + 1)} disabled={idx >= STORY.length - 1} aria-label={t(l('المشهد التالي', 'Next scene'))}>
              <Icon name="chevron" size={20} className="flip-rtl" />
            </button>
            <button onClick={toggleSound} aria-label={sound ? t(l('كتم صوت رفيق', "Mute Rafiq's voice")) : t(l('تشغيل صوت رفيق', "Unmute Rafiq's voice"))} aria-pressed={!sound}>
              <Icon name={sound ? 'speaker' : 'mute'} size={19} />
            </button>
            <button className="st-ctrl__skip" onClick={() => goScene('app')}>
              {t(l('التطبيق', 'App'))}
              <Icon name="skip" size={15} className={lang === 'ar' ? 'flip-rtl' : ''} />
            </button>
          </div>
        </div>
      )}
      {idx === 0 && (
        <button className="skip-intro" onClick={() => goScene('app')}>
          {t(l('تخطّ إلى التطبيق', 'Skip to the app'))}
          <Icon name="skip" size={15} className={lang === 'ar' ? 'flip-rtl' : ''} />
        </button>
      )}
    </section>
  );
}

