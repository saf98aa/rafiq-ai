import { STAGE, l, type DestId, type L, type ScreenId } from '../data/content';
import type { ExamStatus } from '../data/content';
import type { Status } from './ui';

export function stageStatus(i: number, stage: number, blood: ExamStatus): Status {
  if (i < stage) return 'done';
  if (i > stage) return 'upcoming';
  if (stage === STAGE.exams && blood !== 'done') return 'action';
  return 'current';
}

export type Action = { icon: string; title: L; sub: L; screen?: ScreenId; dest?: DestId; tone?: 'primary' };

/** "What do you need now?" — contextual to the current stage. */
export function actionsFor(stage: number, ahead: number): Action[] {
  switch (stage) {
    case STAGE.arrival:
    case STAGE.registration:
    case STAGE.nursing:
    case STAGE.waiting:
      return [
        { icon: 'clock', title: l('معرفة وقت الانتظار', 'Check waiting time'), sub: aheadText(ahead), screen: 'queue', tone: 'primary' },
        { icon: 'pin', title: l('الوصول إلى العيادة', 'Get to the clinic'), sub: l('عيادة الباطنة رقم 4', 'Internal Medicine — Clinic 4'), dest: 'clinics' },
        { icon: 'stethoscope', title: l('تعرّف على طبيبك', 'Meet your doctor'), sub: l('د. سارة العتيبي', 'Dr. Sara Alotaibi'), screen: 'doctor' },
        { icon: 'route', title: l('معرفة التعليمات القادمة', 'See what comes next'), sub: l('مراحل زيارتك اليوم', "Today's visit stages"), screen: 'journey' },
      ];
    case STAGE.consultation:
      return [
        { icon: 'stethoscope', title: l('تعليمات الاستشارة', 'Consultation notes'), sub: l('الاستشارة جارية الآن', 'Consultation in progress'), screen: 'doctor', tone: 'primary' },
        { icon: 'pin', title: l('الوصول إلى العيادة', 'Get to the clinic'), sub: l('العيادة رقم 4', 'Clinic 4'), dest: 'clinics' },
        { icon: 'route', title: l('معرفة التعليمات القادمة', 'See what comes next'), sub: l('بعد الاستشارة: الفحوصات', 'After this: tests'), screen: 'journey' },
      ];
    case STAGE.exams:
      return [
        { icon: 'flask', title: l('متابعة الفحوصات', 'Track your tests'), sub: l('فحص واحد بانتظار التنفيذ', 'One test awaiting'), screen: 'exams', tone: 'primary' },
        { icon: 'pin', title: l('الطريق إلى المختبر', 'Route to the lab'), sub: l('الطابق الأرضي، الجناح الغربي', 'Ground floor, West wing'), dest: 'lab' },
        { icon: 'file', title: l('حالة النتائج', 'Results status'), sub: l('قيد الإعداد', 'Being prepared'), screen: 'results' },
      ];
    case STAGE.results:
      return [
        { icon: 'file', title: l('الاطلاع على النتائج', 'View your results'), sub: l('نتيجتان متاحتان', 'Two results available'), screen: 'results', tone: 'primary' },
        { icon: 'route', title: l('معرفة التعليمات القادمة', 'See what comes next'), sub: l('مناقشة النتائج مع الطبيب', 'Discuss with your doctor'), screen: 'journey' },
      ];
    default:
      return [
        { icon: 'pill', title: l('إرشادات الأدوية', 'Medication guidance'), sub: l('تعليمات فريق الرعاية', 'From your care team'), screen: 'meds', tone: 'primary' },
        { icon: 'flag', title: l('ملخص الخروج', 'Discharge summary'), sub: stage >= STAGE.complete ? l('اكتملت الرحلة', 'Journey complete') : l('قيد الاعتماد', 'Pending approval'), screen: 'discharge' },
        { icon: 'pin', title: l('الطريق إلى الصيدلية', 'Route to pharmacy'), sub: l('الطابق الأرضي', 'Ground floor'), dest: 'pharmacy' },
      ];
  }
}

export function suggestedDest(stage: number): DestId {
  if (stage <= STAGE.registration) return 'reception';
  if (stage <= STAGE.consultation) return 'clinics';
  if (stage === STAGE.exams) return 'lab';
  if (stage === STAGE.results) return 'clinics';
  return 'pharmacy';
}

/** Correct Arabic number agreement for "your turn is after N patients". */
export function aheadText(n: number): L {
  if (n <= 0) return l('حان دورك', "It's your turn");
  if (n === 1) return l('دورك بعد مريض واحد', '1 patient ahead of you');
  if (n === 2) return l('دورك بعد مريضَين', '2 patients ahead of you');
  if (n <= 10) return l(`دورك بعد ${n} مرضى`, `${n} patients ahead of you`);
  return l(`دورك بعد ${n} مريضًا`, `${n} patients ahead of you`);
}

export function minutesText(n: number): L {
  if (n === 1) return l('دقيقة واحدة', '1 minute');
  if (n === 2) return l('دقيقتان', '2 minutes');
  if (n <= 10) return l(`${n} دقائق`, `${n} minutes`);
  return l(`${n} دقيقة`, `${n} minutes`);
}
