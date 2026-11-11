import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Icon from '../../components/Icon';
import { l, medQA, meds, pharmacist, STAGE } from '../../data/content';
import { ListenBar } from '../../voice/VoiceUI';
import { useStore } from '../../store';
import { Avatar, DemoButton, Empty, Header, Notice, Section, rise, stagger } from '../ui';

/** Spoken pharmacy guidance: the pharmacist's verified (demo) instructions, read by Rafiq. */
function PharmacyVoiceGuidance() {
  const { t } = useStore();
  return (
    <div className="pvg">
      <div className="pvg__who">
        <Avatar src={pharmacist.avatar} size={52} ring />
        <div>
          <b>{t(pharmacist.name)}</b>
          <small>{t(pharmacist.role)}</small>
        </div>
        <span className="pvg__ok">
          <Icon name="shield" size={14} />
          {t(l('تعليمات معتمدة (تجريبية)', 'Verified instructions (demo)'))}
        </span>
      </div>
      <p>{t(l('يقرأ لك رفيق تعليمات الصيدلي كما سُجّلت، دون أي إضافة أو تعديل على الوصفة.', "Rafiq reads the pharmacist's instructions exactly as recorded, with no additions or changes to the prescription."))}</p>
      <ListenBar line={['med.intro', ...meds.map((m) => `med.${m.id}`), 'med.outro']} label={l('استمع إلى تعليمات الدواء', 'Listen to the medication instructions')} />
    </div>
  );
}

export default function Meds() {
  const { t, stage, setStage, openMap, go } = useStore();
  const [qa, setQa] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);

  if (stage < STAGE.discharge) {
    return (
      <div className="screen">
        <Header title={l('إرشادات الأدوية', 'Medication guidance')} />
        <Empty
          icon="pill"
          title={l('لا توجد إرشادات دوائية بعد', 'No medication guidance yet')}
          body={l('عندما يعتمد فريق الرعاية وصفتك وتعليماتها، ستجدها هنا بلغة واضحة.', 'Once your care team approves your prescription and its instructions, you will find them here in plain language.')}
        >
          <DemoButton onClick={() => setStage(STAGE.discharge)}>{t(l('الانتقال إلى مرحلة الإرشادات', 'Jump to the guidance stage'))}</DemoButton>
        </Empty>
      </div>
    );
  }

  const ask = (i: number) => {
    setQa(i);
    setTyping(true);
    window.setTimeout(() => setTyping(false), 900);
  };

  return (
    <motion.div className="screen" variants={stagger} initial="hidden" animate="show">
      <Header title={l('إرشادات الأدوية', 'Medication guidance')} sub={l('كما سجّلها فريق رعايتك', 'As recorded by your care team')} />

      <motion.div className="screen__pad" variants={rise}>
        <Notice tone="warn" icon="shield">
          {t(
            l(
              'تعليمات الأدوية الفعلية تصدر عن مقدّم الرعاية المعتمد فقط. البيانات المعروضة تجريبية لأغراض العرض.',
              'Actual medication instructions come only from your authorised healthcare provider. The data shown is sample data for this demo.'
            )
          )}
        </Notice>
      </motion.div>

      <motion.div className="screen__pad" variants={rise}>
        <PharmacyVoiceGuidance />
      </motion.div>

      <div className="meds">
        {meds.map((m) => (
          <motion.article key={m.id} className="med" variants={rise}>
            <div className="med__top">
              <span className="med__ic">
                <Icon name="pill" size={22} />
              </span>
              <div>
                <b>{t(m.name)}</b>
                <small>
                  {t(m.form)} · {t(l('مثال توضيحي', 'Sample'))}
                </small>
              </div>
            </div>
            <dl className="kv kv--tight">
              <div>
                <dt>{t(l('التعليمات', 'Instructions'))}</dt>
                <dd>{t(m.instruction)}</dd>
              </div>
              <div>
                <dt>{t(l('الجدول', 'Schedule'))}</dt>
                <dd>{t(m.schedule)}</dd>
              </div>
              <div>
                <dt>{t(l('من فريق الرعاية', 'From your care team'))}</dt>
                <dd>{t(m.note)}</dd>
              </div>
            </dl>
            <ListenBar line={`med.${m.id}`} label={l('استمع إلى تعليمات هذا الدواء', 'Listen to this medication')} />
            <div className="med__times">
              <Icon name="bell" size={14} />
              {m.times.map((x) => (
                <span key={x} dir="ltr">
                  {x}
                </span>
              ))}
              <small>{t(l('تذكيرات تجريبية', 'Sample reminders'))}</small>
            </div>
          </motion.article>
        ))}
      </div>

      <motion.div variants={rise}>
        <Section title={l('اسأل رفيق', 'Ask Rafiq')}>
          <div className="ask">
            <div className="ask__chips">
              {medQA.map((x, i) => (
                <button key={i} className={`chip ${qa === i ? 'is-on' : ''}`} onClick={() => ask(i)}>
                  {t(x.q)}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {qa !== null && (
                <motion.div key={qa} className="ask__thread" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="msg msg--me">{t(medQA[qa].q)}</p>
                  {typing ? (
                    <p className="msg msg--bot msg--typing">
                      <span className="dots">
                        <i />
                        <i />
                        <i />
                      </span>
                    </p>
                  ) : (
                    <motion.p className="msg msg--bot" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {t(medQA[qa].a)}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <p className="fine">{t(l('يجيب رفيق من تعليمات فريق الرعاية المسجّلة فقط، ويحيلك إلى المختص فيما عدا ذلك.', 'Rafiq answers only from recorded care-team instructions, and refers you to a professional for anything else.'))}</p>
          </div>
        </Section>
      </motion.div>

      <div className="screen__pad stack">
        <button className="btn btn--soft btn--block" onClick={() => openMap('pharmacy')}>
          <Icon name="nav" size={17} />
          {t(l('الطريق إلى الصيدلية', 'Route to the pharmacy'))}
        </button>
        <button className="btn btn--primary btn--block" onClick={() => go('discharge')}>
          <Icon name="flag" size={17} />
          {t(l('ملخص الخروج', 'Discharge summary'))}
        </button>
      </div>
    </motion.div>
  );
}
