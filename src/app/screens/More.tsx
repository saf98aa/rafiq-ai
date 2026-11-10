import { motion } from 'framer-motion';
import Icon from '../../components/Icon';
import { l, patient, screenTitle, STAGE, stages, type ScreenId } from '../../data/content';
import { useStore } from '../../store';
import { Avatar, Header, Section, rise, stagger } from '../ui';

const ALL: { id: ScreenId; icon: string }[] = [
  { id: 'dashboard', icon: 'home' },
  { id: 'journey', icon: 'route' },
  { id: 'queue', icon: 'clock' },
  { id: 'doctor', icon: 'stethoscope' },
  { id: 'exams', icon: 'flask' },
  { id: 'results', icon: 'file' },
  { id: 'meds', icon: 'pill' },
  { id: 'map', icon: 'map' },
  { id: 'discharge', icon: 'flag' },
];

export function LangSwitch() {
  const { lang, setLang } = useStore();
  return (
    <div className="seg" role="radiogroup" aria-label="Language">
      <button role="radio" aria-checked={lang === 'ar'} className={lang === 'ar' ? 'is-on' : ''} onClick={() => setLang('ar')}>
        العربية
      </button>
      <button role="radio" aria-checked={lang === 'en'} className={lang === 'en' ? 'is-on' : ''} onClick={() => setLang('en')}>
        English
      </button>
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} className={`toggle ${on ? 'is-on' : ''}`} onClick={() => onChange(!on)}>
      <motion.i layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </button>
  );
}

export function StageSim({ compact = false }: { compact?: boolean }) {
  const { t, stage, setStage } = useStore();
  return (
    <div className={`sim ${compact ? 'sim--compact' : ''}`}>
      <div className="sim__row">
        <button className="sim__btn" onClick={() => setStage(stage - 1)} disabled={stage <= 0} aria-label={t(l('المرحلة السابقة', 'Previous stage'))}>
          <Icon name="chevron" size={18} className="flip-ltr" />
        </button>
        <div className="sim__now">
          <small>{t(l('مرحلة المحاكاة', 'Simulated stage'))}</small>
          <b>{stage >= STAGE.complete ? t(l('اكتملت الرحلة', 'Journey complete')) : t(stages[stage].title)}</b>
        </div>
        <button className="sim__btn" onClick={() => setStage(stage + 1)} disabled={stage >= STAGE.complete} aria-label={t(l('المرحلة التالية', 'Next stage'))}>
          <Icon name="chevron" size={18} className="flip-rtl" />
        </button>
      </div>
      <div className="sim__dots">
        {stages.map((s, i) => (
          <button key={s.id} className={i < stage ? 'is-done' : i === stage ? 'is-now' : ''} onClick={() => setStage(i)} aria-label={t(s.title)} title={t(s.title)} />
        ))}
      </div>
    </div>
  );
}

export default function More() {
  const { t, go, presentation, setPresentation, restart, goScene } = useStore();
  return (
    <motion.div className="screen" variants={stagger} initial="hidden" animate="show">
      <Header title={l('المزيد', 'More')} back={false} />
      <motion.div className="profile" variants={rise}>
        <Avatar src={patient.avatar} size={52} ring />
        <div>
          <b>{t(patient.name)}</b>
          <small dir="ltr">{patient.visit}</small>
        </div>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('كل الشاشات', 'All screens')}>
          <div className="grid9">
            {ALL.map((s) => (
              <button key={s.id} onClick={() => go(s.id)}>
                <Icon name={s.icon} size={20} />
                <span>{t(screenTitle[s.id])}</span>
              </button>
            ))}
          </div>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('الإعدادات', 'Settings')}>
          <div className="settings">
            <div className="setting">
              <Icon name="globe" size={19} />
              <span>{t(l('اللغة', 'Language'))}</span>
              <LangSwitch />
            </div>
            <div className="setting">
              <Icon name="present" size={19} />
              <span>
                {t(l('وضع العرض', 'Presentation mode'))}
                <small>{t(l('يُظهر زر "لماذا هذه الميزة؟"', 'Shows the "Why this feature?" button'))}</small>
              </span>
              <Toggle on={presentation} onChange={setPresentation} label={t(l('وضع العرض', 'Presentation mode'))} />
            </div>
          </div>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('محاكاة الرحلة', 'Journey simulator')}>
          <StageSim />
        </Section>
      </motion.div>

      <motion.div className="screen__pad stack" variants={rise}>
        <button className="btn btn--soft btn--block" onClick={restart}>
          <Icon name="replay" size={17} />
          {t(l('مشاهدة القصة من البداية', 'Watch the story from the start'))}
        </button>
        <button className="btn btn--soft btn--block" onClick={() => goScene('closing')}>
          <Icon name="sparkle" size={17} />
          {t(l('الانتقال إلى الختام', 'Go to the closing'))}
        </button>
        <p className="fine center">{t(l('نموذج أولي — جميع البيانات تجريبية ولا يوجد ربط فعلي بأنظمة المستشفى أو بنفاذ.', 'Prototype — all data is fictional; no real hospital-system or Nafath connection.'))}</p>
      </motion.div>
    </motion.div>
  );
}
