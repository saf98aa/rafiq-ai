// Centralised, bilingual demo content for the Rafiq experience.
// All patient, hospital and clinical data below is fictional sample data.

export type L = { ar: string; en: string };
export const l = (ar: string, en: string): L => ({ ar, en });

export type ScreenId =
  | 'welcome'
  | 'dashboard'
  | 'journey'
  | 'queue'
  | 'doctor'
  | 'exams'
  | 'results'
  | 'meds'
  | 'map'
  | 'discharge'
  | 'more';

export const patient = {
  name: l('محمد عبدالله', 'Mohammed Abdullah'),
  first: l('محمد', 'Mohammed'),
  visit: 'VIS-0001',
  hospital: l('المستشفى التخصصي (نموذج تجريبي)', 'Specialist Hospital (demo)'),
  dept: l('العيادات الخارجية — الباطنة', 'Outpatient — Internal Medicine'),
  date: l('الثلاثاء، 10 نوفمبر', 'Tuesday, 10 November'),
  appt: '09:30',
  avatar: './media/av_patient.webp',
};

export const doctor = {
  name: l('د. سارة العتيبي', 'Dr. Sara Alotaibi'),
  specialty: l('استشارية الطب الباطني', 'Consultant, Internal Medicine'),
  clinic: l('عيادة الباطنة رقم 4', 'Internal Medicine — Clinic 4'),
  floor: l('الطابق الأرضي، الجناح الشرقي', 'Ground floor, East wing'),
  avatar: './media/av_doctor.webp',
};

export const nurse = {
  name: l('الممرضة نورة', 'Nurse Noura'),
  role: l('التمريض — العيادات الخارجية', 'Nursing — Outpatient clinics'),
  avatar: './media/av_nurse.webp',
};

export type Stage = {
  id: string;
  icon: string;
  title: L;
  time: string;
  info: L;
  next: L;
  screen?: ScreenId;
};

export const stages: Stage[] = [
  {
    id: 'arrival',
    icon: 'door',
    title: l('الوصول إلى المستشفى', 'Arrival at the hospital'),
    time: '08:40',
    info: l('تم تأكيد وصولك عند المدخل الرئيسي.', 'Your arrival at the main entrance was confirmed.'),
    next: l('التوجّه إلى مكتب التسجيل في الاستقبال.', 'Head to the registration desk at reception.'),
    screen: 'map',
  },
  {
    id: 'registration',
    icon: 'id',
    title: l('التسجيل', 'Registration'),
    time: '08:52',
    info: l('فُتحت زيارتك برقم VIS-0001 ورُبطت بملفك.', 'Visit VIS-0001 was opened and linked to your file.'),
    next: l('انتظار التقييم التمريضي.', 'Wait for the nursing assessment.'),
  },
  {
    id: 'nursing',
    icon: 'heart',
    title: l('التقييم التمريضي', 'Nursing assessment'),
    time: '09:05',
    info: l('سجّل فريق التمريض علاماتك الحيوية.', 'The nursing team recorded your vital signs.'),
    next: l('الانتظار حتى يحين دورك مع الطبيب.', 'Wait until it is your turn with the doctor.'),
  },
  {
    id: 'waiting',
    icon: 'clock',
    title: l('انتظار الطبيب', 'Waiting for the doctor'),
    time: '09:12',
    info: l('أنت في قائمة انتظار عيادة الباطنة رقم 4.', 'You are in the queue for Internal Medicine — Clinic 4.'),
    next: l('سيصلك تنبيه عندما يحين دورك للتوجّه إلى العيادة.', 'You will be notified when it is time to go to the clinic.'),
    screen: 'queue',
  },
  {
    id: 'consultation',
    icon: 'stethoscope',
    title: l('الاستشارة الطبية', 'Medical consultation'),
    time: '09:30',
    info: l('موعدك مع د. سارة العتيبي في العيادة رقم 4.', 'Your appointment with Dr. Sara Alotaibi in Clinic 4.'),
    next: l('اتّباع ما يطلبه الطبيب من فحوصات.', 'Follow the tests requested by your doctor.'),
    screen: 'doctor',
  },
  {
    id: 'exams',
    icon: 'flask',
    title: l('الفحوصات والتحاليل', 'Tests & examinations'),
    time: '10:15',
    info: l('طلب طبيبك فحصين، ويمكنك متابعة حالة كلٍّ منهما.', 'Your doctor requested two tests. Track each one here.'),
    next: l('انتظار جاهزية النتائج.', 'Wait for the results to become available.'),
    screen: 'exams',
  },
  {
    id: 'results',
    icon: 'file',
    title: l('النتائج', 'Results'),
    time: '11:45',
    info: l('ستظهر هنا نتائجك فور اعتمادها.', 'Your results appear here once they are released.'),
    next: l('مناقشة النتائج مع طبيبك ثم استلام الإرشادات.', 'Discuss them with your doctor, then receive your guidance.'),
    screen: 'results',
  },
  {
    id: 'discharge',
    icon: 'flag',
    title: l('الإرشادات والخروج', 'Guidance & discharge'),
    time: '12:20',
    info: l('تعليمات فريق الرعاية وملخص زيارتك في مكان واحد.', 'Care-team instructions and your visit summary in one place.'),
    next: l('الاطلاع على إرشادات الأدوية وموعد المتابعة.', 'Review medication guidance and your follow-up.'),
    screen: 'discharge',
  },
];

export const STAGE = { arrival: 0, registration: 1, nursing: 2, waiting: 3, consultation: 4, exams: 5, results: 6, discharge: 7, complete: 8 };

export const vitals = [
  { icon: 'heart', label: l('النبض', 'Pulse'), value: '82', unit: l('نبضة/دقيقة', 'bpm') },
  { icon: 'activity', label: l('ضغط الدم', 'Blood pressure'), value: '120/78', unit: l('ملم زئبق', 'mmHg') },
  { icon: 'thermo', label: l('الحرارة', 'Temperature'), value: '36.7', unit: l('°م', '°C') },
  { icon: 'drop', label: l('تشبّع الأكسجين', 'Oxygen saturation'), value: '98%', unit: l('SpO₂', 'SpO₂') },
];

export type ExamStatus = 'pending' | 'progress' | 'done';
export const exams = [
  {
    id: 'xray',
    icon: 'scan',
    name: l('أشعة سينية للصدر', 'Chest X-ray'),
    place: l('قسم الأشعة — الطابق الأرضي', 'Radiology — Ground floor'),
    dest: 'radiology' as const,
    duration: l('10 – 15 دقيقة تقريبًا', 'About 10–15 minutes'),
    prep: l('إزالة الإكسسوارات والأغراض المعدنية قبل التصوير.', 'Remove jewellery and metal items before imaging.'),
    doneAt: '10:40',
  },
  {
    id: 'blood',
    icon: 'drop',
    name: l('تحليل الدم الشامل', 'Complete blood count'),
    place: l('المختبر — الطابق الأرضي، الجناح الغربي', 'Laboratory — Ground floor, West wing'),
    dest: 'lab' as const,
    duration: l('5 – 10 دقائق لسحب العينة', 'About 5–10 minutes for the sample'),
    prep: l('لا توجد تعليمات تحضير مسجّلة لهذا الطلب.', 'No preparation instructions were recorded for this request.'),
    doneAt: '11:05',
  },
];

export const examSteps = [l('تم الطلب', 'Requested'), l('في الانتظار', 'Queued'), l('قيد التنفيذ', 'In progress'), l('مكتمل', 'Completed')];

export const meds = [
  {
    id: 'm1',
    name: l('باراسيتامول', 'Paracetamol'),
    form: l('أقراص', 'Tablets'),
    instruction: l(
      'يُستخدم عند الحاجة وفق الجرعة المكتوبة في وصفتك الطبية.',
      'Use when needed, following the dose written on your prescription.'
    ),
    schedule: l('حسب الوصفة — عند الحاجة', 'As prescribed — when needed'),
    note: l('لا تتجاوز الجرعة التي حدّدها طبيبك.', 'Do not exceed the dose set by your doctor.'),
    times: ['08:00', '20:00'],
  },
  {
    id: 'm2',
    name: l('فيتامين د', 'Vitamin D'),
    form: l('كبسولات', 'Capsules'),
    instruction: l(
      'يُستخدم بالانتظام الذي حدّده فريق الرعاية في الوصفة.',
      'Take on the schedule set by your care team on the prescription.'
    ),
    schedule: l('حسب الوصفة — أسبوعيًا', 'As prescribed — weekly'),
    note: l('استشر الصيدلي إن كنت تستخدم مكمّلات أخرى.', 'Ask the pharmacist if you take other supplements.'),
    times: ['09:00'],
  },
];

export const medQA = [
  {
    q: l('كيف أستخدم هذا الدواء؟', 'How do I use this medication?'),
    a: l(
      'بحسب تعليمات فريق الرعاية المسجّلة في زيارتك: يُستخدم وفق الجرعة المكتوبة في وصفتك. للتفاصيل، اسأل صيدلي المستشفى.',
      'According to the care-team instructions recorded for your visit: use it as written on your prescription. For details, ask the hospital pharmacist.'
    ),
  },
  {
    q: l('ماذا لو نسيت جرعة؟', 'What if I miss a dose?'),
    a: l(
      'لم يسجّل فريق الرعاية تعليمات لهذه الحالة. يُرجى سؤال الصيدلي أو طبيبك بدل التخمين.',
      'Your care team has not recorded instructions for this case. Please ask the pharmacist or your doctor rather than guessing.'
    ),
  },
  {
    q: l('هل له آثار جانبية؟', 'Does it have side effects?'),
    a: l(
      'رفيق لا يقدّم استشارة دوائية. راجع النشرة المرفقة بالدواء، وتواصل مع الصيدلي عند أي استفسار.',
      'Rafiq does not give pharmaceutical advice. Check the leaflet in the pack and contact the pharmacist with any question.'
    ),
  },
];

// ---------- Hospital map (simplified prototype floor plan, viewBox 340 x 440) ----------
export type DestId = 'reception' | 'clinics' | 'lab' | 'radiology' | 'pharmacy' | 'waiting';
export const rooms: { id: DestId | 'elev' | 'wc' | 'main'; x: number; y: number; w: number; h: number; label: L; icon: string }[] = [
  { id: 'radiology', x: 34, y: 44, w: 120, h: 56, label: l('الأشعة', 'Radiology'), icon: 'scan' },
  { id: 'elev', x: 186, y: 44, w: 52, h: 56, label: l('المصاعد', 'Lifts'), icon: 'lift' },
  { id: 'wc', x: 246, y: 44, w: 60, h: 56, label: l('دورات المياه', 'Restrooms'), icon: 'wc' },
  { id: 'lab', x: 34, y: 122, w: 120, h: 96, label: l('المختبر', 'Laboratory'), icon: 'flask' },
  { id: 'clinics', x: 186, y: 122, w: 120, h: 96, label: l('العيادات 1–6', 'Clinics 1–6'), icon: 'stethoscope' },
  { id: 'pharmacy', x: 34, y: 242, w: 120, h: 52, label: l('الصيدلية', 'Pharmacy'), icon: 'pill' },
  { id: 'waiting', x: 186, y: 242, w: 120, h: 52, label: l('انتظار العيادات', 'Clinic waiting'), icon: 'chair' },
  { id: 'reception', x: 34, y: 317, w: 120, h: 70, label: l('الاستقبال', 'Reception'), icon: 'desk' },
  { id: 'main', x: 186, y: 317, w: 120, h: 70, label: l('صالة الانتظار', 'Main waiting hall'), icon: 'chair' },
];
export const youAreHere = { x: 246, y: 356 };
export const routes: Record<DestId, [number, number][]> = {
  reception: [[246, 356], [246, 306], [94, 306], [94, 322]],
  clinics: [[246, 356], [246, 306], [170, 306], [170, 230], [246, 230], [246, 214]],
  lab: [[246, 356], [246, 306], [170, 306], [170, 230], [94, 230], [94, 214]],
  radiology: [[246, 356], [246, 306], [170, 306], [170, 110], [94, 110], [94, 96]],
  pharmacy: [[246, 356], [246, 306], [94, 306], [94, 290]],
  waiting: [[246, 356], [246, 306], [246, 290]],
};
export const destLabel: Record<DestId, L> = {
  reception: l('الاستقبال', 'Reception'),
  clinics: l('عيادة الباطنة رقم 4', 'Internal Medicine — Clinic 4'),
  lab: l('المختبر', 'Laboratory'),
  radiology: l('قسم الأشعة', 'Radiology'),
  pharmacy: l('الصيدلية', 'Pharmacy'),
  waiting: l('انتظار العيادات', 'Clinic waiting area'),
};

// ---------- Problem hotspots (Scene 02) ----------
export type Hotspot = {
  id: string;
  station: 'waiting' | 'corridor' | 'entrance';
  x: number;
  y: number;
  title: L;
  body: L;
  fix: L;
  fixScreen: ScreenId;
  icon: string;
};
export const hotspots: Hotspot[] = [
  {
    id: 'patient',
    station: 'waiting',
    x: 0.44,
    y: 0.5,
    icon: 'help',
    title: l('لا يعرف ما الخطوة التالية', "Not knowing what happens next"),
    body: l('سجّل محمد وصوله، لكن لا أحد أخبره بما سيحدث بعد ذلك أو متى.', 'Mohammed has checked in, but no one has told him what comes next, or when.'),
    fix: l('رحلتي — كل مراحل الزيارة في خط زمني واحد', 'My Journey — every stage of the visit on one timeline'),
    fixScreen: 'journey',
  },
  {
    id: 'crowd',
    station: 'waiting',
    x: 0.87,
    y: 0.55,
    icon: 'clock',
    title: l('أوقات انتظار غير واضحة', 'Unclear waiting times'),
    body: l('الصالة مزدحمة، ولا يعرف كم مريضًا قبله ولا كم سينتظر.', 'The hall is busy, and he cannot tell how many people are ahead of him or how long it will take.'),
    fix: l('شاشة الانتظار — ترتيبك والوقت المتوقع', 'Queue screen — your position and estimated time'),
    fixScreen: 'queue',
  },
  {
    id: 'screen',
    station: 'waiting',
    x: 0.16,
    y: 0.3,
    icon: 'monitor',
    title: l('شاشات لا تخاطبه شخصيًا', "Screens that don't speak to him"),
    body: l('الشاشة تعرض أرقامًا عامة، ويظل يتساءل: هل هذا رقمي؟ هل فاتني دوري؟', 'The display shows generic numbers. He keeps wondering: is that mine? Did I miss my turn?'),
    fix: l('تنبيهات شخصية عندما يحين دورك', 'Personal updates when your turn comes'),
    fixScreen: 'queue',
  },
  {
    id: 'family',
    station: 'waiting',
    x: 0.7,
    y: 0.42,
    icon: 'users',
    title: l('المرافق لا يعرف أيضًا', 'The companion is left guessing too'),
    body: l('مرافقه يسأل عن الخطوة القادمة، ولا توجد إجابة واضحة يشاركها معه.', 'His companion asks about the next step, and there is no clear answer to share.'),
    fix: l('لوحة الزيارة — حالة واضحة يفهمها الجميع', 'Visit dashboard — a clear status anyone can follow'),
    fixScreen: 'dashboard',
  },
  {
    id: 'corridor',
    station: 'corridor',
    x: 0.93,
    y: 0.31,
    icon: 'map',
    title: l('صعوبة الوصول إلى القسم الصحيح', 'Hard to find the right department'),
    body: l('ممرات متشابهة ولافتات كثيرة… أين المختبر؟ وأين الأشعة؟', 'Similar corridors, many signs… where is the lab? Where is radiology?'),
    fix: l('خريطة المستشفى — مسار مقترح إلى وجهتك', 'Hospital map — a suggested route to your destination'),
    fixScreen: 'map',
  },
  {
    id: 'tests',
    station: 'corridor',
    x: 0.88,
    y: 0.64,
    icon: 'flask',
    title: l('فحوصات ونتائج بلا متابعة', 'Tests and results with no visibility'),
    body: l('هل بدأ التحليل؟ متى تظهر النتيجة؟ ومن سيشرحها له؟', 'Has the test started? When will the result be ready? Who will explain it?'),
    fix: l('الفحوصات والنتائج — حالة كل طلب أولًا بأول', 'Tests & results — the status of every request, as it changes'),
    fixScreen: 'exams',
  },
  {
    id: 'entrance',
    station: 'entrance',
    x: 0.66,
    y: 0.72,
    icon: 'door',
    title: l('من أين أبدأ؟', 'Where do I start?'),
    body: l('عند الوصول، لا يعرف أين يسجّل ولا أي باب يقصد.', 'On arrival, he does not know where to register or which door to take.'),
    fix: l('لوحة رفيق — خطوتك التالية دائمًا أمامك', 'Rafiq dashboard — your next step, always in view'),
    fixScreen: 'dashboard',
  },
];

// ---------- "Why this feature?" explanations ----------
export type Explain = { title: L; problem: L; decision: L; value: L; connection: L };
export const explanations: Partial<Record<ScreenId, Explain>> = {
  welcome: {
    title: l('الترحيب والدخول', 'Welcome & sign-in'),
    problem: l(
      'يصل المريض متوترًا، ولا يريد إنشاء حساب جديد أو تذكّر كلمة مرور في لحظة كهذه.',
      'Patients arrive anxious and should not have to create an account or remember a password at that moment.'
    ),
    decision: l(
      'نقطة دخول مألوفة توحي بالأمان عبر نفاذ، مع مسار دخول تجريبي سريع لأغراض العرض.',
      'A familiar, secure-feeling entry point via Nafath, plus a quick demo path for presentations.'
    ),
    value: l('دخول بخطوة واحدة يربط المريض مباشرةً بزيارته الحالية.', 'One-step access that links the patient straight to the current visit.'),
    connection: l('بعد الدخول، تفتح لوحة الزيارة لتُظهر أين يقف المريض الآن.', 'After sign-in, the visit dashboard opens to show where the patient stands right now.'),
  },
  dashboard: {
    title: l('لوحة الزيارة', 'Visit dashboard'),
    problem: l(
      'المعلومة موزّعة بين الاستقبال والشاشات والرسائل والأوراق، فيبقى المريض يبحث ويسأل.',
      'Information is scattered across reception, screens, messages and paper, so patients keep searching and asking.'
    ),
    decision: l(
      'مكان واحد يجمع حالة الزيارة والمرحلة الحالية، ويقترح الإجراء المناسب لهذه اللحظة فقط.',
      'One place that brings together the visit status and current stage, and suggests only the action that fits this moment.'
    ),
    value: l('يفهم المريض وضعه وخطوته التالية بنظرة واحدة، دون تشتيت.', 'Patients grasp their situation and next step at a glance, without noise.'),
    connection: l('كل إجراء في "ماذا تحتاج الآن؟" يقود مباشرةً إلى الشاشة المعنية.', 'Every action under "What do you need now?" leads directly to the relevant screen.'),
  },
  journey: {
    title: l('رحلتي الصحية', 'My healthcare journey'),
    problem: l(
      'يرى المريض موعده الحالي فقط، ولا يعرف ما الذي اكتمل وما الذي ينتظره.',
      'Patients only see the current appointment, not what is done and what still lies ahead.'
    ),
    decision: l(
      'خط زمني تفاعلي يعرض كل المراحل بحالاتها: مكتمل، جارٍ الآن، قادم، يحتاج إلى إجراء.',
      'An interactive timeline showing every stage and its status: completed, in progress, upcoming, or action needed.'
    ),
    value: l('رؤية الرحلة كاملة تقلّل القلق وتجعل الانتظار مفهومًا.', 'Seeing the whole journey reduces anxiety and makes waiting understandable.'),
    connection: l('كل مرحلة تفتح تفاصيلها، وتوصل إلى الشاشة التي يحتاجها المريض.', 'Each stage opens its details and links to the screen the patient needs.'),
  },
  queue: {
    title: l('وقت الانتظار والدور', 'Waiting time & queue'),
    problem: l('غالبًا لا يرى المريض تقدّم دوره، فيبقى قلقًا من أن يفوته.', 'Patients often have little visibility into their queue and worry about missing their turn.'),
    decision: l('عرض ترتيب المريض والوقت المتوقع وحالة الدور بشكل حيّ وواضح.', 'Show the patient’s position, estimated time and queue status clearly, as it changes.'),
    value: l('انتظار أكثر شفافية وطمأنينة، مع حرية الحركة دون خوف من فوات الدور.', 'More transparent, calmer waiting, with freedom to move without fear of missing the turn.'),
    connection: l('عندما يحين الدور، يرشد رفيق المريض إلى العيادة ويبدأ مرحلة الاستشارة.', 'When the turn comes, Rafiq guides the patient to the clinic and the consultation stage begins.'),
  },
  doctor: {
    title: l('الطبيب والاستشارة', 'Doctor & consultation'),
    problem: l('لا يعرف المريض دائمًا من سيقابل، ولا أين، ولا ماذا يُحضّر.', 'Patients do not always know whom they will meet, where, or what to prepare.'),
    decision: l('ملف واضح للطبيب والعيادة وحالة الموعد، مع تعليمات الاستشارة.', 'A clear profile of the doctor, clinic and appointment status, with consultation instructions.'),
    value: l('يدخل المريض الاستشارة مستعدًا، فتكون أوضح وأكثر فاعلية.', 'Patients walk into the consultation prepared, making it clearer and more effective.'),
    connection: l('ما يطلبه الطبيب من فحوصات يظهر فورًا في شاشة الفحوصات.', 'Any tests the doctor requests appear right away on the tests screen.'),
  },
  exams: {
    title: l('الفحوصات والتحاليل', 'Tests & examinations'),
    problem: l('لا يعرف المريض أين تُجرى فحوصاته، ولا هل بدأت، ولا ماذا بعدها.', 'Patients do not know where their tests happen, whether they have started, or what comes after.'),
    decision: l('متابعة كل فحص بموقعه ومدته وتعليمات التحضير ومؤشر تقدّم مرئي.', 'Track every test with its location, duration, preparation notes and a visual progress indicator.'),
    value: l('وضوح كامل لكل طلب، وتنقّل أقل بين الأقسام بحثًا عن إجابة.', 'Full clarity for each request, and less walking between departments looking for answers.'),
    connection: l('عند اكتمال الفحوصات، تنتقل الرحلة إلى مرحلة النتائج.', 'Once tests are complete, the journey moves on to results.'),
  },
  results: {
    title: l('النتائج', 'Results'),
    problem: l('ينتظر المريض نتائجه دون أن يعرف هل صدرت، ولا ما المطلوب منه بعدها.', 'Patients wait for results without knowing whether they are ready or what to do next.'),
    decision: l(
      'عرض حالة النتائج وتوقيتها والخطوة التالية — دون أي تفسير طبي آلي.',
      'Show result status, timing and next step — without any automated medical interpretation.'
    ),
    value: l('يعرف المريض متى تتوفر نتائجه، ويُوجَّه لمناقشتها مع المختص.', 'Patients know when results are available and are directed to discuss them with a professional.'),
    connection: l('بعد مراجعة النتائج مع الطبيب، تبدأ مرحلة الإرشادات والخروج.', 'After the doctor reviews the results, the guidance and discharge stage begins.'),
  },
  meds: {
    title: l('إرشادات الأدوية', 'Medication guidance'),
    problem: l('تضيع تعليمات الأدوية بين الأوراق والكلام الشفهي، ويصعب تذكّرها لاحقًا.', 'Medication instructions get lost between paper and verbal advice, and are hard to recall later.'),
    decision: l(
      'عرض ما سجّله فريق الرعاية فقط، بلغة واضحة، مع إحالة كل ما عداه إلى الصيدلي.',
      'Show only what the care team recorded, in plain language, and refer everything else to the pharmacist.'
    ),
    value: l('وصول سهل وآمن إلى التعليمات المعتمدة في أي وقت.', 'Easy, safe access to approved instructions at any time.'),
    connection: l('تصبح الإرشادات جزءًا من ملخص الخروج ومتابعة ما بعد الزيارة.', 'The guidance becomes part of the discharge summary and post-visit follow-up.'),
  },
  map: {
    title: l('خريطة المستشفى', 'Hospital map'),
    problem: l('المستشفيات كبيرة ومتشابهة الممرات، والوصول للقسم الصحيح مرهق.', 'Hospitals are large with similar corridors; finding the right department is exhausting.'),
    decision: l(
      'خريطة مبسّطة تبرز الوجهة وتقترح مسارًا — دون ادعاء ملاحة داخلية فعلية.',
      'A simplified map that highlights the destination and suggests a route — without claiming real indoor positioning.'
    ),
    value: l('ثقة أكبر في التنقل، ووصول أسرع، وأسئلة أقل لموظفي الاستقبال.', 'More confident movement, faster arrival, and fewer questions at reception.'),
    connection: l('الوجهة تُقترح تلقائيًا حسب المرحلة: العيادة، المختبر، ثم الصيدلية.', 'Destinations are suggested by stage: the clinic, the lab, then the pharmacy.'),
  },
  discharge: {
    title: l('الخروج واكتمال الرحلة', 'Discharge & completion'),
    problem: l('كثيرًا ما تنتهي الزيارة فجأة، فيغادر المريض دون صورة واضحة لما بعدها.', 'Visits often end abruptly, and patients leave without a clear picture of what comes next.'),
    decision: l('ختام منظّم يلخّص المراحل المكتملة والتعليمات وموعد المتابعة.', 'An organised close that summarises completed stages, instructions and follow-up.'),
    value: l('يغادر المريض مطمئنًا، ويعرف تمامًا ما المطلوب منه.', 'Patients leave reassured, knowing exactly what is expected of them.'),
    connection: l('تبقى الإرشادات متاحة للعودة إليها، ويستمر رفيق في المتابعة.', 'Instructions stay available to revisit, and Rafiq stays with them for the follow-up.'),
  },
};

export const screenTitle: Record<ScreenId, L> = {
  welcome: l('الترحيب', 'Welcome'),
  dashboard: l('الرئيسية', 'Home'),
  journey: l('رحلتي', 'My journey'),
  queue: l('الانتظار', 'Queue'),
  doctor: l('الطبيب', 'Doctor'),
  exams: l('الفحوصات', 'Tests'),
  results: l('النتائج', 'Results'),
  meds: l('أدويتي', 'My medications'),
  map: l('الخريطة', 'Map'),
  discharge: l('الخروج', 'Discharge'),
  more: l('المزيد', 'More'),
};
