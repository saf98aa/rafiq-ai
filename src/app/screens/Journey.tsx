import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Icon from '../../components/Icon';
import { doctor, l, STAGE, stages, vitals } from '../../data/content';
import { useStore } from '../../store';
import { aheadText, minutesText, stageStatus } from '../journeyUtil';
import { Avatar, Badge, Header, Notice, Sheet, rise, stagger } from '../ui';

export default function Journey() {
  const { t, stage, blood, queue, go, focus, setFocus, openMap } = useStore();
  const [sel, setSel] = useState<number | null>(null);
  const doneCount = Math.min(stage, 8);

  useEffect(() => {
    if (focus !== null) {
      const id = window.setTimeout(() => setSel(focus), 380);
      setFocus(null);
      return () => window.clearTimeout(id);
    }
  }, [focus, setFocus]);

  const s = sel !== null ? stages[sel] : null;
  const st = sel !== null ? stageStatus(sel, stage, blood) : 'upcoming';

  return (
    <div className="screen">
      <Header title={l('رحلتي الصحية', 'My healthcare journey')} sub={l('VIS-0001 · العيادات الخارجية', 'VIS-0001 · Outpatient')} />
      <div className="journey-sum">
        <svg viewBox="0 0 48 48" className="ring">
          <circle cx="24" cy="24" r="20" />
          <motion.circle cx="24" cy="24" r="20" className="ring__p" initial={{ pathLength: 0 }} animate={{ pathLength: doneCount / 8 }} transition={{ duration: 1.1 }} />
        </svg>
        <div>
          <b>
            {doneCount} {t(l('من 8 مراحل مكتملة', 'of 8 stages complete'))}
          </b>
          <small>{stage < STAGE.complete ? `${t(l('الآن:', 'Now:'))} ${t(stages[stage].title)}` : t(l('اكتملت رحلتك', 'Your journey is complete'))}</small>
        </div>
      </div>

      <motion.ol className="tl" variants={stagger} initial="hidden" animate="show">
        {stages.map((x, i) => {
          const status = stageStatus(i, stage, blood);
          return (
            <motion.li key={x.id} variants={rise} className={`tl__item is-${status}`}>
              <button className="tl__btn" onClick={() => setSel(i)}>
                <span className="tl__node">
                  <Icon name={status === 'done' ? 'check' : x.icon} size={17} stroke={status === 'done' ? 2.6 : 1.8} />
                  {(status === 'current' || status === 'action') && <span className="tl__pulse" />}
                </span>
                <span className="tl__body">
                  <span className="tl__row">
                    <b>{t(x.title)}</b>
                    <span className="tl__time" dir="ltr">
                      {x.time}
                    </span>
                  </span>
                  <Badge s={status} />
                  {(status === 'current' || status === 'action') && <span className="tl__next">{t(x.next)}</span>}
                </span>
                <Icon name="chevron" size={16} className="tl__chev flip-rtl" />
              </button>
            </motion.li>
          );
        })}
      </motion.ol>

      <Sheet open={sel !== null} onClose={() => setSel(null)} title={s ? t(s.title) : ''}>
        {s && sel !== null && (
          <motion.div key={s.id} className="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="detail__head">
              <span className={`detail__ic is-${st}`}>
                <Icon name={s.icon} size={22} />
              </span>
              <div>
                <h3>{t(s.title)}</h3>
                <Badge s={st} />
              </div>
            </div>

            <dl className="kv">
              <div>
                <dt>{t(l('الوقت', 'Time'))}</dt>
                <dd dir="ltr">{st === 'upcoming' ? `~ ${s.time}` : s.time}</dd>
              </div>
              <div>
                <dt>{t(l('الحالة', 'Status'))}</dt>
                <dd>{t(s.info)}</dd>
              </div>
            </dl>

            {s.id === 'nursing' && st === 'done' && (
              <>
                <h4 className="detail__sub">{t(l('العلامات الحيوية المسجّلة', 'Recorded vital signs'))}</h4>
                <div className="vitals">
                  {vitals.map((v) => (
                    <div key={v.value} className="vital">
                      <Icon name={v.icon} size={18} />
                      <small>{t(v.label)}</small>
                      <b dir="ltr">{v.value}</b>
                      <i>{t(v.unit)}</i>
                    </div>
                  ))}
                </div>
                <p className="fine">{t(l('قيم توضيحية سجّلها فريق التمريض — بيانات تجريبية.', 'Illustrative values recorded by the nursing team — demo data.'))}</p>
              </>
            )}

            {s.id === 'waiting' && (
              <div className="qmini">
                <div>
                  <small>{t(l('حالة الدور', 'Queue status'))}</small>
                  <b>{t(st === 'done' ? l('انتهى الانتظار', 'Waiting complete') : aheadText(queue.ahead))}</b>
                </div>
                <div>
                  <small>{t(l('الوقت المتوقع', 'Estimated wait'))}</small>
                  <b>{st === 'done' ? '—' : t(minutesText(queue.ahead * 5))}</b>
                </div>
                <div className="qmini__doc">
                  <Avatar src={doctor.avatar} size={34} />
                  <span>
                    <b>{t(doctor.name)}</b>
                    <small>
                      {t(doctor.clinic)} · {t(doctor.floor)}
                    </small>
                  </span>
                </div>
                <p className="fine">{t(l('وقت الانتظار تقديري ومحاكى لأغراض العرض.', 'Waiting time is an estimate simulated for this demo.'))}</p>
              </div>
            )}

            <div className="detail__next">
              <Icon name="sparkle" size={16} />
              <div>
                <small>{t(l('الإجراء المتوقع التالي', 'Next expected action'))}</small>
                <b>{t(s.next)}</b>
              </div>
            </div>

            {st === 'upcoming' && <Notice>{t(l('ستُحدَّث هذه المرحلة تلقائيًا عند الوصول إليها.', 'This stage updates automatically when you reach it.'))}</Notice>}

            <div className="detail__actions">
              {s.id === 'arrival' && (
                <button className="btn btn--primary btn--block" onClick={() => openMap('reception')}>
                  <Icon name="map" size={18} />
                  {t(l('عرض الاستقبال على الخريطة', 'Show reception on the map'))}
                </button>
              )}
              {s.screen && s.id !== 'arrival' && (
                <button className="btn btn--primary btn--block" onClick={() => go(s.screen!)}>
                  {t(l('فتح', 'Open'))} {t(s.title)}
                  <Icon name="arrow" size={17} className="flip-rtl" />
                </button>
              )}
              {(s.id === 'waiting' || s.id === 'consultation') && (
                <button className="btn btn--soft btn--block" onClick={() => openMap('clinics')}>
                  <Icon name="pin" size={17} />
                  {t(l('الاتجاهات إلى العيادة', 'Directions to the clinic'))}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </Sheet>
    </div>
  );
}
