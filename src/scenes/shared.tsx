import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { useStore } from '../store';
import type { L } from '../data/content';

export const M = {
  S01: './media/S01_Emergency.webp',
  S02: './media/S02_Waiting.webp',
  S03: './media/S03_Rafiq_Introduction.webp',
  S04: './media/S04_Visit_Registration.webp',
  S05: './media/S05_Nursing_Assessment.webp',
  S06: './media/S06_Doctor_And_Tests.webp',
  S07: './media/S07_Hospital_Navigation.webp',
  S09: './media/S09_Return_Home.webp',
  S10: './media/S10_AI_Pharmacist.webp',
};

/** Fires an increasing phase counter at the given millisecond marks. */
export function useTimeline(marks: number[]) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const ids = marks.map((ms, i) => window.setTimeout(() => setP((v) => Math.max(v, i + 1)), ms));
    return () => ids.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [p, setP] as const;
}

export function useIsPortrait() {
  const q = '(max-aspect-ratio: 1/1)';
  const [v, setV] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setV(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return v;
}

export function useMedia(q: string) {
  const [v, setV] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setV(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, [q]);
  return v;
}

/** Headline in the active language with the other language as a quiet subtitle. */
export function StoryLine({ text, show, size = 'xl', delay = 0 }: { text: L; show: boolean; size?: 'xl' | 'lg' | 'md'; delay?: number }) {
  const { lang } = useStore();
  const other = lang === 'ar' ? 'en' : 'ar';
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`story-line story-line--${size}`}
          initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.1, 1], delay }}
        >
          <p className="story-line__main" lang={lang}>
            {text[lang]}
          </p>
          <p className="story-line__sub" lang={other} dir={other === 'ar' ? 'rtl' : 'ltr'}>
            {text[other]}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Bubble({ children, show, tone = 'q', className = '' }: { children: ReactNode; show: boolean; tone?: 'q' | 'say' | 'calm'; className?: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`bubble bubble--${tone} ${className}`}
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -14, filter: 'blur(6px)' }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Cycles through items on an interval. */
export function useCycle(n: number, ms: number, run = true) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!run) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % n), ms);
    return () => window.clearInterval(id);
  }, [n, ms, run]);
  return i;
}
