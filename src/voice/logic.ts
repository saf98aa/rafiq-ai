import { l, STAGE, type L, type ScreenId } from '../data/content';
import type { DestId } from '../data/blueprint';
import type { CatId } from '../data/inpatient';

type JourneyState = { stage: number; ahead: number; admitted?: boolean; reqStatus?: number | null };

/** The spoken explanation for a screen, chosen from the current (demo) journey state. */
export function screenLine(screen: ScreenId, s: JourneyState): string | null {
  if (screen === 'inpatient') return s.admitted ? 'screen.inpatient' : 'ans.notadmitted';
  if (screen === 'results') return s.stage >= STAGE.results ? 'screen.results.ready' : s.stage === STAGE.exams ? 'screen.results.pending' : 'screen.results.none';
  const id = `screen.${screen}`;
  return id;
}

export type Intent = 'where' | 'queue' | 'pharmacy' | 'results' | 'next' | 'nurse' | 'pt' | 'reqstatus';

export const SUGGESTED: { intent: Intent; q: L; icon: string }[] = [
  { intent: 'where', q: l('وين أروح الآن؟', 'Where do I go now?'), icon: 'nav' },
  { intent: 'queue', q: l('كم باقي على دوري؟', 'How long until my turn?'), icon: 'clock' },
  { intent: 'pharmacy', q: l('وين الصيدلية؟', 'Where is the pharmacy?'), icon: 'pill' },
  { intent: 'results', q: l('هل ظهرت نتائج التحليل؟', 'Are my test results out?'), icon: 'file' },
  { intent: 'next', q: l('وش الخطوة التالية؟', "What's the next step?"), icon: 'route' },
  { intent: 'nurse', q: l('أحتاج مساعدة من التمريض.', 'I need help from the nursing team.'), icon: 'heart' },
  { intent: 'pt', q: l('أبغى أطلب جلسة علاج طبيعي.', 'I want to request a physical therapy session.'), icon: 'walk' },
  { intent: 'reqstatus', q: l('ما حالة طلبي؟', 'What is the status of my request?'), icon: 'send' },
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
  if (/تمريض|ممرض|نيرس|nurs/.test(t)) return 'nurse';
  if (/علاج طبيعي|العلاج الطبيعي|طبيعي|تاهيل|physio|physical|rehab/.test(t)) return 'pt';
  if (/طلبي|حاله الطلب|حاله طلب|ارسال|ارسلت|انرسل|request|status/.test(t)) return 'reqstatus';
  if (/صيدل|دوا|pharma|medic/.test(t)) return 'pharmacy';
  if (/نتيج|نتايج|تحليل|result/.test(t)) return 'results';
  if (/دور|انتظار|كم باقي|متي|queue|turn|wait/.test(t)) return 'queue';
  if (/التاليه|الجايه|بعدين|وش اسوي|ماذا بعد|next|step/.test(t)) return 'next';
  if (/وين|اين|اروح|اتجه|مكان|طريق|where|go|way/.test(t)) return 'where';
  return null;
}

/** Answer line for an intent, grounded in the current demo state. Also returns a map destination when relevant. */
export function answerFor(intent: Intent, s: JourneyState): { line: string; dest?: DestId; inpatient?: CatId | 'home' } {
  switch (intent) {
    case 'nurse':
      return s.admitted ? { line: 'ans.nurse', inpatient: 'nursing' } : { line: 'ans.notadmitted', inpatient: 'home' };
    case 'pt':
      return s.admitted ? { line: 'ans.pt', inpatient: 'pt' } : { line: 'ans.notadmitted', inpatient: 'home' };
    case 'reqstatus':
      if (!s.admitted) return { line: 'ans.notadmitted', inpatient: 'home' };
      return s.reqStatus == null ? { line: 'req.none', inpatient: 'home' } : { line: `req.${s.reqStatus}`, inpatient: 'home' };
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
