import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import Icon from '../../components/Icon';
import { doctor, l, STAGE, stages } from '../../data/content';
import { useStore } from '../../store';
import { aheadText, minutesText } from '../journeyUtil';
import { Avatar, DemoButton, Header, Notice, Roll } from '../ui';

export default function Queue() {
  const { t, queue, advanceQueue, stage, setStage, go, openMap } = useStore();
  const waiting = stage <= STAGE.waiting;
  const turn = waiting && queue.ahead === 0;
  const total = 3;
  const progress = waiting ? (total - queue.ahead) / total : 1;
  const C = 2 * Math.PI * 88;

  // gentle live ticking while the patient watches the screen (stops one before their turn)
  useEffect(() => {
    if (!waiting || queue.ahead <= 1) return;
    const id = window.setTimeout(advanceQueue, 14000);
    return () => window.clearTimeout(id);
  }, [waiting, queue.ahead, advanceQueue]);

  const status = !waiting ? l('اكتمل الانتظار', 'Waiting complete') : turn ? l('حان دورك', "It's your turn") : queue.ahead === 1 ? l('دورك التالي', "You're next") : l('في الانتظار', 'Waiting');

  return (
    <div className="screen">
      <Header title={l('وقت الانتظار', 'Waiting time')} sub={doctor.clinic} />

      <div className={`qhero ${turn ? 'is-turn' : ''}`}>
        <div className="qhero__ring">
          <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" className="qhero__track" />
            <motion.circle
              cx="100"
              cy="100"
              r="88"
              className="qhero__prog"
              strokeDasharray={C}
              animate={{ strokeDashoffset: C * (1 - progress) }}
              transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </svg>
          <div className="qhero__center">
            {waiting && !turn ? (
              <>
                <small>{t(l('أمامك', 'Ahead of you'))}</small>
                <Roll value={queue.ahead} className="qhero__big" />
                <small>{t(queue.ahead === 1 ? l('مريض', 'patient') : queue.ahead === 2 ? l('مريضان', 'patients') : l('مرضى', 'patients'))}</small>
              </>
            ) : (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} className="qhero__done">
                <Icon name={turn ? 'bell' : 'check'} size={44} stroke={2.2} />
              </motion.div>
            )}
          </div>
          <span className="qhero__live">
            <i />
            {t(l('مباشر', 'Live'))}
          </span>
        </div>

        <h2 className="qhero__title">{t(waiting ? aheadText(queue.ahead) : l('انتهى الانتظار', 'Your wait is over'))}</h2>
        <p className="qhero__sub">{waiting ? `${t(l('الوقت المتوقع:', 'Estimated time:'))} ${t(minutesText(Math.max(queue.ahead * 5, 0)))}` : `${t(l('مرحلتك الآن:', 'Your current stage:'))} ${t(stages[Math.min(stage, 7)].title)}`}</p>
      </div>

      <div className="qstats">
        <div>
          <small>{t(l('رقمك', 'Your number'))}</small>
          <b dir="ltr">A-0{queue.mine}</b>
        </div>
        <div>
          <small>{t(l('يُخدم الآن', 'Now serving'))}</small>
          <b dir="ltr">
            <Roll value={`A-0${queue.serving}`} />
          </b>
        </div>
        <div>
          <small>{t(l('الحالة', 'Status'))}</small>
          <b className={turn ? 'ok' : ''}>{t(status)}</b>
        </div>
      </div>

      <div className="qline" aria-hidden="true">
        {Array.from({ length: total + 1 }).map((_, i) => {
          const isMe = i === total;
          const served = waiting ? i < total - queue.ahead : true;
          return (
            <motion.span key={i} className={`qline__p ${isMe ? 'is-me' : ''} ${served && !isMe ? 'is-served' : ''}`} layout>
              <Icon name="user" size={16} />
            </motion.span>
          );
        })}
      </div>

      <AnimatePresence>
        {turn && (
          <motion.div className="turn" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
            <b>{t(l('حان دورك! توجّه إلى العيادة رقم 4', "It's your turn! Please go to Clinic 4"))}</b>
            <small>{t(doctor.floor)}</small>
            <div className="turn__btns">
              <button className="btn btn--white" onClick={() => openMap('clinics')}>
                <Icon name="nav" size={16} />
                {t(l('الاتجاهات', 'Directions'))}
              </button>
              <button
                className="btn btn--white-ghost"
                onClick={() => {
                  setStage(STAGE.consultation);
                  go('doctor');
                }}
              >
                {t(l('بدء الاستشارة', 'Start consultation'))}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="doc-row" onClick={() => go('doctor')}>
        <Avatar src={doctor.avatar} size={42} />
        <span>
          <b>{t(doctor.name)}</b>
          <small>
            {t(doctor.specialty)}
          </small>
        </span>
        <Icon name="chevron" size={16} className="flip-rtl" />
      </button>

      {waiting && !turn && (
        <div className="screen__pad">
          <DemoButton onClick={advanceQueue}>{t(l('تقدّم الدور', 'Advance the queue'))}</DemoButton>
        </div>
      )}

      <div className="screen__pad">
        <Notice>{t(l('الأوقات والأرقام تقديرية ومحاكاة لأغراض العرض، وليست بيانات فعلية من المستشفى.', 'Times and numbers are estimates simulated for this demo, not real hospital data.'))}</Notice>
      </div>
    </div>
  );
}
