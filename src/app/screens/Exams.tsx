import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Icon from '../../components/Icon';
import { examSteps, exams, l, STAGE, type ExamStatus } from '../../data/content';
import { useStore } from '../../store';
import { Badge, DemoButton, Empty, Header, Notice, Sheet, rise, stagger, type Status } from '../ui';

const stepIndex = (s: ExamStatus) => (s === 'pending' ? 1 : s === 'progress' ? 2 : 4);
const toBadge = (s: ExamStatus): Status => (s === 'done' ? 'done' : s === 'progress' ? 'progress' : 'pending');

export function Steps({ status, vertical = false }: { status: ExamStatus; vertical?: boolean }) {
  const { t } = useStore();
  const at = stepIndex(status);
  return (
    <ol className={`steps ${vertical ? 'steps--v' : ''}`}>
      {examSteps.map((s, i) => (
        <li key={i} className={i < at ? 'is-done' : i === at ? 'is-now' : ''}>
          <i>{i < at ? <Icon name="check" size={11} stroke={3} /> : null}</i>
          <span>{t(s)}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Exams() {
  const { t, stage, setStage, examStatus, advanceBlood, openMap, go } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  const ex = exams.find((e) => e.id === sel);
  const allDone = stage >= STAGE.exams && exams.every((e) => examStatus(e.id) === 'done');

  if (stage < STAGE.exams) {
    return (
      <div className="screen">
        <Header title={l('الفحوصات والتحاليل', 'Tests & examinations')} />
        <Empty
          icon="flask"
          title={l('لم تُطلب فحوصات بعد', 'No tests requested yet')}
          body={l('بعد الاستشارة، ستظهر هنا الفحوصات التي يطلبها طبيبك مع أماكنها وحالتها أولًا بأول.', 'After your consultation, tests requested by your doctor appear here with their location and live status.')}
        >
          <DemoButton onClick={() => setStage(STAGE.exams)}>{t(l('الانتقال إلى مرحلة الفحوصات', 'Jump to the tests stage'))}</DemoButton>
        </Empty>
      </div>
    );
  }

  return (
    <div className="screen">
      <Header title={l('الفحوصات والتحاليل', 'Tests & examinations')} sub={l('طلبها د. سارة العتيبي', 'Requested by Dr. Sara Alotaibi')} />

      <motion.div className="exlist" variants={stagger} initial="hidden" animate="show">
        {exams.map((e) => {
          const s = examStatus(e.id) as ExamStatus;
          return (
            <motion.button key={e.id} variants={rise} className={`excard is-${s}`} onClick={() => setSel(e.id)} whileTap={{ scale: 0.98 }}>
              <div className="excard__top">
                <span className="excard__ic">
                  <Icon name={e.icon} size={22} />
                </span>
                <span className="excard__t">
                  <b>{t(e.name)}</b>
                  <small>
                    <Icon name="pin" size={13} />
                    {t(e.place)}
                  </small>
                </span>
                <Badge s={toBadge(s)} />
              </div>
              <Steps status={s} />
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {allDone && stage === STAGE.exams && (
          <motion.div className="donecard" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Icon name="checkCircle" size={26} />
            <div>
              <b>{t(l('اكتملت فحوصاتك', 'Your tests are complete'))}</b>
              <small>{t(l('ستظهر النتائج في رفيق فور اعتمادها.', 'Results will appear in Rafiq as soon as they are released.'))}</small>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === STAGE.exams && !allDone && (
        <div className="screen__pad">
          <Notice icon="hand">{t(l('اضغط على أي فحص لمعرفة مكانه ومدته وتعليمات التحضير والاتجاهات إليه.', 'Tap any test to see its location, duration, preparation notes and directions.'))}</Notice>
        </div>
      )}

      <div className="screen__pad stack">
        {stage === STAGE.exams && allDone && (
          <DemoButton
            variant="solid"
            onClick={() => {
              setStage(STAGE.results);
              go('results');
            }}
          >
            {t(l('صدور النتائج', 'Release the results'))}
          </DemoButton>
        )}
        {stage > STAGE.exams && (
          <button className="btn btn--primary btn--block" onClick={() => go('results')}>
            <Icon name="file" size={18} />
            {t(l('الاطلاع على النتائج', 'View results'))}
          </button>
        )}
      </div>

      <Sheet open={!!ex} onClose={() => setSel(null)} title={ex ? t(ex.name) : ''}>
        {ex && (
          <div className="detail">
            <div className="detail__head">
              <span className={`detail__ic is-${toBadge(examStatus(ex.id) as ExamStatus)}`}>
                <Icon name={ex.icon} size={22} />
              </span>
              <div>
                <h3>{t(ex.name)}</h3>
                <Badge s={toBadge(examStatus(ex.id) as ExamStatus)} />
              </div>
            </div>
            <Steps status={examStatus(ex.id) as ExamStatus} vertical />
            <dl className="kv">
              <div>
                <dt>{t(l('المكان', 'Location'))}</dt>
                <dd>{t(ex.place)}</dd>
              </div>
              <div>
                <dt>{t(l('المدة المتوقعة', 'Expected duration'))}</dt>
                <dd>{t(ex.duration)}</dd>
              </div>
              <div>
                <dt>{t(l('التحضير', 'Preparation'))}</dt>
                <dd>{t(ex.prep)}</dd>
              </div>
              {examStatus(ex.id) === 'done' && (
                <div>
                  <dt>{t(l('اكتمل في', 'Completed at'))}</dt>
                  <dd dir="ltr">{ex.doneAt}</dd>
                </div>
              )}
            </dl>
            <Notice>{t(l('بعد اكتمال الفحص، ستتابع حالة النتيجة من شاشة النتائج.', 'Once the test is complete, follow the result status on the Results screen.'))}</Notice>
            <div className="detail__actions">
              <button className="btn btn--primary btn--block" onClick={() => openMap(ex.dest)}>
                <Icon name="nav" size={17} />
                {t(l('الاتجاهات إلى', 'Directions to'))} {t(ex.dest === 'lab' ? l('المختبر', 'the lab') : l('الأشعة', 'radiology'))}
              </button>
              {examStatus(ex.id) !== 'done' && (
                <DemoButton onClick={advanceBlood}>
                  {examStatus(ex.id) === 'pending' ? t(l('بدء تنفيذ الفحص', 'Start the test')) : t(l('إتمام الفحص', 'Complete the test'))}
                </DemoButton>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
