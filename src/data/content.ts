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
  | 'more'
  | 'voice'
  | 'access'
  | 'inpatient';

export const patient = {
  name: l('عامر', 'Amer'),
  first: l('عامر', 'Amer'),
  age: l('68 سنة', '68 years'),
  visit: 'VIS-0001',
  hospital: l('مستشفى المدينة العام (نموذج تجريبي)', 'Al Madinah General Hospital (demo)'),
  dept: l('العيادات الخارجية — الباطنة', 'Outpatient — Internal Medicine'),
  date: l('الثلاثاء، 10 نوفمبر', 'Tuesday, 10 November'),
  appt: '09:30',
  avatar: './media/people/av_patient.webp',
};

export const companion = {
  name: l('ناجية', 'Najia'),
  relation: l('ابنته ومرافقته', 'His daughter and companion'),
  avatar: './media/people/av_companion.webp',
};

export const doctor = {
  name: l('د. يسرى زكريا', 'Dr. Yusra Zakaria'),
  specialty: l('استشارية الطب الباطني', 'Consultant, Internal Medicine'),
  clinic: l('عيادة الباطنة رقم 4', 'Internal Medicine — Clinic 4'),
  floor: l('الطابق الأرضي — منطقة العيادات', 'Ground floor — clinics area'),
  avatar: './media/people/av_yusra.webp',
};

export const nurse = {
  name: l('الممرضة نجوى', 'Nurse Najwa'),
  role: l('التمريض', 'Nursing'),
  avatar: './media/people/av_najwa.webp',
};

export const pharmacist = {
  name: l('الصيدلي سليمان', 'Pharmacist Suleiman'),
  role: l('صيدلية المستشفى', 'Hospital pharmacy'),
  avatar: './media/people/av_pharmacist.webp',
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
    info: l('موعدك مع د. يسرى زكريا في العيادة رقم 4.', 'Your appointment with Dr. Yusra Zakaria in Clinic 4.'),
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
    name: l('تصوير بالأشعة', 'X-ray imaging'),
    place: l('غرف التصوير التخصصي — الطابق الأرضي', 'Specialized imaging rooms — Ground floor'),
    dest: 'radiology' as const,
    duration: l('15 – 20 دقيقة تقريبًا', 'About 15–20 minutes'),
    prep: l('سيُبلغك قسم الأشعة بأي تحضير مطلوب قبل التصوير.', 'The radiology team will tell you about any preparation needed before imaging.'),
    doneAt: '10:40',
  },
  {
    id: 'blood',
    icon: 'drop',
    name: l('تحليل الدم الشامل', 'Complete blood count'),
    place: l('عينات المعامل — الطابق الأرضي', 'Lab samples — Ground floor'),
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

// ---------- Hospital map: see data/blueprint.ts (built from the real floor plans) ----------
export type { DestId } from './blueprint';

// ---------- "Why this feature?" explanations ----------
export type Explain = { title: L; problem: L; decision: L; value: L; connection: L; beneficiaries?: L };
export const explanations: Partial<Record<ScreenId, Explain>> = {
  welcome: {
    title: l('الدخول المبسّط', 'Simplified onboarding'),
    problem: l(
      'متطلبات التحقق الخارجية قد تمنع الزوار ولجنة التحكيم من استكشاف النموذج الأولي.',
      'External authentication requirements can prevent visitors and the jury from exploring a prototype.'
    ),
    decision: l(
      'دخول فوري إلى زيارة تجريبية، مع اختيار: هل أنت المريض أم مرافقه؟ — دون أي ربط بخدمات تحقق خارجية.',
      'Immediate access to a demo visit, with a choice of patient or companion — and no external authentication service.'
    ),
    value: l('تستطيع اللجنة استكشاف رفيق مباشرة، دون اعتماديات خارجية.', 'The jury can explore Rafiq right away, without external dependencies.'),
    connection: l('بعد الدخول، تفتح لوحة الزيارة لتُظهر أين يقف المريض الآن.', 'After entering, the visit dashboard shows where the patient stands right now.'),
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
    title: l('دليلك الدوائي', 'Medication Guide'),
    problem: l('يعرف المريض اسم الدواء، لكنه لا يعرف لماذا يأخذه، ومتى، وما الذي يتجنّبه — وتضيع التعليمات بين الأوراق والكلام الشفهي.', 'Patients know a medicine’s name but not why, when, or what to avoid — and instructions get lost between paper and verbal advice.'),
    decision: l(
      'يشرح الصيدلي سليمان كل دواء: الغرض، الجرعة، المواعيد في جدول بصري، الطعام، الاحتياطات والتداخلات الموثّقة — من الوصفة والنشرة المعتمدة فقط، مع إحالة كل ما عداه إلى المختص.',
      'Pharmacist Suleiman explains each medicine — purpose, dose, a visual schedule, food, precautions and verified interactions — only from the prescription and approved information, referring everything else to a professional.'
    ),
    value: l('فهم أفضل والتزام أعلى بالدواء، دون أن يشخّص رفيق أو يصف أو يغيّر أي جرعة.', 'Better understanding and adherence — without Rafiq ever diagnosing, prescribing or changing a dose.'),
    connection: l('تصبح الإرشادات جزءًا من ملخص الخروج ومتابعة ما بعد الزيارة.', 'The guidance becomes part of the discharge summary and post-visit follow-up.'),
  },
  map: {
    title: l('خريطة المستشفى التفاعلية', 'Interactive hospital map'),
    problem: l('قد يصعب على المرضى تحديد أقسام المستشفى ومعرفة إلى أين يتجهون.', 'Patients may struggle to identify hospital departments and understand where to go.'),
    decision: l(
      'خريطة تفاعلية مبنية على مخططات معمارية حقيقية، مع مسارات تتبع الممرات الموثقة فقط، وشرح صوتي للمسار — دون ادعاء تحديد موقع فعلي.',
      'An interactive map built on real architectural drawings, with routes that follow only documented corridors and a spoken explanation — without claiming real positioning.'
    ),
    value: l('يعرف المريض وجهته ويفهم المسار المقترح، بالصورة والصوت.', 'Patients identify their destination and understand the suggested route, by sight and by sound.'),
    connection: l('الوجهة تُقترح تلقائيًا حسب المرحلة: الاستقبال، العيادة، ثم المختبر والأشعة.', 'Destinations are suggested by stage: reception, the clinic, then the lab and imaging.'),
  },
  discharge: {
    title: l('الخروج واكتمال الرحلة', 'Discharge & completion'),
    problem: l('كثيرًا ما تنتهي الزيارة فجأة، فيغادر المريض دون صورة واضحة لما بعدها.', 'Visits often end abruptly, and patients leave without a clear picture of what comes next.'),
    decision: l('ختام منظّم يلخّص المراحل المكتملة والتعليمات وموعد المتابعة.', 'An organised close that summarises completed stages, instructions and follow-up.'),
    value: l('يغادر المريض مطمئنًا، ويعرف تمامًا ما المطلوب منه.', 'Patients leave reassured, knowing exactly what is expected of them.'),
    connection: l('تبقى الإرشادات متاحة للعودة إليها، ويستمر رفيق في المتابعة.', 'Instructions stay available to revisit, and Rafiq stays with them for the follow-up.'),
  },
  voice: {
    title: l('رفيق يتحدث معك', 'Rafiq Voice Companion'),
    problem: l('ليس كل المرضى قادرين على قراءة المعلومات المكتوبة أو فهمها بسهولة.', 'Not all patients can comfortably read or understand written information.'),
    decision: l(
      'شرح صوتي لكل صفحة، وأسئلة بالصوت أو باختيار سؤال جاهز، بصوت سعودي واضح وأزرار كبيرة — مع ترجمة نصية لكل ما يُقال.',
      'Spoken explanations for every page and voice questions (or ready-made ones), in a clear Saudi voice with large controls — with captions for everything spoken.'
    ),
    value: l('وصول أسهل للمعلومة، ومريض يفهم رحلته العلاجية بالاستماع.', 'Better accessibility, and patients who understand their healthcare journey by listening.'),
    connection: l('الصوت متصل بكل مرحلة: الانتظار، الخريطة، النتائج، وتعليمات الصيدلية.', 'Voice is connected to every stage: waiting, the map, results and pharmacy instructions.'),
    beneficiaries: l(
      'ذوو الإعاقة البصرية، وكبار السن، ومن يجد صعوبة في القراءة، ومن يفضّل التواصل المسموع.',
      'Visually impaired people, elderly patients, people with low literacy, and patients who prefer spoken communication.'
    ),
  },
  access: {
    title: l('إعدادات الوصول الميسر', 'Accessibility settings'),
    problem: l('تصميم واحد لا يناسب الجميع: الخط الصغير والتباين المنخفض والحركة الكثيرة تُبعد بعض المرضى.', 'One design does not fit everyone: small text, low contrast and heavy motion shut some patients out.'),
    decision: l('إعدادات واضحة لتكبير الخط، ورفع التباين، وتبسيط الواجهة، وتقليل الحركة، والإرشاد الصوتي.', 'Clear settings for larger text, higher contrast, a simpler interface, reduced motion and voice guidance.'),
    value: l('يكيّف كل مريض رفيق حسب احتياجه، ويستخدمه باستقلالية.', 'Each patient adapts Rafiq to their needs and uses it independently.'),
    connection: l('تنطبق الإعدادات على كل شاشات الرحلة فورًا.', 'The settings apply instantly across every screen of the journey.'),
    beneficiaries: l('كبار السن، وضعاف البصر، ومستخدمو قارئ الشاشة ولوحة المفاتيح.', 'Elderly patients, people with low vision, and screen-reader and keyboard users.'),
  },
  inpatient: {
    title: l('طلبات المريض أثناء التنويم', 'Inpatient Requests'),
    problem: l(
      'المريض المنوَّم لا يعرف دائمًا لمن يتوجّه بطلبه، فيكرّر السؤال أو ينتظر مرور أحد من الطاقم.',
      'Admitted patients do not always know whom to ask, so they repeat questions or wait for someone to pass by.'
    ),
    decision: l(
      'قائمة منظّمة بالطلبات المتاحة حسب حالة المريض وخطة رعايته المعتمدة فقط — التمريض، العلاج الطبيعي، والأقسام الأخرى — مع تأكيد قبل الإرسال وحالة واضحة لكل طلب، وإمكانية الطلب بالصوت.',
      'An organised list of the requests available for this patient’s condition and approved care plan only — nursing, physical therapy and other departments — with a confirmation step, a clear status for each request, and voice support.'
    ),
    value: l('يطلب المريض ما يحتاجه دون بحث عن القسم المسؤول، ويعرف أين وصل طلبه.', 'Patients ask for what they need without hunting for the right department, and can see where their request stands.'),
    connection: l('تبدأ هذه الخدمة عند تنويم المريض، وتبقى مرتبطة بخطة رعايته حتى الخروج.', 'The service starts when the patient is admitted and stays linked to their care plan until discharge.'),
    beneficiaries: l(
      'المرضى المنوّمون وكبار السن، ومن يصعب عليهم الحركة أو القراءة، ومرافقوهم.',
      'Admitted and elderly patients, people who find moving or reading difficult, and their companions.'
    ),
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
  meds: l('دليلك الدوائي', 'Medication Guide'),
  map: l('الخريطة', 'Map'),
  discharge: l('الخروج', 'Discharge'),
  more: l('المزيد', 'More'),
  voice: l('رفيق يتحدث معك', 'Rafiq Voice Companion'),
  access: l('الوصول الميسر', 'Accessibility'),
  inpatient: l('طلبات التنويم', 'Inpatient requests'),
};
