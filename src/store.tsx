import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STAGE, type DestId, type ExamStatus, type L, type ScreenId } from './data/content';
import type { CatId, Req } from './data/inpatient';

export type Lang = 'ar' | 'en';
export type Scene = 'story' | 'app' | 'closing';
export type Role = 'patient' | 'companion';
export type TextSize = 'standard' | 'large' | 'xl';
export type Display = 'standard' | 'contrast' | 'dark';
export type A11y = {
  voiceGuide: boolean; // when voice assistance is on: Rafiq speaks in response to your actions (e.g. route directions)
  autoRead: boolean; // when voice assistance is on: read each page's explanation automatically when it opens
  textSize: TextSize; // standard / large / extra-large text
  display: Display; // standard brand look / high contrast / dark (night) mode
  simple: boolean;
  motion: boolean; // reduce motion
  labels: boolean; // show text labels on icon-only buttons
  announce: boolean; // screen-reader live announcements
};
export const A11Y_DEFAULT: A11y = { voiceGuide: true, autoRead: false, textSize: 'standard', display: 'standard', simple: false, motion: false, labels: false, announce: true };

type Queue = { ahead: number; serving: number; mine: number };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (x: L) => string;
  dir: 'rtl' | 'ltr';

  scene: Scene;
  goScene: (s: Scene, storyAt?: number) => void;
  storyIdx: number;
  setStoryIdx: (n: number) => void;

  role: Role;
  setRole: (r: Role) => void;
  a11y: A11y;
  setA11y: (patch: Partial<A11y>) => void;
  announce: (msg: string) => void;
  liveMsg: string;

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

  // Inpatient requests (simulated)
  admitted: boolean;
  setAdmitted: (v: boolean) => void;
  requests: Req[];
  submitRequest: (item: string) => number;
  advanceRequest: (id: number) => void;
  inpatientCat: CatId | null;
  openInpatient: (cat: CatId | null) => void;

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
  const [scene, setScene] = useState<Scene>('story');
  const [storyIdx, setStoryIdx] = useState(0);
  const [role, setRole] = useState<Role>('patient');
  const [liveMsg, setLiveMsg] = useState('');
  const [a11y, setA11yState] = useState<A11y>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rafiq-a11y') || '{}');
      // migrate the earlier on/off switches to the new text-size and display options
      if (saved.textSize === undefined && saved.large) saved.textSize = 'large';
      if (saved.display === undefined && saved.contrast) saved.display = 'contrast';
      delete saved.large;
      delete saved.contrast;
      const a = { ...A11Y_DEFAULT, ...saved } as A11y;
      if (!['standard', 'large', 'xl'].includes(a.textSize)) a.textSize = 'standard';
      if (!['standard', 'contrast', 'dark'].includes(a.display)) a.display = 'standard';
      return a;
    } catch {
      return A11Y_DEFAULT;
    }
  });
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
  const [admitted, setAdmitted] = useState(false);
  const [requests, setRequests] = useState<Req[]>([]);
  const [inpatientCat, setInpatientCat] = useState<CatId | null>(null);

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

  const setA11y = useCallback((patch: Partial<A11y>) => {
    setA11yState((a) => {
      const n = { ...a, ...patch };
      try {
        localStorage.setItem('rafiq-a11y', JSON.stringify(n));
      } catch {
        /* ignore */
      }
      return n;
    });
  }, []);
  useEffect(() => {
    const c = document.documentElement.classList;
    c.toggle('a11y-large', a11y.textSize === 'large');
    c.toggle('a11y-xl', a11y.textSize === 'xl');
    c.toggle('a11y-contrast', a11y.display === 'contrast');
    c.toggle('a11y-dark', a11y.display === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', a11y.display === 'dark' ? '#140a24' : a11y.display === 'contrast' ? '#000000' : '#4B1D7A');
    c.toggle('a11y-simple', a11y.simple);
    c.toggle('a11y-motion', a11y.motion);
    c.toggle('a11y-labels', a11y.labels);
  }, [a11y]);
  const announce = useCallback(
    (msg: string) => {
      if (!a11y.announce) return;
      setLiveMsg('');
      window.setTimeout(() => setLiveMsg(msg), 60);
    },
    [a11y.announce]
  );

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
    if (s === 'inpatient') setInpatientCat(null);
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

  const submitRequest = useCallback((item: string) => {
    const id = Date.now();
    const at = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setRequests((r) => [{ id, item, status: 0, at }, ...r]);
    return id;
  }, []);
  const advanceRequest = useCallback((id: number) => {
    setRequests((r) => r.map((x) => (x.id === id ? { ...x, status: Math.min(3, x.status + 1) } : x)));
  }, []);
  const openInpatient = useCallback(
    (cat: CatId | null) => {
      go('inpatient');
      setInpatientCat(cat);
    },
    [go]
  );

  const discover = useCallback((id: string) => {
    setDiscovered((d) => (d.includes(id) ? d : [...d, id]));
  }, []);

  const goScene = useCallback((s: Scene, storyAt?: number) => {
    setScene(s);
    if (storyAt !== undefined) setStoryIdx(storyAt);
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
    setRole('patient');
    setAdmitted(false);
    setRequests([]);
    setInpatientCat(null);
    setStoryIdx(0);
    setScene('story');
  }, [setStage]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t,
      dir,
      scene,
      goScene,
      storyIdx,
      setStoryIdx,
      role,
      setRole,
      a11y,
      setA11y,
      announce,
      liveMsg,
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
      admitted,
      setAdmitted,
      requests,
      submitRequest,
      advanceRequest,
      inpatientCat,
      openInpatient,
      focus,
      setFocus,
      restart,
    }),
    [lang, t, dir, scene, goScene, storyIdx, role, a11y, setA11y, announce, liveMsg, presentation, setPresentation, explainOpen, loggedIn, stage, setStage, queue, advanceQueue, blood, advanceBlood, examStatus, nav, go, tab, back, mapDest, openMap, discovered, discover, admitted, requests, submitRequest, advanceRequest, inpatientCat, openInpatient, focus, restart]
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useStore() {
  const c = useContext(C);
  if (!c) throw new Error('useStore outside provider');
  return c;
}
