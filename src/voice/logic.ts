import { l, STAGE, type L, type ScreenId } from '../data/content';
import type { DestId } from '../data/blueprint';

type JourneyState = { stage: number; ahead: number };

/** The spoken explanation for a screen, chosen from the current (demo) journey state. */
export function screenLine(screen: ScreenId, s: JourneyState): string | null {
  if (screen === 'results') return s.stage >= STAGE.results ? 'screen.results.ready' : s.stage === STAGE.exams ? 'screen.results.pending' : 'screen.results.none';
  const id = `screen.${screen}`;
  return id;
}

export type Intent = 'where' | 'queue' | 'pharmacy' | 'results' | 'next';

export const SUGGESTED: { intent: Intent; q: L; icon: string }[] = [
  { intent: 'where', q: l('وين أروح الآن؟', 'Where do I go now?'), icon: 'nav' },
  { intent: 'queue', q: l('كم باقي على دوري؟', 'How long until my turn?'), icon: 'clock' },
  { intent: 'pharmacy', q: l('وين الصيدلية؟', 'Where is the pharmacy?'), icon: 'pill' },
  { intent: 'results', q: l('هل ظهرت نتائج التحليل؟', 'Are my test results out?'), icon: 'file' },
  { intent: 'next', q: l('وش الخطوة التالية؟', "What's the next step?"), icon: 'route' },
];

const norm = (x: string) =>
  x
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

/** Very small keyword matcher over the demo intents (Arabic, Saudi dialect and English). */
export function matchIntent(raw: string): Intent | null {
  const t = norm(raw);
  if (/صيدل|دوا|pharma|medic/.test(t)) return 'pharmacy';
  if (/نتيج|نتايج|تحليل|result/.test(t)) return 'results';
  if (/دور|انتظار|كم باقي|متي|queue|turn|wait/.test(t)) return 'queue';
  if (/التاليه|الجايه|بعدين|وش اسوي|ماذا بعد|next|step/.test(t)) return 'next';
  if (/وين|اين|اروح|اتجه|مكان|طريق|where|go|way/.test(t)) return 'where';
  return null;
}

/** Answer line for an intent, grounded in the current demo state. Also returns a map destination when relevant. */
export function answerFor(intent: Intent, s: JourneyState): { line: string; dest?: DestId } {
  switch (intent) {
    case 'queue':
      if (s.stage > STAGE.waiting) return { line: 'queue.none' };
      return { line: `queue.${Math.max(0, Math.min(3, s.ahead))}`, dest: s.ahead === 0 ? 'clinics' : undefined };
    case 'pharmacy':
      return { line: 'ans.pharmacy', dest: 'pharmacy' };
    case 'results':
      return { line: s.stage >= STAGE.results ? 'results.ready' : s.stage === STAGE.exams ? 'results.pending' : 'results.none' };
    case 'next':
      return { line: `next.${Math.min(s.stage, STAGE.complete)}` };
    case 'where':
    default: {
      const st = Math.min(s.stage, STAGE.complete);
      if (st === STAGE.waiting && s.ahead === 0) return { line: 'queue.0', dest: 'clinics' };
      const dest: DestId | undefined = st === 0 ? 'reception' : st === STAGE.consultation || st === STAGE.results ? 'clinics' : st === STAGE.exams ? 'lab' : st === STAGE.discharge ? 'pharmacy' : undefined;
      return { line: `where.${st}`, dest };
    }
  }
}
