import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { L } from '../data/content';
import linesJson from '../data/voice-lines.json';
import manifestJson from '../data/voice-manifest.json';

/**
 * Rafiq's voice engine.
 * - Plays pre-recorded Saudi-Arabic / English lines (ElevenLabs, recorded offline — no API key on the website).
 * - Falls back to the browser's speech synthesis when a line has no recording, or the recording cannot play.
 * - One voice at a time, with play / pause / resume / stop / replay, speed and voice-language selection.
 */
export const lines = linesJson as Record<string, L>;
const manifest = manifestJson as Record<string, { ar?: string; en?: string }>;

export type VoiceLang = 'ar' | 'en';
export type Utterance = string | { text: L; id?: string };
type Item = { key: string; text: L; file?: Record<VoiceLang, boolean> };
export type VoiceStatus = 'idle' | 'playing' | 'paused';
export const RATES = [0.8, 1, 1.2] as const;

type Ctx = {
  status: VoiceStatus;
  current: Item | null;
  playlistKey: string | null;
  caption: string;
  rate: number;
  setRate: (r: number) => void;
  voiceLang: VoiceLang;
  setVoiceLang: (l: VoiceLang) => void;
  engine: 'recorded' | 'browser' | null;
  speak: (u: Utterance | Utterance[], key?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  replay: () => void;
  isPlaying: (key: string) => boolean;
  supported: boolean;
};

const C = createContext<Ctx | null>(null);

const toItem = (u: Utterance): Item | null => {
  if (typeof u === 'string') {
    const text = lines[u];
    if (!text) return null;
    const m = manifest[u];
    return { key: u, text, file: { ar: !!m?.ar, en: !!m?.en } };
  }
  return { key: u.id ?? u.text.ar, text: u.text };
};

function pickBrowserVoice(lang: VoiceLang) {
  const vs = window.speechSynthesis?.getVoices?.() ?? [];
  if (lang === 'ar') return vs.find((v) => /ar[-_]SA/i.test(v.lang)) ?? vs.find((v) => /^ar/i.test(v.lang)) ?? null;
  return vs.find((v) => /en[-_](US|GB)/i.test(v.lang)) ?? vs.find((v) => /^en/i.test(v.lang)) ?? null;
}

export function VoiceProvider({ uiLang, children }: { uiLang: VoiceLang; children: ReactNode }) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [queue, setQueue] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [playlistKey, setPlaylistKey] = useState<string | null>(null);
  const [rate, setRateState] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('rafiq-voice-rate')) || 1;
    } catch {
      return 1;
    }
  });
  const [voiceLang, setVoiceLangState] = useState<VoiceLang>(uiLang);
  const [engine, setEngine] = useState<Ctx['engine']>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const token = useRef(0);
  const last = useRef<{ list: Item[]; key: string | null } | null>(null);
  const supported = typeof window !== 'undefined' && ('speechSynthesis' in window || typeof Audio !== 'undefined');

  // voice language follows the interface language unless the listener picks one
  const userPicked = useRef(false);
  useEffect(() => {
    if (!userPicked.current) setVoiceLangState(uiLang);
  }, [uiLang]);

  const hardStop = useCallback(() => {
    token.current++;
    const a = audio.current;
    if (a) {
      a.onended = null;
      a.onerror = null;
      a.pause();
      a.removeAttribute('src');
      a.load();
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }, []);

  const playItem = useCallback(
    (list: Item[], i: number) => {
      hardStop();
      const item = list[i];
      if (!item) {
        setStatus('idle');
        setEngine(null);
        return;
      }
      const my = token.current;
      setIdx(i);
      setStatus('playing');
      const lang = voiceLang;
      const next = () => {
        if (token.current !== my) return;
        if (i + 1 < list.length) playItem(list, i + 1);
        else {
          setStatus('idle');
          setEngine(null);
        }
      };
      const viaBrowser = () => {
        if (token.current !== my) return;
        const synth = window.speechSynthesis;
        if (!synth) {
          next();
          return;
        }
        setEngine('browser');
        const u = new SpeechSynthesisUtterance(item.text[lang]);
        u.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
        const v = pickBrowserVoice(lang);
        if (v) u.voice = v;
        u.rate = rate;
        u.onend = next;
        u.onerror = next;
        synth.speak(u);
      };
      if (item.file?.[lang]) {
        if (!audio.current) audio.current = new Audio();
        const a = audio.current;
        a.src = `./voice/${item.key}.${lang}.mp3`;
        a.playbackRate = rate;
        (a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
        a.onended = next;
        a.onerror = viaBrowser;
        setEngine('recorded');
        a.play().catch(viaBrowser);
      } else viaBrowser();
    },
    [hardStop, rate, voiceLang]
  );

  const speak = useCallback(
    (u: Utterance | Utterance[], key?: string) => {
      const list = (Array.isArray(u) ? u : [u]).map(toItem).filter(Boolean) as Item[];
      if (!list.length) return;
      const k = key ?? list[0].key;
      last.current = { list, key: k };
      setQueue(list);
      setPlaylistKey(k);
      playItem(list, 0);
    },
    [playItem]
  );

  const pause = useCallback(() => {
    if (status !== 'playing') return;
    if (engine === 'recorded') audio.current?.pause();
    else window.speechSynthesis?.pause();
    setStatus('paused');
  }, [status, engine]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    if (engine === 'recorded') audio.current?.play().catch(() => undefined);
    else window.speechSynthesis?.resume();
    setStatus('playing');
  }, [status, engine]);

  const stop = useCallback(() => {
    hardStop();
    setStatus('idle');
    setEngine(null);
    setPlaylistKey(null);
  }, [hardStop]);

  const replay = useCallback(() => {
    if (!last.current) return;
    setQueue(last.current.list);
    setPlaylistKey(last.current.key);
    playItem(last.current.list, 0);
  }, [playItem]);

  const setRate = useCallback((r: number) => {
    setRateState(r);
    if (audio.current) audio.current.playbackRate = r;
    try {
      localStorage.setItem('rafiq-voice-rate', String(r));
    } catch {
      /* ignore */
    }
  }, []);

  const setVoiceLang = useCallback(
    (l: VoiceLang) => {
      userPicked.current = true;
      setVoiceLangState(l);
      hardStop();
      setStatus('idle');
      setEngine(null);
    },
    [hardStop]
  );

  // stop speaking when the page is hidden or unmounted
  useEffect(() => {
    const f = () => {
      if (document.hidden) {
        audio.current?.pause();
        try {
          window.speechSynthesis?.cancel();
        } catch {
          /* ignore */
        }
        setStatus((s) => (s === 'playing' ? 'idle' : s));
      }
    };
    document.addEventListener('visibilitychange', f);
    return () => {
      document.removeEventListener('visibilitychange', f);
      hardStop();
    };
  }, [hardStop]);

  // warm up browser voices list (async in Chrome)
  useEffect(() => {
    try {
      window.speechSynthesis?.getVoices();
    } catch {
      /* ignore */
    }
  }, []);

  const current = status === 'idle' ? null : queue[idx] ?? null;
  const caption = current ? current.text[voiceLang] : '';
  const isPlaying = useCallback((key: string) => status !== 'idle' && playlistKey === key, [status, playlistKey]);

  const value = useMemo<Ctx>(
    () => ({ status, current, playlistKey, caption, rate, setRate, voiceLang, setVoiceLang, engine, speak, pause, resume, stop, replay, isPlaying, supported }),
    [status, current, playlistKey, caption, rate, setRate, voiceLang, setVoiceLang, engine, speak, pause, resume, stop, replay, isPlaying, supported]
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useVoice() {
  const c = useContext(C);
  if (!c) throw new Error('useVoice outside provider');
  return c;
}
