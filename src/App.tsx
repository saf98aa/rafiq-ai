import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import Icon from './components/Icon';
import Logo, { Mark } from './components/Logo';
import { l } from './data/content';
import { useStore, type Scene } from './store';
import SceneIntro from './scenes/SceneIntro';
import SceneProblem from './scenes/SceneProblem';
import SceneTransform from './scenes/SceneTransform';
import SceneClosing from './scenes/SceneClosing';
import AppStage from './app/AppStage';
import { useMedia } from './scenes/shared';

const CHAPTERS: { id: Scene; label: ReturnType<typeof l> }[] = [
  { id: 'intro', label: l('الوصول', 'Arrival') },
  { id: 'problem', label: l('التحدي', 'Challenge') },
  { id: 'transform', label: l('رفيق', 'Rafiq') },
  { id: 'app', label: l('التطبيق', 'The app') },
  { id: 'closing', label: l('الختام', 'Closing') },
];

function TopBar() {
  const { t, scene, goScene, lang, setLang } = useStore();
  const idx = CHAPTERS.findIndex((c) => c.id === scene);
  const small = useMedia('(max-width: 640px)');
  return (
    <header className={`topbar topbar--${scene}`}>
      <button className="topbar__logo" onClick={() => goScene('intro')} aria-label="Rafiq AI">
        {small ? <Mark size={28} light /> : <Logo light />}
      </button>
      <nav className="chapters" aria-label={t(l('فصول التجربة', 'Experience chapters'))}>
        {CHAPTERS.map((c, i) => (
          <button key={c.id} className={`chapter ${i === idx ? 'is-on' : ''} ${i < idx ? 'is-past' : ''}`} onClick={() => goScene(c.id)} aria-current={i === idx ? 'step' : undefined}>
            <i>{i < idx ? <Icon name="check" size={10} stroke={3} /> : i + 1}</i>
            <span>{t(c.label)}</span>
          </button>
        ))}
      </nav>
      <div className="topbar__end">
        <button className="langbtn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>
          <Icon name="globe" size={16} />
          <span lang={lang === 'ar' ? 'en' : 'ar'}>{lang === 'ar' ? 'EN' : 'ع'}</span>
        </button>
        {scene !== 'app' && scene !== 'closing' && (
          <button className="tobtn" onClick={() => goScene('app')}>
            <Icon name="phone" size={16} />
            <span>{t(l('جرّب التطبيق', 'Try the app'))}</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default function App() {
  const { scene, goScene } = useStore();
  const fullApp = useMedia('(max-width: 599px), (max-height: 599px)');
  const hideTop = scene === 'app' && fullApp;

  // keyboard: arrows move between story chapters (not while inside the app)
  useEffect(() => {
    const order: Scene[] = ['intro', 'problem', 'transform', 'app', 'closing'];
    const f = (e: KeyboardEvent) => {
      if (scene === 'app') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const i = order.indexOf(scene);
      const rtl = document.documentElement.dir === 'rtl';
      if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') && i < order.length - 1) goScene(order[i + 1]);
      if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') && i > 0) goScene(order[i - 1]);
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [scene, goScene]);

  return (
    <div className={`experience is-${scene}`}>
      {!hideTop && <TopBar />}
      <AnimatePresence>
        <motion.main
          key={scene}
          className="stage"
          initial={{ opacity: 0, scale: 1.04, filter: 'blur(14px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        >
          {scene === 'intro' && <SceneIntro />}
          {scene === 'problem' && <SceneProblem />}
          {scene === 'transform' && <SceneTransform />}
          {scene === 'app' && <AppStage />}
          {scene === 'closing' && <SceneClosing />}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
