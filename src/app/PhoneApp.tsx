import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import Icon from '../components/Icon';
import { explanations, l, screenTitle, type ScreenId } from '../data/content';
import { useStore } from '../store';
import ExplainCard from './Explain';
import { PortalCtx, Sheet } from './ui';
import Welcome from './screens/Welcome';
import Dashboard from './screens/Dashboard';
import Journey from './screens/Journey';
import Queue from './screens/Queue';
import Doctor from './screens/Doctor';
import Exams from './screens/Exams';
import Results from './screens/Results';
import Meds from './screens/Meds';
import MapScreen from './screens/MapScreen';
import Discharge from './screens/Discharge';
import More from './screens/More';
import VoiceCompanion from './screens/VoiceCompanion';
import AccessSettings from './screens/AccessSettings';
import { VoicePlaybackControls } from '../voice/VoiceUI';
import { useVoice } from '../voice/VoiceProvider';
import { screenLine } from '../voice/logic';

const SCREENS: Record<ScreenId, ComponentType> = {
  welcome: Welcome,
  dashboard: Dashboard,
  journey: Journey,
  queue: Queue,
  doctor: Doctor,
  exams: Exams,
  results: Results,
  meds: Meds,
  map: MapScreen,
  discharge: Discharge,
  more: More,
  voice: VoiceCompanion,
  access: AccessSettings,
};

const TABS: { id: ScreenId; icon: string; label: ReturnType<typeof l> }[] = [
  { id: 'dashboard', icon: 'home', label: l('الرئيسية', 'Home') },
  { id: 'journey', icon: 'route', label: l('رحلتي', 'Journey') },
  { id: 'voice', icon: 'mic', label: l('رفيق', 'Rafiq') },
  { id: 'map', icon: 'map', label: l('الخريطة', 'Map') },
  { id: 'more', icon: 'more', label: l('المزيد', 'More') },
];

function StatusBar() {
  return (
    <div className="sbar" dir="ltr" aria-hidden="true">
      <span>9:41</span>
      <span className="sbar__island" />
      <span className="sbar__icons">
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11">
          <path d="M7.5 2.2c2.2 0 4.2.9 5.7 2.3l1.1-1.1A9.6 9.6 0 0 0 7.5.6 9.6 9.6 0 0 0 .7 3.4l1.1 1.1a8 8 0 0 1 5.7-2.3zm0 3.2c1.3 0 2.5.5 3.4 1.3l1.1-1.1a6.4 6.4 0 0 0-9 0l1.1 1.1c.9-.8 2.1-1.3 3.4-1.3zm0 3.2c.5 0 .9.2 1.2.5L7.5 10.3 6.3 9.1c.3-.3.7-.5 1.2-.5z" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x=".5" y=".5" width="21" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="16" height="8" rx="2" />
          <rect x="22.5" y="4" width="1.8" height="4" rx=".9" opacity=".4" />
        </svg>
      </span>
    </div>
  );
}

export default function PhoneApp({ framed, wide, preview = false }: { framed: boolean; wide: boolean; preview?: boolean }) {
  const { screen, nav, tab, presentation, explainOpen, setExplainOpen, t, lang, a11y, stage, queue, liveMsg } = useStore();
  const voice = useVoice();
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const prev = useRef(nav.length);
  const push = nav.length >= prev.current;
  useEffect(() => {
    prev.current = nav.length;
  }, [nav.length]);

  const shown: ScreenId = preview ? 'welcome' : screen;

  // optional: read each page's explanation when it opens (never sensitive details)
  const lastRead = useRef<string | null>(null);
  useEffect(() => {
    if (preview || !a11y.autoRead || shown === 'welcome') return;
    if (lastRead.current === shown) return;
    lastRead.current = shown;
    const line = screenLine(shown, { stage, ahead: queue.ahead });
    if (line) voice.speak(line);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, a11y.autoRead, preview]);
  useEffect(() => {
    if (!a11y.autoRead) lastRead.current = null;
  }, [a11y.autoRead]);
  const Comp = SCREENS[shown];
  const d = (push ? 1 : -1) * (lang === 'ar' ? -1 : 1);
  const activeTab = [...nav].reverse().find((s) => TABS.some((x) => x.id === s)) ?? 'dashboard';
  const hasExplain = !!explanations[shown];

  return (
    <PortalCtx.Provider value={portal}>
      <div className={`phone ${framed ? 'phone--framed' : 'phone--full'} ${preview ? 'phone--preview' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {framed && <StatusBar />}
        <div className="phone__viewport">
          <AnimatePresence initial={false} custom={d}>
            <motion.div
              key={shown}
              className="phone__screen"
              custom={d}
              variants={{
                enter: (dd: number) => ({ x: `${dd * 32}%`, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (dd: number) => ({ x: `${-dd * 14}%`, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            >
              <div className={`phone__scroll ${shown !== 'welcome' ? 'has-nav' : ''}`}>
                <Comp />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {shown !== 'welcome' && (
          <nav className="bnav" aria-label={t(l('التنقل الرئيسي', 'Main navigation'))}>
            {TABS.map((x) => {
              const on = activeTab === x.id;
              return (
                <button key={x.id} className={`bnav__b ${on ? 'is-on' : ''} ${x.id === 'voice' ? 'bnav__b--voice' : ''}`} onClick={() => tab(x.id)} aria-current={on ? 'page' : undefined} aria-label={x.id === 'voice' ? t(l('رفيق يتحدث معك', 'Rafiq Voice Companion')) : undefined}>
                  {on && x.id !== 'voice' && <motion.span layoutId={`bnav-pill-${framed ? 'f' : 'm'}`} className="bnav__pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  {x.id === 'voice' ? (
                    <span className="bnav__mic">
                      <Icon name="mic" size={22} stroke={2} />
                    </span>
                  ) : (
                    <Icon name={x.icon} size={21} stroke={on ? 2.1 : 1.8} />
                  )}
                  <span>{t(x.label)}</span>
                </button>
              );
            })}
          </nav>
        )}

        <AnimatePresence>
          {presentation && hasExplain && !wide && !preview && shown !== 'welcome' && voice.status === 'idle' && (
            <motion.button
              key={shown}
              className="why-chip"
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.4 }}
              onClick={() => setExplainOpen(true)}
              aria-label={`${t(l('لماذا هذه الميزة؟', 'Why this feature?'))} — ${t(screenTitle[shown])}`}
            >
              <Icon name="present" size={15} />
              {t(l('لماذا هذه الميزة؟', 'Why this feature?'))}
            </motion.button>
          )}
        </AnimatePresence>

        {!preview && shown !== 'welcome' && shown !== 'voice' && <VoicePlaybackControls />}
        {!preview && (
          <div className="sr-only" role="status" aria-live="polite">
            {liveMsg}
          </div>
        )}
        {!preview && (
          <Sheet open={explainOpen && hasExplain} onClose={() => setExplainOpen(false)} tone="dark" title={t(l('لماذا هذه الميزة؟', 'Why this feature?'))}>
            <ExplainCard screen={shown} />
          </Sheet>
        )}
        <div className="phone__portal" ref={setPortal} />
      </div>
    </PortalCtx.Provider>
  );
}
