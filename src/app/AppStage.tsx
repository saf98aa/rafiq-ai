import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Atmosphere } from '../components/Ambience';
import Icon from '../components/Icon';
import { explanations, l, screenTitle, type ScreenId } from '../data/content';
import { useStore } from '../store';
import { useMedia } from '../scenes/shared';
import ExplainCard from './Explain';
import PhoneApp from './PhoneApp';
import { StageSim, Toggle } from './screens/More';

const QUICK: ScreenId[] = ['dashboard', 'journey', 'voice', 'queue', 'doctor', 'exams', 'results', 'meds', 'map', 'discharge', 'access'];

function useDeviceScale(reserve: number) {
  const calc = () => Math.min(1, Math.max(0.55, (window.innerHeight - reserve) / 868));
  const [s, setS] = useState(calc);
  useEffect(() => {
    const f = () => setS(calc());
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reserve]);
  return s;
}

export function Device({ wide, reserve = 96 }: { wide: boolean; reserve?: number }) {
  const s = useDeviceScale(reserve);
  return (
    <motion.div
      className="device-slot"
      style={{ width: 414 * s, height: 868 * s }}
      initial={{ opacity: 0, scale: 1.15, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="device" style={{ transform: `scale(${s})` }}>
        <div className="device__body">
          <PhoneApp framed wide={wide} />
        </div>
        <span className="device__btn device__btn--a" />
        <span className="device__btn device__btn--b" />
        <span className="device__btn device__btn--c" />
      </div>
    </motion.div>
  );
}

export default function AppStage() {
  const { t, screen, presentation, setPresentation, go, goScene, loggedIn, tab, setLoggedIn } = useStore();
  const wide = useMedia('(min-width: 1000px) and (min-height: 600px)');
  const framed = useMedia('(min-width: 600px) and (min-height: 600px)');
  const hasExplain = !!explanations[screen];

  const jump = (s: ScreenId) => {
    if (!loggedIn) {
      setLoggedIn(true);
      tab('dashboard');
      if (s !== 'dashboard') window.setTimeout(() => go(s), 50);
      return;
    }
    if (s === 'dashboard') tab('dashboard');
    else go(s);
  };

  return (
    <section className={`scene scene--app ${framed ? 'is-framed' : 'is-full'}`} aria-label={t(l('تطبيق رفيق', 'The Rafiq app'))}>
      {framed && (
        <>
          <div className="appbg" aria-hidden="true">
            <img src="./media/hospital/emergency.webp" alt="" />
          </div>
          <Atmosphere tint="rafiq" sweep={false} motes={14} />
        </>
      )}

      {!framed && <PhoneApp framed={false} wide={false} />}

      {framed && !wide && (
        <div className="appmid">
          <Device wide={false} reserve={110} />
        </div>
      )}

      {framed && wide && (
        <div className="appwide">
          <motion.aside className="panel" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <div className="panel__head">
              <span className="panel__eyebrow">{t(l('الفصل الرابع — التطبيق', 'Chapter 4 — The app'))}</span>
              <h2>{t(l('عِش رحلة محمد داخل رفيق', "Live Mohammed's journey inside Rafiq"))}</h2>
              <p>{t(l('تنقّل في التطبيق كما يفعل المريض. كل زر يعمل، وكل البيانات تجريبية.', 'Navigate the app as the patient would. Every control works; all data is fictional.'))}</p>
            </div>

            <div className="panel__row">
              <span>
                <Icon name="present" size={17} />
                {t(l('وضع العرض', 'Presentation mode'))}
              </span>
              <Toggle on={presentation} onChange={setPresentation} label={t(l('وضع العرض', 'Presentation mode'))} />
            </div>

            <div className="panel__explain">
              {presentation && hasExplain ? (
                <ExplainCard screen={screen} compact />
              ) : (
                <div className="panel__placeholder">
                  <Icon name="present" size={22} />
                  <p>
                    {presentation
                      ? t(l('اختر شاشة لعرض سبب تصميمها.', 'Open a screen to see why it was designed.'))
                      : t(l('فعّل وضع العرض لمعرفة المشكلة وقرار التصميم والقيمة لكل شاشة.', 'Turn on presentation mode to see the problem, design decision and value behind each screen.'))}
                  </p>
                </div>
              )}
            </div>

            <div className="panel__block">
              <h4>{t(l('محاكاة الرحلة', 'Journey simulator'))}</h4>
              <StageSim compact />
            </div>

            <div className="panel__block">
              <h4>{t(l('انتقال سريع', 'Jump to'))}</h4>
              <div className="quick">
                {QUICK.map((s) => (
                  <button key={s} className={screen === s ? 'is-on' : ''} onClick={() => jump(s)}>
                    {t(screenTitle[s])}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel__foot">
              <button className="btn btn--glass btn--sm" onClick={() => goScene('story', 3)}>
                <Icon name="arrowBack" size={15} className="flip-rtl" />
                {t(l('العودة إلى القصة', 'Back to the story'))}
              </button>
              <button className="btn btn--glass btn--sm" onClick={() => goScene('closing')}>
                {t(l('الختام', 'Closing'))}
                <Icon name="arrow" size={15} className="flip-rtl" />
              </button>
            </div>
          </motion.aside>
          <Device wide reserve={96} />
        </div>
      )}
    </section>
  );
}
