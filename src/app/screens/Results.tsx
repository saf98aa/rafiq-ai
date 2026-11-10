import { motion } from 'framer-motion';
import { useState } from 'react';
import Icon from '../../components/Icon';
import { doctor, exams, l, STAGE, type L } from '../../data/content';
import { useStore } from '../../store';
import { Badge, DemoButton, Empty, Header, Notice, Sheet, rise, stagger, type Status } from '../ui';

const RESULT_TIME: Record<string, string> = { xray: '11:20', blood: '11:45' };

export default function Results() {
  const { t, stage, setStage, examStatus, go } = useStore();
  const [sel, setSel] = useState<string | null>(null);

  if (stage < STAGE.exams) {
    return (
      <div className="screen">
        <Header title={l('النتائج', 'Results')} />
        <Empty icon="file" title={l('لا توجد نتائج بعد', 'No results yet')} body={l('عندما يطلب طبيبك فحوصات، ستتابع هنا حالة نتائجها ومتى تصبح متاحة.', 'When your doctor requests tests, you will follow their result status here.')}>
          <DemoButton onClick={() => setStage(STAGE.results)}>{t(l('الانتقال إلى مرحلة النتائج', 'Jump to the results stage'))}</DemoButton>
        </Empty>
      </div>
    );
  }

  const released = stage >= STAGE.results;
  const rows = exams.map((e) => {
    const es = examStatus(e.id);
    let s: Status;
    let label: L;
    if (released) {
      s = 'available';
      label = l('متاحة', 'Available');
    } else if (e.id === 'xray') {
      s = 'progress';
      label = l('قيد إعداد التقرير', 'Report in preparation');
    } else {
      s = 'pending';
      label = es === 'pending' ? l('بانتظار سحب العينة', 'Awaiting sample') : es === 'progress' ? l('قيد التحليل', 'Being analysed') : l('قيد إعداد التقرير', 'Report in preparation');
    }
    return { e, s, label };
  });
  const r = rows.find((x) => x.e.id === sel);

  return (
    <div className="screen">
      <Header title={l('النتائج', 'Results')} sub={released ? l('نتيجتان متاحتان', 'Two results available') : l('بانتظار الاعتماد', 'Awaiting release')} />

      <motion.div className="reslist" variants={stagger} initial="hidden" animate="show">
        {rows.map(({ e, s, label }) => (
          <motion.button key={e.id} variants={rise} className={`rescard is-${s}`} onClick={() => setSel(e.id)} whileTap={{ scale: 0.98 }}>
            <span className="rescard__ic">
              <Icon name={s === 'available' ? 'file' : 'clock'} size={20} />
            </span>
            <span className="rescard__t">
              <b>{t(e.name)}</b>
              <small dir="auto">{released ? `${t(l('اليوم', 'Today'))} · ${RESULT_TIME[e.id]}` : t(l('الوقت المتوقع: خلال اليوم', 'Expected: later today'))}</small>
            </span>
            <Badge s={s} label={label} />
          </motion.button>
        ))}
      </motion.div>

      <div className="screen__pad">
        <Notice icon="stethoscope" tone="calm">
          {t(
            l(
              'رفيق يعرض حالة النتائج وتوقيتها فقط. تفسير النتائج وما يترتب عليها يتم مع طبيبك أو المختص.',
              'Rafiq shows result status and timing only. Interpretation and next medical steps happen with your doctor or a healthcare professional.'
            )
          )}
        </Notice>
      </div>

      <div className="screen__pad stack">
        {stage === STAGE.results && (
          <DemoButton
            variant="solid"
            onClick={() => {
              setStage(STAGE.discharge);
              go('meds');
            }}
          >
            {t(l('مراجعة النتائج مع الطبيب وإصدار الإرشادات', 'Review results with the doctor & issue guidance'))}
          </DemoButton>
        )}
        {stage > STAGE.results && (
          <button className="btn btn--primary btn--block" onClick={() => go('meds')}>
            <Icon name="pill" size={18} />
            {t(l('إرشادات الأدوية', 'Medication guidance'))}
          </button>
        )}
      </div>

      <Sheet open={!!r} onClose={() => setSel(null)} title={r ? t(r.e.name) : ''}>
        {r && (
          <div className="detail">
            <div className="detail__head">
              <span className={`detail__ic is-${r.s}`}>
                <Icon name="file" size={22} />
              </span>
              <div>
                <h3>{t(r.e.name)}</h3>
                <Badge s={r.s} label={r.label} />
              </div>
            </div>
            {r.s === 'available' ? (
              <>
                <div className="doc-preview" aria-label={t(l('معاينة التقرير', 'Report preview'))}>
                  <div className="doc-preview__head">
                    <b>{t(r.e.name)}</b>
                    <span dir="ltr">VIS-0001 · {RESULT_TIME[r.e.id]}</span>
                  </div>
                  <i />
                  <i />
                  <i className="s" />
                  <i />
                  <i className="s" />
                  <span className="doc-preview__lock">
                    <Icon name="lock" size={16} />
                    {t(l('يُعرض التقرير الكامل بعد مراجعة الطبيب', 'Full report shown after doctor review'))}
                  </span>
                </div>
                <dl className="kv">
                  <div>
                    <dt>{t(l('تاريخ الصدور', 'Released'))}</dt>
                    <dd>
                      {t(l('اليوم', 'Today'))} · <span dir="ltr">{RESULT_TIME[r.e.id]}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>{t(l('الخطوة التالية', 'Next step'))}</dt>
                    <dd>{t(l(`ستناقش ${doctor.name.ar} النتيجة معك وتوضّح ما يلزم.`, `${doctor.name.en} will discuss the result with you and explain what it means.`))}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <dl className="kv">
                <div>
                  <dt>{t(l('الحالة', 'Status'))}</dt>
                  <dd>{t(r.label)}</dd>
                </div>
                <div>
                  <dt>{t(l('ماذا أفعل الآن؟', 'What should I do?'))}</dt>
                  <dd>{t(l('لا يلزمك أي إجراء. سيصلك تحديث في رفيق فور صدور النتيجة.', 'No action needed. Rafiq will update you as soon as the result is released.'))}</dd>
                </div>
              </dl>
            )}
            <Notice icon="info">{t(l('بيانات تجريبية. لا يقدّم رفيق تشخيصًا أو تفسيرًا طبيًا.', 'Sample data. Rafiq does not provide diagnoses or medical interpretation.'))}</Notice>
          </div>
        )}
      </Sheet>
    </div>
  );
}
