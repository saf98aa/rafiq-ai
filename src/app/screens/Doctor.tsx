import { motion } from 'framer-motion';
import Icon from '../../components/Icon';
import { doctor, l, nurse, STAGE } from '../../data/content';
import { useStore } from '../../store';
import { aheadText } from '../journeyUtil';
import { Avatar, Badge, DemoButton, Header, Section, rise, stagger } from '../ui';

const PREP = [
  { icon: 'id', t: l('أحضر بطاقة الهوية الوطنية أو الإقامة.', 'Bring your national ID or residency card.') },
  { icon: 'pill', t: l('جهّز قائمة بالأدوية التي تستخدمها حاليًا.', 'Have a list of the medications you currently take.') },
  { icon: 'chat', t: l('دوّن أسئلتك حتى لا تنساها أثناء الاستشارة.', 'Write down your questions so you do not forget them.') },
];

export default function Doctor() {
  const { t, stage, queue, setStage, go, openMap } = useStore();
  const before = stage < STAGE.consultation;
  const now = stage === STAGE.consultation;

  return (
    <motion.div className="screen" variants={stagger} initial="hidden" animate="show">
      <Header title={l('الطبيب والاستشارة', 'Doctor & consultation')} />

      <motion.div className="doc" variants={rise}>
        <div className="doc__bg" />
        <Avatar src={doctor.avatar} size={84} ring />
        <h2>{t(doctor.name)}</h2>
        <p>{t(doctor.specialty)}</p>
        <div className="doc__chips">
          <span>
            <Icon name="stethoscope" size={14} />
            {t(doctor.clinic)}
          </span>
          <span>
            <Icon name="pin" size={14} />
            {t(doctor.floor)}
          </span>
        </div>
      </motion.div>

      <motion.div className="appt" variants={rise}>
        <div>
          <small>{t(l('حالة الموعد', 'Appointment status'))}</small>
          <b>{before ? t(aheadText(queue.ahead)) : now ? t(l('الاستشارة جارية الآن', 'Consultation in progress')) : t(l('تمّت الاستشارة', 'Consultation completed'))}</b>
        </div>
        <Badge s={before ? 'upcoming' : now ? 'current' : 'done'} label={before ? l(`موعدك 09:30`, 'Appt 09:30') : undefined} />
      </motion.div>

      <motion.div variants={rise}>
        <Section title={before ? l('قبل الاستشارة', 'Before your consultation') : l('تعليمات الاستشارة', 'Consultation notes')}>
          <ul className="checklist">
            {PREP.map((p, i) => (
              <li key={i}>
                <span>
                  <Icon name={p.icon} size={17} />
                </span>
                {t(p.t)}
              </li>
            ))}
          </ul>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('الخطوات التالية', 'Next steps')}>
          <div className="nexts">
            {before && (
              <button className="nextcard" onClick={() => go('queue')}>
                <Icon name="clock" size={18} />
                <span>
                  <b>{t(l('تابع دورك', 'Follow your turn'))}</b>
                  <small>{t(l('سنخبرك عندما يحين وقت الدخول', "We'll tell you when it's time to go in"))}</small>
                </span>
              </button>
            )}
            <button className="nextcard" onClick={() => openMap('clinics')}>
              <Icon name="nav" size={18} />
              <span>
                <b>{t(l('الطريق إلى العيادة', 'Route to the clinic'))}</b>
                <small>{t(doctor.clinic)}</small>
              </span>
            </button>
            {!before && (
              <button className="nextcard" onClick={() => go('exams')}>
                <Icon name="flask" size={18} />
                <span>
                  <b>{t(l('الفحوصات المطلوبة', 'Requested tests'))}</b>
                  <small>{stage >= STAGE.exams ? t(l('طلب طبيبك فحصين', 'Your doctor requested two tests')) : t(l('تظهر بعد الاستشارة', 'Shown after the consultation'))}</small>
                </span>
              </button>
            )}
          </div>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('فريق رعايتك', 'Your care team')}>
          <div className="team">
            <div className="team__m">
              <Avatar src={doctor.avatar} size={40} />
              <span>
                <b>{t(doctor.name)}</b>
                <small>{t(l('الطبيبة المعالجة', 'Treating physician'))}</small>
              </span>
            </div>
            <div className="team__m">
              <Avatar src={nurse.avatar} size={40} />
              <span>
                <b>{t(nurse.name)}</b>
                <small>{t(nurse.role)}</small>
              </span>
            </div>
          </div>
        </Section>
      </motion.div>

      <div className="screen__pad stack">
        {now && (
          <DemoButton
            variant="solid"
            onClick={() => {
              setStage(STAGE.exams);
              go('exams');
            }}
          >
            {t(l('انتهاء الاستشارة وطلب الفحوصات', 'End consultation & request tests'))}
          </DemoButton>
        )}
        <button className="btn btn--soft btn--block" onClick={() => go('journey')}>
          <Icon name="route" size={17} />
          {t(l('العودة إلى رحلتي', 'Back to my journey'))}
        </button>
      </div>
    </motion.div>
  );
}
