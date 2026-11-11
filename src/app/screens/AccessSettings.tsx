import { motion } from 'framer-motion';
import Icon from '../../components/Icon';
import { l, type L } from '../../data/content';
import { A11Y_DEFAULT, useStore, type A11y } from '../../store';
import { SpeedSelect, VoiceLangSelect } from '../../voice/VoiceUI';
import { Header, Notice, Section, rise, stagger } from '../ui';
import { Toggle } from './More';

const ROWS: { k: keyof A11y; icon: string; t: L; d: L }[] = [
  { k: 'voiceGuide', icon: 'speaker', t: l('الإرشاد الصوتي', 'Voice guidance'), d: l('يتحدث رفيق عندما تختار وجهة أو تطلب الشرح.', 'Rafiq speaks when you choose a destination or ask for an explanation.') },
  { k: 'autoRead', icon: 'wave', t: l('قراءة الصفحات تلقائيًا', 'Read pages automatically'), d: l('يشرح رفيق كل صفحة عند فتحها. لا يُقرأ أي بيان صحي حسّاس.', 'Rafiq explains each page as it opens. No sensitive health details are read out.') },
  { k: 'large', icon: 'text', t: l('تكبير الخط', 'Larger text'), d: l('نصوص وأزرار أكبر في كل الشاشات.', 'Bigger text and buttons on every screen.') },
  { k: 'contrast', icon: 'contrast', t: l('تباين عالٍ', 'High contrast'), d: l('ألوان أوضح وحدود أقوى لسهولة القراءة.', 'Stronger colours and borders for easier reading.') },
  { k: 'simple', icon: 'simple', t: l('واجهة مبسّطة', 'Simplified interface'), d: l('يُخفي التفاصيل الثانوية ويُبقي الأهم فقط.', 'Hides secondary details and keeps only what matters.') },
  { k: 'motion', icon: 'motion', t: l('تقليل الحركة', 'Reduce motion'), d: l('يوقف الحركات والانتقالات غير الضرورية.', 'Turns off non-essential animation and transitions.') },
  { k: 'labels', icon: 'label', t: l('أسماء واضحة للأزرار', 'Clear button labels'), d: l('يُظهر اسمًا مكتوبًا بجانب الأزرار التي تحمل رمزًا فقط.', 'Shows a written name next to icon-only buttons.') },
  { k: 'announce', icon: 'a11y', t: l('إعلانات قارئ الشاشة', 'Screen-reader announcements'), d: l('يُعلن قارئ الشاشة تغيّر الدور والحالة فورًا.', 'Your screen reader announces queue and status changes as they happen.') },
];

export default function AccessSettings() {
  const { t, a11y, setA11y } = useStore();
  return (
    <motion.div className="screen" variants={stagger} initial="hidden" animate="show">
      <Header title={l('إعدادات الوصول الميسر', 'Accessibility settings')} sub={l('اجعل رفيق مناسبًا لك', 'Make Rafiq work for you')} />

      <motion.div variants={rise}>
        <Section title={l('العرض والقراءة', 'Display & reading')}>
          <div className="settings settings--a11y">
            {ROWS.map((r) => (
              <div key={r.k} className="setting setting--tall">
                <Icon name={r.icon} size={21} />
                <span>
                  {t(r.t)}
                  <small>{t(r.d)}</small>
                </span>
                <Toggle on={a11y[r.k]} onChange={(v) => setA11y({ [r.k]: v })} label={t(r.t)} />
              </div>
            ))}
          </div>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('الصوت', 'Voice')}>
          <div className="settings">
            <div className="setting">
              <Icon name="globe" size={19} />
              <span>{t(l('لغة الصوت', 'Voice language'))}</span>
              <VoiceLangSelect />
            </div>
            <div className="setting">
              <Icon name="wave" size={19} />
              <span>{t(l('سرعة الكلام', 'Speaking speed'))}</span>
              <SpeedSelect />
            </div>
          </div>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('مدعوم دائمًا', 'Always supported')}>
          <ul className="a11y-facts">
            <li>
              <Icon name="a11y" size={18} />
              {t(l('قارئ الشاشة: كل زر وحالة لهما اسم واضح يُقرأ.', 'Screen readers: every button and status has a clear, readable name.'))}
            </li>
            <li>
              <Icon name="keyboard" size={18} />
              {t(l('لوحة المفاتيح: تنقّل بزر Tab، وحدود تركيز واضحة.', 'Keyboard: move with Tab, with clearly visible focus outlines.'))}
            </li>
            <li>
              <Icon name="checkCircle" size={18} />
              {t(l('مؤشرات الحالة مكتوبة بالنص مع الرمز، وليست بالألوان وحدها.', 'Status indicators use text and icons, never colour alone.'))}
            </li>
          </ul>
        </Section>
      </motion.div>

      <div className="screen__pad stack">
        <Notice icon="shield">
          {t(l('لا يقرأ رفيق تلقائيًا أي معلومات صحية حسّاسة بصوت مرتفع. استخدم السماعة في الأماكن العامة.', 'Rafiq never reads sensitive health details aloud automatically. Use earphones in public places.'))}
        </Notice>
        <button className="btn btn--soft btn--block" onClick={() => setA11y(A11Y_DEFAULT)}>
          <Icon name="replay" size={17} />
          {t(l('استعادة الإعدادات الافتراضية', 'Restore default settings'))}
        </button>
      </div>
    </motion.div>
  );
}
