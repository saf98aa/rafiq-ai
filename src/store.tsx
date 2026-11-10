import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STAGE, type DestId, type ExamStatus, type L, type ScreenId } from './data/content';

export type Lang = 'ar' | 'en';
export type Scene = 'intro' | 'problem' | 'transform' | 'app' | 'closing';

type Queue = { ahead: number; serving: number; mine: number };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (x: L) => string;
  dir: 'rtl' | 'ltr';

  scene: Scene;
  goScene: (s: Scene) => void;

  presentation: boolean;
  setPresentation: (v: boolean) => void;
  explainOpen: boolean;
  setExplainOpen: (v: boolean) => void;

  loggedIn: boolean;
  setLoggedIn: (v: boolean) => void;

  stage: number;
  setStage: (n: number) => void;
  queue: Queue;
  advanceQueue: () => void;
  blood: ExamStatus;
  advanceBlood: () => void;
  examStatus: (id: string) => ExamStatus | 'none';

  nav: ScreenId[];
  screen: ScreenId;
  go: (s: ScreenId) => void;
  tab: (s: ScreenId) => void;
  back: () => void;
  mapDest: DestId | null;
  openMap: (d: DestId | null) => void;

  discovered: string[];
  discover: (id: string) => void;

  focus: number | null;
  setFocus: (n: number | null) => void;

  restart: () => void;
};

const C = createContext<Ctx | null>(null);

const INITIAL_QUEUE: Queue = { ahead: 3, serving: 41, mine: 44 };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('rafiq-lang') as Lang) || 'ar';
    } catch {
      return 'ar';
    }
  });
  const [scene, setScene] = useState<Scene>('intro');
  const [presentation, setPresentationState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rafiq-presentation') !== 'off';
    } catch {
      return true;
    }
  });
  const [explainOpen, setExplainOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [stage, setStageRaw] = useState<number>(STAGE.waiting);
  const [queue, setQueue] = useState<Queue>(INITIAL_QUEUE);
  const [blood, setBlood] = useState<ExamStatus>('pending');
  const [nav, setNav] = useState<ScreenId[]>(['welcome']);
  const [mapDest, setMapDest] = useState<DestId | null>(null);
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [focus, setFocus] = useState<number | null>(null);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = lang === 'ar' ? 'رفيق | Rafiq AI — مرافقك الذكي في رحلتك الصحية' : 'Rafiq AI | رفيق — Your intelligent patient companion';
    try {
      localStorage.setItem('rafiq-lang', lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang, dir]);

  const t = useCallback((x: L) => x[lang], [lang]);

  const setPresentation = useCallback((v: boolean) => {
    setPresentationState(v);
    if (!v) setExplainOpen(false);
    try {
      localStorage.setItem('rafiq-presentation', v ? 'on' : 'off');
    } catch {
      /* ignore */
    }
  }, []);

  const setStage = useCallback((n: number) => {
    const s = Math.max(0, Math.min(STAGE.complete, n));
    setStageRaw(s);
    if (s <= STAGE.waiting) {
      setQueue(INITIAL_QUEUE);
    } else {
      setQueue((q) => ({ ...q, ahead: 0, serving: q.mine }));
    }
    if (s <= STAGE.exams) setBlood(s === STAGE.exams ? 'pending' : 'pending');
    if (s > STAGE.exams) setBlood('done');
  }, []);

  const advanceQueue = useCallback(() => {
    setQueue((q) => (q.ahead <= 0 ? q : { ...q, ahead: q.ahead - 1, serving: q.serving + 1 }));
  }, []);

  const advanceBlood = useCallback(() => {
    setBlood((b) => (b === 'pending' ? 'progress' : 'done'));
  }, []);

  const examStatus = useCallback(
    (id: string): ExamStatus | 'none' => {
      if (stage < STAGE.exams) return 'none';
      if (stage > STAGE.exams) return 'done';
      return id === 'xray' ? 'done' : blood;
    },
    [stage, blood]
  );

  const go = useCallback((s: ScreenId) => {
    setExplainOpen(false);
    setNav((n) => (n[n.length - 1] === s ? n : [...n, s]));
  }, []);
  const tab = useCallback((s: ScreenId) => {
    setExplainOpen(false);
    setNav((n) => [n[0] === 'welcome' ? 'dashboard' : n[0], ...(s === 'dashboard' ? [] : [s])].filter((x, i, a) => a.indexOf(x) === i) as ScreenId[]);
  }, []);
  const back = useCallback(() => {
    setExplainOpen(false);
    setNav((n) => (n.length > 1 ? n.slice(0, -1) : n));
  }, []);
  const openMap = useCallback(
    (d: DestId | null) => {
      setMapDest(d);
      go('map');
    },
    [go]
  );

  const discover = useCallback((id: string) => {
    setDiscovered((d) => (d.includes(id) ? d : [...d, id]));
  }, []);

  const goScene = useCallback((s: Scene) => {
    setScene(s);
    window.scrollTo(0, 0);
  }, []);

  const restart = useCallback(() => {
    setStage(STAGE.waiting);
    setBlood('pending');
    setNav(['welcome']);
    setLoggedIn(false);
    setMapDest(null);
    setDiscovered([]);
    setExplainOpen(false);
    setScene('intro');
  }, [setStage]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t,
      dir,
      scene,
      goScene,
      presentation,
      setPresentation,
      explainOpen,
      setExplainOpen,
      loggedIn,
      setLoggedIn,
      stage,
      setStage,
      queue,
      advanceQueue,
      blood,
      advanceBlood,
      examStatus,
      nav,
      screen: nav[nav.length - 1],
      go,
      tab,
      back,
      mapDest,
      openMap,
      discovered,
      discover,
      focus,
      setFocus,
      restart,
    }),
    [lang, t, dir, scene, goScene, presentation, setPresentation, explainOpen, loggedIn, stage, setStage, queue, advanceQueue, blood, advanceBlood, examStatus, nav, go, tab, back, mapDest, openMap, discovered, discover, focus, restart]
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useStore() {
  const c = useContext(C);
  if (!c) throw new Error('useStore outside provider');
  return c;
}
