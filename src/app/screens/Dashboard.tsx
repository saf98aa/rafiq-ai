import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Icon from '../../components/Icon';
import { companion, doctor, l, patient, STAGE, stages } from '../../data/content';
import { ListenBar } from '../../voice/VoiceUI';
import { useStore } from '../../store';
import { actionsFor, aheadText, minutesText, stageStatus } from '../journeyUtil';
import { Avatar, Badge, Roll, Section, rise, stagger } from '../ui';
import { HeaderTools } from '../DisplayPanel';

export default function Dashboard() {
  const { t, stage, queue, blood, go, openMap, setFocus, lang, role, admitted, requests } = useStore();
  const cur = stages[Math.min(stage, stages.length - 1)];
  const done = stage >= STAGE.complete;
  const pct = Math.round((Math.min(stage, 8) / 8) * 100);
  const actions = actionsFor(stage, queue.ahead);
  const rail = useRef<HTMLDivElement>(null);

  // keep the current stage in view on the horizontal journey rail
  useEffect(() => {
    const el = rail.current?.querySelector('.is-current, .is-action') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [stage, lang]);

  return (
    <motion.div className="screen dash" variants={stagger} initial="hidden" animate="show">
      <div className="dash__hero">
        <div className="dash__hero-bg" />
        <motion.div className="dash__hello" variants={rise}>
          <Avatar src={role === 'companion' ? companion.avatar : patient.avatar} size={48} ring />
          <div>
            <h1>
              {t(l('مرحبًا بك،', 'Welcome,'))} {t(role === 'companion' ? companion.name : patient.first)}
            </h1>
            <p>
              {role === 'companion'
                ? t(l(`أنتِ ترافقين ${patient.first.ar} في زيارته اليوم.`, `You're accompanying ${patient.first.en} on today's visit.`))
                : t(l('نتمنى لك رحلة صحية ميسّرة.', 'We wish you a smooth healthcare journey.'))}
            </p>
          </div>
          <div className="dash__tools">
            <HeaderTools />
          </div>
        </motion.div>
        <motion.div className="dash__listen" variants={rise}>
          <ListenBar line="screen.dashboard" />
        </motion.div>

        <motion.article className="visit" variants={rise}>
          <div className="visit__top">
            <div>
              <small>{t(l('رقم الزيارة', 'Visit number'))}</small>
              <b className="visit__id" dir="ltr">
                {patient.visit}
              </b>
            </div>
            <Badge s={done ? 'done' : 'current'} label={done ? l('زيارة مكتملة', 'Visit complete') : l('زيارة نشطة', 'Active visit')} />
          </div>
          <div className="visit__meta">
            <span>
              <Icon name="desk" size={15} />
              {t(patient.hospital)}
            </span>
            <span>
              <Icon name="calendar" size={15} />
              {t(patient.date)} · {patient.appt}
            </span>
          </div>
          <div className="visit__grid">
            <button className="visit__cell" onClick={() => go('journey')}>
              <small>{t(l('المرحلة الحالية', 'Current stage'))}</small>
              <b>
                <Icon name={done ? 'checkCircle' : cur.icon} size={16} />
                {done ? t(l('اكتملت الرحلة', 'Journey complete')) : t(cur.title)}
              </b>
            </button>
            <button className="visit__cell" onClick={() => go('doctor')}>
              <small>{t(l('طبيبك', 'Your doctor'))}</small>
              <b>
                <Avatar src={doctor.avatar} size={20} />
                {t(doctor.name)}
              </b>
            </button>
          </div>
          <div className="visit__progress">
            <div className="visit__bar">
              <motion.i initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }} />
            </div>
            <span>
              <Roll value={`${pct}%`} />
            </span>
          </div>
        </motion.article>
      </div>

      {stage === STAGE.waiting && (
        <motion.button className="live" variants={rise} onClick={() => go('queue')}>
          <span className="live__dot" />
          <div>
            <b>{t(aheadText(queue.ahead))}</b>
            <small>
              {t(l('الوقت المتوقع:', 'Estimated:'))} {t(minutesText(queue.ahead * 5))} · {t(l('محاكاة', 'simulated'))}
            </small>
          </div>
          <Icon name="chevron" size={18} className="flip-rtl" />
        </motion.button>
      )}

      <motion.div variants={rise}>
        <Section
          title={l('رحلتك اليوم', 'Your journey today')}
          action={
            <button className="sec__link" onClick={() => go('journey')}>
              {t(l('عرض الكل', 'View all'))}
            </button>
          }
        >
          <div className="rail" ref={rail}>
            {stages.map((s, i) => {
              const st = stageStatus(i, stage, blood);
              return (
                <button
                  key={s.id}
                  className={`rail__item is-${st}`}
                  onClick={() => {
                    setFocus(i);
                    go('journey');
                  }}
                >
                  <span className="rail__node">
                    <Icon name={st === 'done' ? 'check' : s.icon} size={16} stroke={st === 'done' ? 2.6 : 1.8} />
                  </span>
                  <span className="rail__label">{t(s.title)}</span>
                  {i < stages.length - 1 && <i className="rail__line" />}
                </button>
              );
            })}
          </div>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('ماذا تحتاج الآن؟', 'What do you need now?')}>
          <div className="actions">
            {actions.map((a, i) => (
              <motion.button
                key={`${stage}-${i}`}
                className={`action ${a.tone === 'primary' ? 'action--primary' : ''}`}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                onClick={() => (a.dest ? openMap(a.dest) : a.screen && go(a.screen))}
              >
                <span className="action__ic">
                  <Icon name={a.icon} size={20} />
                </span>
                <span className="action__txt">
                  <b>{t(a.title)}</b>
                  <small>{t(a.sub)}</small>
                </span>
                <Icon name="chevron" size={16} className="action__chev flip-rtl" />
              </motion.button>
            ))}
          </div>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('أثناء التنويم', 'During a hospital stay')}>
          <button className="action action--inp" onClick={() => go('inpatient')}>
            <span className="action__ic">
              <Icon name="bed" size={20} />
            </span>
            <span className="action__txt">
              <b>{t(l('طلبات التنويم', 'Inpatient requests'))}</b>
              <small>
                {admitted
                  ? requests.length
                    ? t(l(`لديك ${requests.length === 1 ? 'طلب واحد' : requests.length === 2 ? 'طلبان' : `${requests.length} طلبات`}`, `${requests.length} request${requests.length > 1 ? 's' : ''}`))
                    : t(l('التمريض، العلاج الطبيعي، وخدمات أخرى', 'Nursing, physical therapy and other services'))
                  : t(l('تظهر عند التنويم — جرّب المحاكاة', 'Available once admitted — try the simulation'))}
              </small>
            </span>
            <Icon name="chevron" size={16} className="action__chev flip-rtl" />
          </button>
        </Section>
      </motion.div>
    </motion.div>
  );
}
