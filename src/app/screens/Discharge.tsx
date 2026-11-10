import { motion } from 'framer-motion';
import Icon from '../../components/Icon';
import { doctor, l, STAGE, stages } from '../../data/content';
import { useStore } from '../../store';
import { DemoButton, Empty, Header, Section, rise, stagger } from '../ui';

export default function Discharge() {
  const { t, stage, setStage, go, goScene } = useStore();

  if (stage < STAGE.discharge) {
    return (
      <div className="screen">
        <Header title={l('الخروج', 'Discharge')} />
        <Empty
          icon="flag"
          title={l('رحلتك لم تكتمل بعد', 'Your journey is still in progress')}
          body={l('سيظهر هنا ملخص زيارتك وتعليماتك ومواعيد المتابعة عند الوصول إلى مرحلة الخروج.', 'Your visit summary, instructions and follow-up will appear here once you reach the discharge stage.')}
        >
          <button className="btn btn--soft" onClick={() => go('journey')}>
            <Icon name="route" size={16} />
            {t(l('عرض رحلتي', 'View my journey'))}
          </button>
          <DemoButton onClick={() => setStage(STAGE.discharge)}>{t(l('الانتقال إلى مرحلة الخروج', 'Jump to discharge'))}</DemoButton>
        </Empty>
      </div>
    );
  }

  const complete = stage >= STAGE.complete;

  return (
    <motion.div className="screen" variants={stagger} initial="hidden" animate="show">
      <Header title={l('الخروج واكتمال الرحلة', 'Discharge & completion')} />

      <motion.div className={`finish ${complete ? 'is-complete' : ''}`} variants={rise}>
        <div className="finish__mark">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" className="finish__track" />
            <motion.circle cx="60" cy="60" r="52" className="finish__ring" initial={{ pathLength: 0 }} animate={{ pathLength: complete ? 1 : 7 / 8 }} transition={{ duration: 1.4, ease: [0.3, 0, 0.2, 1] }} />
          </svg>
          <motion.span key={String(complete)} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 240, damping: 13 }}>
            <Icon name={complete ? 'check' : 'flag'} size={40} stroke={2.4} />
          </motion.span>
          {complete && (
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <i key={i} style={{ '--a': `${(i / 14) * 360}deg`, '--d': `${0.2 + (i % 4) * 0.08}s` } as React.CSSProperties} />
              ))}
            </div>
          )}
        </div>
        <h2>{complete ? t(l('اكتملت رحلتك الصحية.', 'Your healthcare journey is complete.')) : t(l('خروجك قيد الاعتماد', 'Your discharge is being approved'))}</h2>
        <p>{complete ? t(l('تم اعتماد خروجك — 12:20', 'Discharge approved — 12:20')) : t(l('يراجع فريق الرعاية ملخص زيارتك الآن.', 'Your care team is reviewing your visit summary.'))}</p>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('المراحل المكتملة', 'Completed stages')}>
          <ul className="donelist">
            {stages.map((s, i) => {
              const ok = i < stage;
              return (
                <li key={s.id} className={ok ? 'is-ok' : ''}>
                  <i>{ok ? <Icon name="check" size={12} stroke={3} /> : null}</i>
                  <span>{t(s.title)}</span>
                  <small dir="ltr">{s.time}</small>
                </li>
              );
            })}
          </ul>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('ما بعد الزيارة', 'After your visit')}>
          <div className="nexts">
            <button className="nextcard" onClick={() => go('meds')}>
              <Icon name="pill" size={18} />
              <span>
                <b>{t(l('التعليمات المتاحة', 'Available instructions'))}</b>
                <small>{t(l('إرشادات الأدوية من فريق الرعاية', 'Medication guidance from your care team'))}</small>
              </span>
            </button>
            <div className="nextcard">
              <Icon name="calendar" size={18} />
              <span>
                <b>{t(l('موعد المتابعة', 'Follow-up appointment'))}</b>
                <small>
                  {t(l('الأحد 22 نوفمبر · 10:00 —', 'Sunday 22 November · 10:00 —'))} {t(doctor.clinic)}
                </small>
                <em>{t(l('بيانات تجريبية', 'Sample data'))}</em>
              </span>
            </div>
            <button className="nextcard" onClick={() => go('results')}>
              <Icon name="file" size={18} />
              <span>
                <b>{t(l('نتائجك', 'Your results'))}</b>
                <small>{t(l('متاحة للرجوع إليها في أي وقت', 'Available to revisit anytime'))}</small>
              </span>
            </button>
          </div>
        </Section>
      </motion.div>

      <div className="screen__pad stack">
        {!complete ? (
          <DemoButton variant="solid" onClick={() => setStage(STAGE.complete)}>
            {t(l('اعتماد الخروج', 'Approve discharge'))}
          </DemoButton>
        ) : (
          <>
            <motion.p className="thanks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              {t(l('شكرًا لثقتك برفيق.', 'Thank you for trusting Rafiq.'))}
            </motion.p>
            <button className="btn btn--primary btn--block btn--lg" onClick={() => goScene('closing')}>
              <Icon name="sparkle" size={18} />
              {t(l('إنهاء التجربة', 'Finish the experience'))}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
