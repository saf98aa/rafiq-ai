import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import CameraStage, { Pin } from '../components/CameraStage';
import { Atmosphere, Walkers } from '../components/Ambience';
import Icon from '../components/Icon';
import { l } from '../data/content';
import { useStore } from '../store';
import { M, StoryLine, useIsPortrait, useTimeline } from './shared';

const LINE1 = l('كل زيارة للمستشفى تبدأ برحلة.', 'Every hospital visit begins with a journey.');
const LINE2 = l('لكن ماذا يحدث عندما لا تعرف ما هي خطوتك التالية؟', "But what happens when you don't know what comes next?");

export default function SceneIntro() {
  const { t, goScene } = useStore();
  const portrait = useIsPortrait();
  // 1: line one · 2: camera dollies in · 3: cut inside · 4: line two · 5: call to action
  const [p, setP] = useTimeline([500, 900, 6400, 7300, 8900]);
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    if (p >= 2) setMoved(true);
  }, [p]);

  const exterior = moved
    ? { x: portrait ? 0.66 : 0.68, y: 0.72, z: portrait ? 1.35 : 1.55 }
    : { x: portrait ? 0.5 : 0.5, y: 0.45, z: 1 };
  const interior = p >= 4 ? { x: 0.46, y: 0.42, z: portrait ? 1.05 : 1.28 } : { x: 0.86, y: 0.5, z: portrait ? 1.0 : 1.12 };

  const skip = () => setP(5);

  return (
    <section className="scene scene--intro" aria-label={t(l('المشهد الأول: الوصول إلى المستشفى', 'Scene 1: Entering the hospital'))}>
      <AnimatePresence>
        {p < 3 ? (
          <motion.div key="ext" className="scene__plate" exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }} transition={{ duration: 1.4 }}>
            <CameraStage src={M.S01} shot={exterior} duration={7.5} dof={2}>
              <Pin x={0.247} y={0.545} counter={false}>
                <span className="siren" />
              </Pin>
              <Pin x={0.66} y={0.68} counter={false}>
                <span className="door-glow" />
              </Pin>
            </CameraStage>
          </motion.div>
        ) : (
          <motion.div
            key="int"
            className="scene__plate"
            initial={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.6 }}
          >
            <CameraStage src={M.S02} shot={interior} duration={6.5} dof={3} />
          </motion.div>
        )}
      </AnimatePresence>

      <Walkers kinds={p < 3 ? ['thobe', 'abaya', 'thobe', 'coat'] : ['nurse', 'thobe', 'coat', 'abaya']} />
      <Atmosphere tint={p < 3 ? 'warm' : 'cool'} />
      <div className="scene__scrim" />

      <div className="scene__copy">
        <motion.div className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: p >= 1 ? 1 : 0 }} transition={{ duration: 1 }}>
          <span className="eyebrow__dot" />
          {p < 3 ? t(l('08:40 — المدخل الرئيسي', '08:40 — Main entrance')) : t(l('09:12 — صالة الانتظار', '09:12 — Waiting hall'))}
        </motion.div>
        <div className="story-stack">
          <StoryLine text={LINE1} show={p >= 1 && p < 4} />
          <StoryLine text={LINE2} show={p >= 4} />
        </div>
        <AnimatePresence>
          {p >= 5 && (
            <motion.div className="scene__actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <button className="btn btn--primary btn--xl btn--glow" onClick={() => goScene('problem')}>
                <Icon name="play" size={18} />
                {t(l('ابدأ التجربة', 'Experience the journey'))}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {p < 5 && (
        <button className="skip-intro" onClick={skip}>
          {t(l('تخطَّ المقدمة', 'Skip intro'))}
          <Icon name="skip" size={14} />
        </button>
      )}
    </section>
  );
}
