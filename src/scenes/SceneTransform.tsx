import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import CameraStage, { Pin } from '../components/CameraStage';
import { Atmosphere, Walkers } from '../components/Ambience';
import Icon from '../components/Icon';
import { Mark } from '../components/Logo';
import { l } from '../data/content';
import { useStore } from '../store';
import { M, StoryLine, useIsPortrait, useTimeline } from './shared';
import PhonePreview from '../app/PhonePreview';

const MEET = l('تعرّف على رفيق. مرافقك الذكي في رحلتك الصحية.', 'Meet Rafiq. Your intelligent patient companion.');
const EXPLAIN = l('يجمع رفيق مراحل رحلتك الصحية في تجربة واحدة واضحة وسهلة.', 'Rafiq connects the different stages of your hospital journey in one clear, accessible experience.');

const QS = [
  { t: l('متى دوري؟', 'When is my turn?'), x: -38, y: -30 },
  { t: l('وين المختبر؟', 'Where is the lab?'), x: 30, y: -40 },
  { t: l('وش الخطوة الجاية؟', "What's next?"), x: -26, y: 8 },
  { t: l('النتائج متى تطلع؟', 'When are results ready?'), x: 34, y: 2 },
  { t: l('وين أدويتي؟', 'Where are my meds?'), x: 0, y: 30 },
];
const ANSWERS = [
  { icon: 'clock', t: l('دورك بعد 3 مرضى', '3 patients ahead of you') },
  { icon: 'pin', t: l('العيادة 4 — الطابق الأرضي', 'Clinic 4 — Ground floor') },
  { icon: 'route', t: l('الخطوة التالية: الاستشارة', 'Next: consultation') },
];

export default function SceneTransform() {
  const { t, goScene } = useStore();
  const portrait = useIsPortrait();
  const [p, setP] = useTimeline([200, 1900, 2700, 6000, 7000]);
  const [entering, setEntering] = useState(false);

  const enter = () => {
    setEntering(true);
    window.setTimeout(() => goScene('app'), 900);
  };

  const plate = p < 3 ? 'confused' : p < 4 ? 'calm' : 'phone';
  const sideBySide = window.matchMedia('(min-width: 1000px) and (min-aspect-ratio: 4/3)').matches;
  const ps = sideBySide ? Math.min(0.8, (window.innerHeight - 150) / 868) : Math.max(0.3, Math.min(0.56, (window.innerHeight - 440) / 868));

  return (
    <section className={`scene scene--transform phase-${p}`} aria-label={t(l('المشهد الثالث: التحوّل', 'Scene 3: The transformation'))}>
      <AnimatePresence>
        {plate === 'confused' && (
          <motion.div key="a" className="scene__plate" exit={{ opacity: 0, filter: 'blur(12px) saturate(1.2)' }} transition={{ duration: 1.2 }}>
            <CameraStage
              src={M.S02}
              shot={p >= 2 ? { x: 0.46, y: 0.4, z: portrait ? 1.15 : 1.4 } : { x: 0.46, y: 0.42, z: portrait ? 1.05 : 1.25 }}
              duration={3}
              dof={4}
              imgStyle={{ filter: p >= 2 ? 'saturate(1) brightness(1.05)' : 'saturate(.45) brightness(.85) contrast(1.05)', transition: 'filter 1.6s ease' }}
            >
              <Pin x={0.5} y={0.32}>
                <div className="qcloud">
                  {QS.map((q, i) => (
                    <motion.span
                      key={i}
                      className="qcloud__q"
                      initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                      animate={
                        p >= 2
                          ? { opacity: 0, scale: 0.2, x: 0, y: 60, filter: 'blur(6px)' }
                          : p >= 1
                          ? { opacity: 1, scale: 1, x: q.x * (portrait ? 1.5 : 3), y: q.y * (portrait ? 2.8 : 2.4) }
                          : {}
                      }
                      transition={{ duration: p >= 2 ? 0.9 : 0.7, delay: p >= 2 ? i * 0.06 : i * 0.18, ease: 'easeOut' }}
                    >
                      {t(q.t)}
                    </motion.span>
                  ))}
                </div>
              </Pin>
            </CameraStage>
          </motion.div>
        )}
        {plate === 'calm' && (
          <motion.div
            key="b"
            className="scene__plate"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1.3 }}
          >
            <CameraStage src={M.S06} shot={{ x: portrait ? 0.4 : 0.42, y: 0.4, z: portrait ? 1.05 : 1.2 }} duration={4} dof={3}>
              <Pin x={portrait ? 0.4 : 0.6} y={portrait ? 0.62 : 0.5}>
                <div className="answers">
                  {ANSWERS.map((a, i) => (
                    <motion.div key={i} className="answer" initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.6 + i * 0.35, type: 'spring', stiffness: 220, damping: 20 }}>
                      <span className="answer__ic">
                        <Icon name={a.icon} size={15} />
                      </span>
                      {t(a.t)}
                    </motion.div>
                  ))}
                </div>
              </Pin>
            </CameraStage>
          </motion.div>
        )}
        {plate === 'phone' && (
          <motion.div key="c" className="scene__plate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
            <CameraStage
              src={M.S03}
              shot={{ x: 0.52, y: 0.5, z: portrait ? 1.1 : 1.35 }}
              duration={5}
              dof={5}
              imgStyle={{ filter: portrait ? 'brightness(.5) saturate(.9) blur(8px)' : 'brightness(.42) saturate(.9) blur(12px)' }}
            >
              <Pin x={0.525} y={0.45} counter={false}>
                <span className="phone-flare" />
              </Pin>
            </CameraStage>
          </motion.div>
        )}
      </AnimatePresence>

      <Walkers kinds={['nurse', 'thobe', 'coat']} every={[5000, 9000]} />
      <Atmosphere tint={p >= 2 ? 'rafiq' : 'cool'} />
      <div className={`rafiq-light ${p >= 2 ? 'is-on' : ''}`} />
      <div className="scene__scrim" />

      <AnimatePresence>
        {p >= 4 && (
          <motion.div
            className="emerge"
            style={{ '--ps': ps } as React.CSSProperties}
            initial={{ opacity: 0, scale: 0.42, y: 60, rotateX: 18 }}
            animate={entering ? { opacity: 0, scale: 1.6, y: 0, rotateX: 0, filter: 'blur(4px)' } : { opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            transition={entering ? { duration: 0.9, ease: [0.6, 0, 0.3, 1] } : { duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <PhonePreview />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`scene__copy scene__copy--transform ${p >= 4 ? 'is-side' : ''}`}>
        <AnimatePresence>
          {p >= 3 && (
            <motion.div className="meet-mark" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }}>
              <Mark size={44} animated light />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="story-stack story-stack--flow">
          <StoryLine text={MEET} show={p >= 3} size="lg" />
          <StoryLine text={EXPLAIN} show={p >= 5} size="md" delay={0.1} />
        </div>
        <AnimatePresence>
          {p >= 5 && (
            <motion.div className="scene__actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <button className="btn btn--primary btn--xl btn--glow" onClick={enter}>
                {t(l('ادخل إلى تطبيق رفيق', 'Enter the Rafiq app'))}
                <Icon name="arrow" size={18} className="flip-rtl" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {p < 5 && (
        <button className="skip-intro" onClick={() => setP(5)}>
          {t(l('تخطَّ', 'Skip'))}
          <Icon name="skip" size={14} />
        </button>
      )}
      <div className={`flash ${entering ? 'is-on' : ''}`} />
    </section>
  );
}
