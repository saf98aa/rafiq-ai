import { l, type L, type ScreenId } from '../data/content';

export type StoryMeta = { id: string; kicker: L; title: L; sub?: L; dur: number; voice?: string };

/** The 11-scene narrative. Durations are minimums; a scene also waits for Rafiq to finish speaking. */
export const STORY: StoryMeta[] = [
  { id: 'arrival', kicker: l('الوصول', 'Arrival'), title: l('كل زيارة للمستشفى تبدأ برحلة.', 'Every hospital visit begins with a journey.'), sub: l('لكن ماذا يحدث عندما لا تعرف ما هي خطوتك التالية؟', "But what happens when you don't know your next step?"), dur: 0 },
  { id: 'emergency', kicker: l('الطوارئ والاستقبال', 'Emergency & reception'), title: l('الطوارئ والاستقبال… حركة لا تتوقف.', 'Emergency and reception — constant motion.'), sub: l('مرضى ومراجعون وموظفون، وكلٌّ يبحث عن وجهته.', 'Patients, visitors and staff — everyone looking for where to go.'), dur: 9000 },
  { id: 'challenge', kicker: l('التحدي', 'The challenge'), title: l('محمد، ٦٨ عامًا، ترافقه ابنته ريم.', 'Mohammed, 68, with his daughter Reem.'), sub: l('لا يعرفان أين يذهبان، ولا متى يحين الدور.', "They don't know where to go, or when his turn will come."), dur: 10000 },
  { id: 'meet', kicker: l('تعرّف على رفيق', 'Meet Rafiq'), title: l('تعرّف على رفيق. مرافقك الذكي في رحلتك الصحية.', 'Meet Rafiq. Your intelligent companion through your healthcare journey.'), sub: l('يجمع رفيق مراحل رحلتك الصحية في تجربة واحدة واضحة وسهلة.', 'Rafiq brings every stage of your journey into one clear, simple experience.'), dur: 7000, voice: 'story.meet' },
  { id: 'voice', kicker: l('رفيق يتحدث معك', 'Rafiq Voice Companion'), title: l('رفيق يتحدث معك.', 'Rafiq speaks with you.'), sub: l('شرح صوتي واضح لكبار السن وذوي الإعاقة البصرية ومن يصعب عليهم القراءة.', 'Clear spoken guidance for elderly patients, visually impaired people, and anyone who finds reading hard.'), dur: 7000, voice: 'story.voice' },
  { id: 'nav', kicker: l('الملاحة داخل المستشفى', 'Hospital navigation'), title: l('من مخطط معماري حقيقي… إلى خريطة تفاعلية.', 'From a real architectural plan… to an interactive map.'), sub: l('يبرز رفيق الوجهة ويشرح المسار بالصوت.', 'Rafiq highlights the destination and explains the route out loud.'), dur: 8000, voice: 'route.lab' },
  { id: 'consult', kicker: l('الاستشارة', 'Consultation'), title: l('د. سارة العتيبي والممرضة نورة.', 'Dr. Sara Alotaibi and Nurse Noura.'), sub: l('يدخل محمد الاستشارة وهو يعرف من سيقابل وماذا يُحضّر.', "Mohammed walks into the consultation knowing whom he'll meet and what to prepare."), dur: 8000 },
  { id: 'exams', kicker: l('الفحوصات', 'Examinations'), title: l('خالد في المختبر، وعمر في الأشعة.', 'Khalid in the lab, Omar in radiology.'), sub: l('يعرف محمد مكان كل فحص وحالته، ورفيق يدلّه على الطريق.', 'Mohammed knows where each test is and its status — Rafiq shows the way.'), dur: 7000, voice: 'story.exams' },
  { id: 'results', kicker: l('النتائج', 'Results'), title: l('النتائج جاهزة… والتفسير عند الطبيبة.', 'Results are ready — the explanation comes from the doctor.'), sub: l('يعرض رفيق حالة النتائج والخطوة التالية، دون أي تفسير طبي آلي.', 'Rafiq shows the result status and the next step — with no automated medical interpretation.'), dur: 7000, voice: 'story.results' },
  { id: 'pharmacy', kicker: l('الصيدلية', 'Pharmacy'), title: l('الصيدلي يوسف… ورفيق يقرأ التعليمات كما هي.', 'Pharmacist Yousef — and Rafiq reads the instructions exactly as given.'), sub: l('تعليمات معتمدة، بصوت واضح، دون أي تعديل على الوصفة.', 'Verified instructions, in a clear voice, with no change to the prescription.'), dur: 7000, voice: 'med.m1' },
  { id: 'done', kicker: l('اكتمال الرحلة', 'Journey complete'), title: l('اكتملت رحلتك الصحية.', 'Your healthcare journey is complete.'), sub: l('محمد وريم يغادران وهما يعرفان ما حدث، وما الخطوة القادمة.', 'Mohammed and Reem leave knowing what happened — and what comes next.'), dur: 0, voice: 'story.done' },
];

export type Problem = { id: string; icon: string; title: L; body: L; fix: L; screen: ScreenId; x: number; y: number };

/** Challenge-scene hotspots (positions are % of the scene frame). */
export const PROBLEMS: Problem[] = [
  { id: 'next', icon: 'help', x: 0.28, y: 0.3, title: l('لا يعرف الخطوة التالية', "Doesn't know the next step"), body: l('سجّل محمد وصوله، ولم يخبره أحد بما سيحدث بعد ذلك.', 'Mohammed has checked in, but no one has told him what comes next.'), fix: l('رحلتي — كل المراحل في خط زمني واحد', 'My Journey — every stage on one timeline'), screen: 'journey' },
  { id: 'wait', icon: 'clock', x: 0.72, y: 0.24, title: l('انتظار غير واضح', 'Unclear waiting'), body: l('لا يعرف كم مريضًا قبله ولا كم سينتظر.', "He can't tell how many people are ahead of him or how long it will take."), fix: l('شاشة الانتظار — ترتيبك والوقت المتوقع', 'Queue — your position and estimated time'), screen: 'queue' },
  { id: 'way', icon: 'map', x: 0.2, y: 0.62, title: l('صعوبة الوصول للقسم', 'Hard to find the department'), body: l('ممرات متشابهة ولافتات كثيرة… أين المختبر؟', 'Similar corridors, many signs… where is the lab?'), fix: l('الخريطة التفاعلية — من المخطط الحقيقي', 'Interactive map — from the real plan'), screen: 'map' },
  { id: 'read', icon: 'eye', x: 0.78, y: 0.58, title: l('صعوبة قراءة التعليمات', 'Hard to read instructions'), body: l('الخط صغير، والتعليمات كثيرة، ونظره لم يعد كما كان.', 'Small print, lots of instructions, and his eyesight is not what it was.'), fix: l('رفيق يتحدث معك — شرح صوتي لكل صفحة', 'Rafiq Voice Companion — every page, spoken'), screen: 'voice' },
];

export const QUESTIONS = [l('وين أروح الآن؟', 'Where do I go now?'), l('متى دوري؟', "When's my turn?"), l('وين المختبر؟', "Where's the lab?"), l('وش أسوي بعدها؟', 'What do I do next?')];
