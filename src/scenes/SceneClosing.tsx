import { motion } from 'framer-motion';
import CameraStage from '../components/CameraStage';
import { Atmosphere } from '../components/Ambience';
import Icon from '../components/Icon';
import { Mark } from '../components/Logo';
import { l, stages } from '../data/content';
import { useStore } from '../store';
import { M, StoryLine, useIsPortrait, useTimeline } from './shared';

const HEAD = l('أكثر من مجرد تطبيق. رفيق يرافقك في رحلتك الصحية.', 'More than an app. A companion throughout the healthcare journey.');
const SUB = l('يحوّل رفيق تجربة المريض من خطوات متفرقة إلى رحلة أكثر وضوحًا وترابطًا.', 'Rafiq transforms fragmented hospital experiences into a clearer, more connected patient journey.');

const PILLARS = [
  { icon: 'route', t: l('وضوح', 'Clarity'), d: l('الخطوة التالية دائمًا أمامك', 'Your next step, always in view') },
  { icon: 'clock', t: l('شفافية', 'Transparency'), d: l('انتظار مفهوم وحالة معروفة', 'Understandable waits, known status') },
  { icon: 'shield', t: l('طمأنينة', 'Reassurance'), d: l('معلومات معتمدة من فريق الرعاية', 'Information approved by the care team') },
];

export default function SceneClosing() {
  const { t, restart, goScene } = useStore();
  const portrait = useIsPortrait();
  const [p] = useTimeline([300, 1400, 2400]);

  return (
    <section className="scene scene--closing" aria-label={t(l('الختام', 'Closing'))}>
      <div className="scene__plate">
        <CameraStage src={M.S10} shot={{ x: portrait ? 0.4 : 0.42, y: 0.4, z: portrait ? 1 : 1.12 }} duration={10} dof={4} imgStyle={{ filter: 'brightness(.62) saturate(.95)' }} />
      </div>
      <Atmosphere tint="rafiq" motes={24} />
      <div className="scene__scrim scene__scrim--closing" />

      <div className="closing">
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
          <Mark size={56} animated light />
        </motion.div>
        <StoryLine text={HEAD} show={p >= 1} size="lg" />
        <StoryLine text={SUB} show={p >= 2} size="md" />

        <motion.ol className="recap" initial="h" animate={p >= 2 ? 'v' : 'h'} variants={{ v: { transition: { staggerChildren: 0.12 } } }}>
          {stages.map((s, i) => (
            <motion.li key={s.id} variants={{ h: { opacity: 0, y: 10 }, v: { opacity: 1, y: 0 } }}>
              <span className="recap__ic">
                <Icon name={s.icon} size={16} />
              </span>
              <small>{t(s.title)}</small>
              {i < stages.length - 1 && <i className="recap__line" />}
            </motion.li>
          ))}
        </motion.ol>

        <motion.div className="pillars" initial={{ opacity: 0, y: 14 }} animate={p >= 3 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          {PILLARS.map((x) => (
            <div key={x.icon} className="pillar">
              <Icon name={x.icon} size={20} />
              <b>{t(x.t)}</b>
              <span>{t(x.d)}</span>
            </div>
          ))}
        </motion.div>

        <motion.div className="scene__actions closing__actions" initial={{ opacity: 0 }} animate={p >= 3 ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}>
          <button className="btn btn--primary btn--xl btn--glow" onClick={restart}>
            <Icon name="replay" size={18} />
            {t(l('استكشف رفيق من جديد', 'Explore Rafiq Again'))}
          </button>
          <button className="btn btn--glass" onClick={() => goScene('app')}>
            <Icon name="phone" size={18} />
            {t(l('العودة إلى التطبيق', 'Back to the app'))}
          </button>
        </motion.div>
        <p className="closing__note">
          {t(
            l(
              'نموذج أولي لأغراض العرض. جميع البيانات تجريبية، ولا يوجد ربط فعلي بأنظمة المستشفيات أو بنفاذ.',
              'Prototype for demonstration. All data is fictional; there is no real connection to hospital systems or Nafath.'
            )
          )}
        </p>
      </div>
    </section>
  );
}
