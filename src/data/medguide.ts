// Medication Guide | دليلك الدوائي — explained by Pharmacist Suleiman (سليمان). Rafiq is the app, never the pharmacist.
//
// Two kinds of information, kept apart on purpose:
//  1. The PRESCRIPTION (dose, how often, when): DEMONSTRATION DATA for Amer's demo visit — not a real patient's prescription.
//     Times of day are shown ONLY where the (demo) prescription states them; nothing is inferred.
//  2. The MEDICINE FACTS (what it is for, precautions, interactions, food, missed dose): taken from the approved product
//     information for each medicine (SmPC / FDA-approved labelling). Where that source gives no instruction, the guide
//     says so and refers the patient to the pharmacist or treating clinician — it never fills the gap itself.
//
// Safety rules (enforced by what this file contains and how the UI uses it):
//  - Rafiq never diagnoses, prescribes, changes, starts or stops a medicine, and never adjusts a dose.
//  - No claim that two medicines are safe together; only verified interaction warnings are listed.
//  - Missing or unclear prescription details → "ask Pharmacist Suleiman or your doctor".
import { l, type L } from './content';

export type Slot = 'morning' | 'afternoon' | 'evening' | 'bedtime';
export const SLOTS: { id: Slot; icon: string; t: L }[] = [
  { id: 'morning', icon: 'sunrise', t: l('صباحًا', 'Morning') },
  { id: 'afternoon', icon: 'sun', t: l('بعد الظهر', 'Afternoon') },
  { id: 'evening', icon: 'sunset', t: l('مساءً', 'Evening') },
  { id: 'bedtime', icon: 'moon', t: l('قبل النوم', 'Before sleep') },
];

export type GuideMed = {
  id: 'm1' | 'm2' | 'm3';
  name: L;
  detail: L; // active ingredient · strength · form
  purpose: L; // what the medicine is for (approved use)
  condition: L; // why it is on this (demo) prescription
  dose: L; // prescribed dose (demo prescription)
  method: L; // how it is taken
  frequency: L; // prescribed frequency (demo prescription)
  freqTag: L; // short label, e.g. "once daily"
  slots: Slot[]; // ONLY the times stated on the prescription
  timing: L; // timing as written, or a clear "not specified" note
  food: L; // food instruction from the approved information
  before: L[]; // warnings and precautions
  interactions: L[]; // verified interaction warnings only
  avoid: L[]; // substances / activities to avoid
  missed: L | null; // approved missed-dose guidance, or null when the source gives none
  source: L; // where the medicine facts come from
  voice: { use: string; how: string; care: string; missed: string };
};

export const guideMeds: GuideMed[] = [
  {
    id: 'm1',
    name: l('باراسيتامول', 'Paracetamol'),
    detail: l('باراسيتامول · 500 ملغ · أقراص', 'Paracetamol · 500 mg · tablets'),
    purpose: l('مسكّن للألم الخفيف إلى المتوسط وخافض للحرارة.', 'Relieves mild to moderate pain and reduces fever.'),
    condition: l('في هذه الوصفة: لتخفيف الألم عند الحاجة.', 'On this prescription: to ease pain when needed.'),
    dose: l('قرص أو قرصان (500 – 1000 ملغ) في المرة الواحدة', '1 or 2 tablets (500–1,000 mg) at a time'),
    method: l('بالفم، مع كوب من الماء', 'By mouth, with a glass of water'),
    frequency: l(
      'عند الحاجة فقط — بفاصل 4 ساعات على الأقل بين الجرعتين، وبحد أقصى 8 أقراص (4000 ملغ) خلال 24 ساعة',
      'Only when needed — at least 4 hours between doses, and no more than 8 tablets (4,000 mg) in 24 hours'
    ),
    freqTag: l('عند الحاجة', 'When needed'),
    slots: [],
    timing: l('لا توجد مواعيد ثابتة في الوصفة — يُؤخذ عند الحاجة فقط.', 'No fixed times on the prescription — taken only when needed.'),
    food: l('يمكن تناوله مع الطعام أو بدونه.', 'Can be taken with or without food.'),
    before: [
      l(
        'لا تتناوله مع أي دواء آخر يحتوي على باراسيتامول (مثل بعض أدوية البرد والإنفلونزا)، حتى لا تتجاوز الجرعة المسموحة، فتجاوزها قد يضر الكبد.',
        'Do not take it with any other medicine that contains paracetamol (such as some cold and flu remedies), so you do not go over the maximum dose — too much can harm the liver.'
      ),
      l('أخبر الطبيب أو الصيدلي إن كان لديك مرض في الكبد أو الكلى.', 'Tell your doctor or pharmacist if you have liver or kidney disease.'),
    ],
    interactions: [
      l(
        'الوارفارين (مميّع للدم): تناول الباراسيتامول بانتظام لعدة أيام قد يزيد أثره — أخبر طبيبك إن كنت تستخدمه.',
        'Warfarin (a blood thinner): taking paracetamol regularly for several days can increase its effect — tell your doctor if you use it.'
      ),
    ],
    avoid: [
      l('أي دواء آخر يحتوي على باراسيتامول.', 'Any other medicine that contains paracetamol.'),
      l('الكحول، لأنه يزيد خطر الضرر على الكبد.', 'Alcohol, because it raises the risk of liver damage.'),
    ],
    missed: null,
    source: l('النشرة المعتمدة لباراسيتامول 500 ملغ (ملخص خصائص المنتج)', 'Approved product information for paracetamol 500 mg (SmPC)'),
    voice: { use: 'guide.m1.use', how: 'guide.m1.how', care: 'guide.m1.care', missed: 'guide.missed.none' },
  },
  {
    id: 'm2',
    name: l('فيتامين د3', 'Vitamin D3'),
    detail: l('كوليكالسيفيرول · 50,000 وحدة دولية · كبسولات', 'Cholecalciferol · 50,000 IU · capsules'),
    purpose: l('يعالج نقص فيتامين د ويقي منه؛ وفيتامين د ضروري لصحة العظام.', 'Treats and prevents vitamin D deficiency; vitamin D is needed for healthy bones.'),
    condition: l('في هذه الوصفة: لعلاج نقص فيتامين د.', 'On this prescription: to treat vitamin D deficiency.'),
    dose: l('كبسولة واحدة (50,000 وحدة دولية)', 'One capsule (50,000 IU)'),
    method: l('بالفم — تُبلع الكبسولة كاملة مع الماء', 'By mouth — swallow the capsule whole with water'),
    frequency: l('مرة واحدة في الأسبوع، للمدة التي يحددها الطبيب', 'Once a week, for as long as your doctor decides'),
    freqTag: l('مرة أسبوعيًا', 'Once a week'),
    slots: [],
    timing: l(
      'مرة واحدة في الأسبوع. لم تحدد الوصفة يومًا أو وقتًا معيّنًا — اسأل الصيدلي سليمان عن اليوم المناسب لك.',
      'Once a week. The prescription does not set a day or time — ask Pharmacist Suleiman which day suits you.'
    ),
    food: l('يُفضَّل تناوله مع وجبة.', 'Best taken with a meal.'),
    before: [
      l(
        'أخبر طبيبك إن كان لديك ارتفاع في الكالسيوم في الدم، أو حصوات في الكلى، أو مرض في الكلى.',
        'Tell your doctor if you have high calcium in your blood, kidney stones, or kidney disease.'
      ),
    ],
    interactions: [
      l(
        'مدرّات البول من نوع «الثيازيد»: قد ترفع الكالسيوم في الدم مع فيتامين د — يجب أن يعرف طبيبك أنك تستخدمها.',
        'Thiazide-type water tablets: together with vitamin D they can raise blood calcium — your doctor needs to know you take them.'
      ),
      l('الديجوكسين (دواء للقلب): يحتاج إلى متابعة طبية عند استخدامه مع فيتامين د.', 'Digoxin (a heart medicine): needs medical monitoring when used with vitamin D.'),
    ],
    avoid: [l('مكمّلات أخرى تحتوي على فيتامين د أو الكالسيوم، إلا إذا أذن بها الطبيب أو الصيدلي.', 'Other supplements with vitamin D or calcium, unless your doctor or pharmacist agrees.')],
    missed: null,
    source: l('النشرة المعتمدة لكوليكالسيفيرول (فيتامين د3)', 'Approved product information for cholecalciferol (vitamin D3)'),
    voice: { use: 'guide.m2.use', how: 'guide.m2.how', care: 'guide.m2.care', missed: 'guide.missed.none' },
  },
  {
    id: 'm3',
    name: l('أوميبرازول', 'Omeprazole'),
    detail: l('أوميبرازول · 20 ملغ · كبسولات', 'Omeprazole · 20 mg · capsules'),
    purpose: l('يقلّل كمية الحمض التي تنتجها المعدة.', 'Reduces the amount of acid your stomach makes.'),
    condition: l('يُستخدم لحالات مثل قرحة المعدة والارتجاع الحمضي (حرقة المعدة).', 'Used for conditions such as stomach ulcers and acid reflux (heartburn).'),
    dose: l('كبسولة واحدة (20 ملغ)', 'One capsule (20 mg)'),
    method: l('بالفم — تُبلع الكبسولة كاملة مع الماء، ولا تُمضغ ولا تُسحق', 'By mouth — swallow the capsule whole with water; do not chew or crush it'),
    frequency: l('مرة واحدة يوميًا', 'Once a day'),
    freqTag: l('مرة يوميًا', 'Once a day'),
    slots: ['morning'],
    timing: l('صباحًا، قبل وجبة الإفطار — كما هو مكتوب في الوصفة.', 'In the morning, before breakfast — as written on the prescription.'),
    food: l('قبل الأكل (قبل الإفطار).', 'Before eating (before breakfast).'),
    before: [
      l('أخبر الطبيب أو الصيدلي بكل الأدوية التي تتناولها، لأن أوميبرازول قد يتداخل مع بعضها.', 'Tell your doctor or pharmacist about every medicine you take — omeprazole can interact with some of them.'),
      l('الاستخدام لفترات طويلة يحتاج إلى متابعة الطبيب.', 'Long-term use needs your doctor’s follow-up.'),
    ],
    interactions: [
      l('كلوبيدوقريل (مميّع للدم): تنصح النشرة بتجنّب استخدامهما معًا.', 'Clopidogrel (a blood thinner): the label advises avoiding using them together.'),
      l('ميثوتريكسات: قد يرتفع مستواه في الدم — يحتاج إلى متابعة الطبيب.', 'Methotrexate: its blood level may rise — needs your doctor’s monitoring.'),
      l('عشبة سانت جون والريفامبيسين: قد تُضعف أثر أوميبرازول — تنصح النشرة بتجنّبهما.', "St John's wort and rifampicin: may weaken omeprazole — the label advises avoiding them."),
    ],
    avoid: [l('عشبة سانت جون (St John’s wort).', "St John's wort.")],
    missed: l(
      'إذا نسيت جرعة، تناولها حالما تتذكّر. وإذا اقترب موعد الجرعة التالية، اترك الجرعة المنسية وتناول التالية في موعدها. لا تأخذ جرعتين معًا.',
      'If you miss a dose, take it as soon as you remember. If it is almost time for your next dose, skip the missed dose and take the next one at the usual time. Do not take two doses at once.'
    ),
    source: l('وسم أوميبرازول المعتمد من FDA (دليل الدواء للمريض)', 'FDA-approved omeprazole labelling (patient Medication Guide)'),
    voice: { use: 'guide.m3.use', how: 'guide.m3.how', care: 'guide.m3.care', missed: 'guide.m3.missed' },
  },
];

/** Patient questions to Pharmacist Suleiman. Answers are built only from the fields above. */
export type AskId = 'why' | 'when' | 'avoid' | 'missed' | 'change';
export const ASKS: { id: AskId; q: L }[] = [
  { id: 'why', q: l('هذا الدواء ليش أستخدمه؟', 'Why do I use this medicine?') },
  { id: 'when', q: l('متى آخذه؟', 'When do I take it?') },
  { id: 'avoid', q: l('وش لازم أتجنّب؟', 'What should I avoid?') },
  { id: 'missed', q: l('إذا نسيت جرعة؟', 'What if I miss a dose?') },
  { id: 'change', q: l('أقدر أغيّر الجرعة؟', 'Can I change the dose?') },
];

const join = (xs: L[]): L => ({ ar: xs.map((x) => x.ar).join(' '), en: xs.map((x) => x.en).join(' ') });

export function suleimanAnswer(m: GuideMed, id: AskId): { text: L; voice: string[] } {
  switch (id) {
    case 'why':
      return {
        text: join([l('سأوضح لك الغرض من الدواء وطريقة استخدامه حسب الوصفة المعتمدة.', 'I will explain what this medicine is for and how to use it, according to your approved prescription.'), m.purpose, m.condition]),
        voice: ['guide.intro', m.voice.use],
      };
    case 'when':
      return {
        text: join([l('بحسب تعليمات وصفتك:', 'According to your prescription:'), m.timing, m.frequency, l('— يمكنك مراجعة الجدول لمعرفة مواعيد الجرعات.', '— you can check the schedule for your dose times.')]),
        voice: [m.voice.how],
      };
    case 'avoid':
      return { text: join([...m.avoid, ...m.interactions]), voice: [m.voice.care] };
    case 'missed':
      return {
        text:
          m.missed ??
          l(
            'لا تحتوي الوصفة ولا النشرة المعتمدة المستخدمة هنا على تعليمات للجرعة المنسية لهذا الدواء. لا تخمّن — اسألني أو اسأل طبيبك.',
            'Neither the prescription nor the approved information used here gives missed-dose instructions for this medicine. Please do not guess — ask me or your doctor.'
          ),
        voice: [m.voice.missed],
      };
    default:
      return {
        text: l(
          'لا يغيّر رفيق ولا هذا الدليل أي جرعة. زيادة الجرعة أو إنقاصها أو إيقاف الدواء قرار طبيبك المعالج فقط، وإن كان لديك سؤال فراجعني قبل أي خطوة.',
          'Neither Rafiq nor this guide changes any dose. Increasing, reducing or stopping a medicine is your treating doctor’s decision only — if you have a question, check with me first.'
        ),
        voice: ['guide.nochange'],
      };
  }
}
