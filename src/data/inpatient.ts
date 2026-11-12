// Inpatient Requests | طلبات المريض أثناء التنويم — demo data.
// Everything here is fictional sample data. Requests are simulated: nothing is sent to real staff or hospital systems.
import { l, type L } from './content';

export type CatId = 'nursing' | 'pt' | 'other';
/** Services that can appear in a patient's approved care plan. */
export type PlanKey = 'nursing' | 'pt' | 'nutrition' | 'social' | 'support' | 'respiratory' | 'speech';

export type ReqItem = { id: string; cat: CatId; plan: PlanKey; icon: string; title: L; desc: L; to: L; urgentNote?: boolean };
export type Category = { id: CatId; icon: string; title: L; sub: L; line: string };

/** Admission details for the demo patient (fictional). */
export const admission = {
  ward: l('جناح الباطنة — غرفة 312', 'Internal medicine ward — Room 312'),
  since: l('منذ اليوم، 1:10 م', 'Since today, 1:10 pm'),
};

/** The demo patient's approved care plan: only these services are offered. */
export const carePlan: Record<PlanKey, boolean> = {
  nursing: true,
  pt: true,
  nutrition: true,
  social: true,
  support: true,
  respiratory: false,
  speech: false,
};

export const planLabels: Record<PlanKey, L> = {
  nursing: l('التمريض', 'Nursing'),
  pt: l('العلاج الطبيعي', 'Physical therapy'),
  nutrition: l('التغذية العلاجية', 'Clinical nutrition'),
  social: l('الخدمة الاجتماعية', 'Social services'),
  support: l('خدمات المرضى', 'Patient services'),
  respiratory: l('العلاج التنفسي', 'Respiratory therapy'),
  speech: l('علاج النطق', 'Speech therapy'),
};

export const nextPtSession = l('الجلسة القادمة في الخطة: غدًا، 10:00 ص (تجريبي)', 'Next session in the plan: tomorrow, 10:00 am (demo)');

export const categories: Category[] = [
  { id: 'nursing', icon: 'heart', title: l('التمريض', 'Nursing'), sub: l('مساعدة من فريق التمريض', 'Help from the nursing team'), line: 'ans.nurse' },
  { id: 'pt', icon: 'walk', title: l('العلاج الطبيعي', 'Physical therapy'), sub: l('جلسات التأهيل في خطتك', 'Rehabilitation in your plan'), line: 'ans.pt' },
  { id: 'other', icon: 'grid', title: l('خدمات أخرى', 'Other services'), sub: l('أقسام أخرى في خطة رعايتك', 'Other departments in your plan'), line: 'inp.cat.other' },
];

export const items: ReqItem[] = [
  // Nursing
  { id: 'n1', cat: 'nursing', plan: 'nursing', icon: 'bell', title: l('طلب مساعدة تمريضية', 'Request nursing assistance'), desc: l('يحضر أحد أفراد فريق التمريض إلى غرفتك.', 'A member of the nursing team comes to your room.'), to: l('فريق التمريض', 'Nursing team') },
  { id: 'n2', cat: 'nursing', plan: 'nursing', icon: 'hand', title: l('المساعدة في الاحتياجات الأساسية', 'Help with basic needs'), desc: l('مثل الحركة، أو الوصول إلى دورة المياه، أو تعديل وضعية السرير.', 'Such as moving, getting to the bathroom, or adjusting the bed.'), to: l('فريق التمريض', 'Nursing team') },
  { id: 'n3', cat: 'nursing', plan: 'nursing', icon: 'heart', title: l('الإبلاغ عن انزعاج أو تغيّر في شعوري', 'Report discomfort or a change in how I feel'), desc: l('يُبلَّغ فريق التمريض ليطمئن عليك.', 'The nursing team is told so they can check on you.'), to: l('فريق التمريض', 'Nursing team'), urgentNote: true },
  { id: 'n4', cat: 'nursing', plan: 'nursing', icon: 'checkCircle', title: l('طلب خدمة تمريضية معتمدة في خطتي', 'Request an approved nursing service'), desc: l('خدمة مدرجة مسبقًا في خطة رعايتك.', 'A service already listed in your care plan.'), to: l('فريق التمريض', 'Nursing team') },
  // Physical therapy
  { id: 'p1', cat: 'pt', plan: 'pt', icon: 'walk', title: l('طلب جلسة علاج طبيعي', 'Request a physical therapy session'), desc: l('يراجع قسم العلاج الطبيعي طلبك ويحدّد الموعد.', 'Physical therapy reviews the request and sets a time.'), to: l('قسم العلاج الطبيعي', 'Physical therapy') },
  { id: 'p2', cat: 'pt', plan: 'pt', icon: 'hand', title: l('المساعدة في جلسة تأهيل مجدولة', 'Help with a scheduled rehabilitation session'), desc: l('مثل المرافقة إلى الجلسة أو تغيير وقتها.', 'Such as being accompanied to the session or changing its time.'), to: l('قسم العلاج الطبيعي', 'Physical therapy') },
  { id: 'p3', cat: 'pt', plan: 'pt', icon: 'calendar', title: l('السؤال عن موعد الجلسة القادمة', 'Ask about the next session'), desc: l('يؤكّد لك القسم موعد جلستك القادمة.', 'The department confirms your next session time.'), to: l('قسم العلاج الطبيعي', 'Physical therapy') },
  // Other departments (shown only if in the care plan)
  { id: 'o1', cat: 'other', plan: 'nutrition', icon: 'list', title: l('طلب زيارة أخصائي التغذية', 'Request a dietitian visit'), desc: l('ضمن خدمة التغذية العلاجية في خطتك.', 'Part of the clinical nutrition service in your plan.'), to: l('التغذية العلاجية', 'Clinical nutrition') },
  { id: 'o2', cat: 'other', plan: 'social', icon: 'users', title: l('طلب تواصل من الخدمة الاجتماعية', 'Request contact from social services'), desc: l('للمساعدة في الترتيبات أثناء التنويم.', 'For help with arrangements during your stay.'), to: l('الخدمة الاجتماعية', 'Social services') },
  { id: 'o3', cat: 'other', plan: 'support', icon: 'help', title: l('المساعدة في خدمة أو موعد قائم', 'Help with an existing service or appointment'), desc: l('يتابع القسم المختص طلبك.', 'The relevant department follows up.'), to: l('خدمات المرضى', 'Patient services') },
  { id: 'o4', cat: 'other', plan: 'respiratory', icon: 'activity', title: l('طلب جلسة علاج تنفسي', 'Request a respiratory therapy session'), desc: l('', ''), to: l('العلاج التنفسي', 'Respiratory therapy') },
  { id: 'o5', cat: 'other', plan: 'speech', icon: 'chat', title: l('طلب جلسة علاج نطق', 'Request a speech therapy session'), desc: l('', ''), to: l('علاج النطق', 'Speech therapy') },
];

/** Requests the patient may make = items whose service is in the approved care plan. */
export const available = (cat: CatId) => items.filter((i) => i.cat === cat && carePlan[i.plan]);
export const hiddenCount = (cat: CatId) => items.filter((i) => i.cat === cat && !carePlan[i.plan]).length;
export const itemById = (id: string) => items.find((i) => i.id === id)!;

export const REQ_STATUS: { title: L; icon: string }[] = [
  { title: l('تم إرسال الطلب', 'Submitted'), icon: 'send' },
  { title: l('قيد المراجعة', 'Under review'), icon: 'eye' },
  { title: l('جارٍ تنفيذ الطلب', 'In progress'), icon: 'clock' },
  { title: l('مكتمل', 'Completed'), icon: 'checkCircle' },
];

export type Req = { id: number; item: string; status: number; at: string };
