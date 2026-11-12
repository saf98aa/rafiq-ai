import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Icon from '../../components/Icon';
import { l, pharmacist, STAGE, type L } from '../../data/content';
import { ASKS, guideMeds, SLOTS, suleimanAnswer, type AskId, type GuideMed } from '../../data/medguide';
import { useStore } from '../../store';
import { useVoice } from '../../voice/VoiceProvider';
import { ListenBar } from '../../voice/VoiceUI';
import { Avatar, DemoButton, Empty, Header, Notice, Section, rise, stagger } from '../ui';

/** Today's schedule — only the times written on the (demo) prescription. */
function Schedule() {
  const { t } = useStore();
  const prn = guideMeds.filter((m) => !m.slots.length);
  return (
    <div className="mg-sched" role="table" aria-label={t(l('جدول الجرعات', 'Dose schedule'))}>
      <div className="mg-sched__slots" role="row">
        {SLOTS.map((s) => {
          const here = guideMeds.filter((m) => m.slots.includes(s.id));
          return (
            <div key={s.id} role="cell" className={`mg-slot ${here.length ? 'has' : ''}`}>
              <span className="mg-slot__ic">
                <Icon name={s.icon} size={18} />
              </span>
              <b>{t(s.t)}</b>
              {here.length ? (
                here.map((m) => (
                  <span key={m.id} className="mg-slot__pill">
                    {t(m.name)}
                  </span>
                ))
              ) : (
                <small>—</small>
              )}
            </div>
          );
        })}
      </div>
      {prn.map((m) => (
        <div key={m.id} className="mg-sched__other" role="row">
          <Icon name={m.id === 'm1' ? 'hand' : 'calendar'} size={15} />
          <b>{t(m.name)}</b>
          <span>{t(m.freqTag)}</span>
          <small>{t(l('بلا موعد ثابت في الوصفة', 'no fixed time on the prescription'))}</small>
        </div>
      ))}
    </div>
  );
}

function Block({ icon, title, children, tone }: { icon: string; title: L; children: React.ReactNode; tone?: 'warn' | 'avoid' }) {
  const { t } = useStore();
  return (
    <div className={`mg-blk ${tone ? `mg-blk--${tone}` : ''}`}>
      <span className="mg-blk__ic">
        <Icon name={icon} size={16} />
      </span>
      <div>
        <b>{t(title)}</b>
        {children}
      </div>
    </div>
  );
}

function MedCard({ m }: { m: GuideMed }) {
  const { t } = useStore();
  return (
    <motion.article key={m.id} className="mg-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="mg-card__top">
        <span className="med__ic">
          <Icon name="pill" size={22} />
        </span>
        <div>
          <b>{t(m.name)}</b>
          <small>{t(m.detail)}</small>
        </div>
        <span className="mg-tag">{t(l('بيانات تجريبية', 'Demo data'))}</span>
      </div>

      <ListenBar always line={[m.voice.use, m.voice.how, m.voice.care, m.voice.missed]} label={l('استمع إلى شرح هذا الدواء', 'Listen to this medicine explained')} />

      <Block icon="help" title={l('لماذا أستخدمه؟', 'What is it for?')}>
        <p>{t(m.purpose)}</p>
        <p className="mg-dim">{t(m.condition)}</p>
      </Block>

      <Block icon="pill" title={l('الجرعة وطريقة الاستخدام', 'Dose and how to take it')}>
        <dl className="mg-dl">
          <div>
            <dt>{t(l('الجرعة الموصوفة', 'Prescribed dose'))}</dt>
            <dd>{t(m.dose)}</dd>
          </div>
          <div>
            <dt>{t(l('طريقة الاستخدام', 'How to take it'))}</dt>
            <dd>{t(m.method)}</dd>
          </div>
          <div>
            <dt>{t(l('عدد المرات', 'How often'))}</dt>
            <dd>
              <span className="mg-freq">
                <Icon name="repeat" size={12} />
                {t(m.freqTag)}
              </span>{' '}
              {t(m.frequency)}
            </dd>
          </div>
        </dl>
      </Block>

      <Block icon="clock" title={l('متى آخذه؟', 'When do I take it?')}>
        <div className="mg-slots" aria-label={t(l('الأوقات المكتوبة في الوصفة', 'Times written on the prescription'))}>
          {SLOTS.map((s) => {
            const on = m.slots.includes(s.id);
            return (
              <span key={s.id} className={`mg-slots__s ${on ? 'is-on' : ''}`}>
                <Icon name={on ? 'check' : s.icon} size={14} stroke={on ? 2.6 : 1.8} />
                {t(s.t)}
                <i className="sr-only">{on ? t(l('— موعد جرعة', '— dose time')) : t(l('— لا جرعة', '— no dose'))}</i>
              </span>
            );
          })}
        </div>
        <p>{t(m.timing)}</p>
      </Block>

      <Block icon="food" title={l('مع الطعام؟', 'With food?')}>
        <p>{t(m.food)}</p>
      </Block>

      <Block icon="alert" title={l('قبل أن تأخذه', 'Before you take it')} tone="warn">
        <ul>
          {m.before.map((x, i) => (
            <li key={i}>{t(x)}</li>
          ))}
        </ul>
      </Block>

      <Block icon="shield" title={l('تداخلات دوائية موثّقة', 'Verified interactions')} tone="warn">
        <ul>
          {m.interactions.map((x, i) => (
            <li key={i}>{t(x)}</li>
          ))}
        </ul>
        <p className="mg-dim">{t(l('عدم ذكر دواء هنا لا يعني أنه آمن معه — اسأل الصيدلي عن أي دواء آخر تستخدمه.', 'A medicine not listed here is not proof it is safe together — ask the pharmacist about anything else you take.'))}</p>
      </Block>

      <Block icon="ban" title={l('ما الذي تتجنّبه؟', 'What to avoid')} tone="avoid">
        <ul>
          {m.avoid.map((x, i) => (
            <li key={i}>{t(x)}</li>
          ))}
        </ul>
      </Block>

      <Block icon="replay" title={l('إذا نسيت جرعة', 'If you miss a dose')}>
        {m.missed ? (
          <p>{t(m.missed)}</p>
        ) : (
          <p className="mg-ask">
            <Icon name="info" size={14} />
            {t(l('لا توجد تعليمات معتمدة للجرعة المنسية في الوصفة أو النشرة المستخدمة هنا. اسأل الصيدلي سليمان أو طبيبك — لا تخمّن.', 'No approved missed-dose instructions in the prescription or the information used here. Ask Pharmacist Suleiman or your doctor — do not guess.'))}
          </p>
        )}
      </Block>

      <p className="mg-src">
        <Icon name="book" size={13} />
        <span>
          {t(l('معلومات الدواء من:', 'Medicine facts from:'))} {t(m.source)}. {t(l('الجرعة والمواعيد من الوصفة التجريبية.', 'Dose and times from the demo prescription.'))}
        </span>
      </p>
    </motion.article>
  );
}

type Turn = { id: number; ask: AskId; med: GuideMed['id'] };

export default function Meds() {
  const { t, stage, setStage, openMap, go } = useStore();
  const v = useVoice();
  const [sel, setSel] = useState<GuideMed['id']>('m3');
  const [turns, setTurns] = useState<Turn[]>([]);
  const med = guideMeds.find((m) => m.id === sel)!;

  if (stage < STAGE.discharge) {
    return (
      <div className="screen">
        <Header title={l('دليلك الدوائي', 'Medication Guide')} />
        <Empty
          icon="pill"
          title={l('لا توجد أدوية موصوفة بعد', 'No prescribed medicines yet')}
          body={l('عندما يعتمد فريق الرعاية وصفتك، يشرح لك الصيدلي سليمان كل دواء هنا بلغة واضحة.', 'Once your care team approves your prescription, Pharmacist Suleiman explains each medicine here in plain language.')}
        >
          <DemoButton onClick={() => setStage(STAGE.discharge)}>{t(l('الانتقال إلى مرحلة الإرشادات', 'Jump to the guidance stage'))}</DemoButton>
        </Empty>
      </div>
    );
  }

  const ask = (id: AskId) => {
    setTurns((x) => [...x, { id: Date.now(), ask: id, med: sel }].slice(-6));
    v.speak(suleimanAnswer(med, id).voice);
  };

  return (
    <motion.div className="screen screen--mg" variants={stagger} initial="hidden" animate="show">
      <Header title={l('دليلك الدوائي', 'Medication Guide')} sub={l('يشرحه لك الصيدلي سليمان', 'Explained by Pharmacist Suleiman')} />

      <motion.div className="screen__pad" variants={rise}>
        <div className="mg-who">
          <Avatar src={pharmacist.avatar} size={56} ring />
          <div>
            <b>{t(pharmacist.name)}</b>
            <small>{t(pharmacist.role)}</small>
            <p>{t(l('سأوضح لك الغرض من كل دواء وطريقة استخدامه ومواعيده حسب وصفتك المعتمدة.', 'I will explain what each medicine is for, how to take it and when — according to your approved prescription.'))}</p>
          </div>
        </div>
        <p className="mg-rafiq">
          <Icon name="info" size={13} />
          {t(l('رفيق هو التطبيق الذي يعرض الدليل ويقرؤه بصوت — والشرح من الصيدلي سليمان.', 'Rafiq is the app that shows and reads the guide aloud — the explanations come from Pharmacist Suleiman.'))}
        </p>
      </motion.div>

      <motion.div className="screen__pad" variants={rise}>
        <Notice tone="warn" icon="shield">
          {t(
            l(
              'وصفة تجريبية للعرض — ليست وصفة لمريض حقيقي. معلومات الأدوية من نشراتها المعتمدة. رفيق لا يشخّص ولا يصف ولا يغيّر أي جرعة؛ لأي تغيير راجع طبيبك أو الصيدلي.',
              'A demo prescription — not a real patient’s. Medicine facts come from their approved product information. Rafiq never diagnoses, prescribes or changes a dose; for any change, see your doctor or pharmacist.'
            )
          )}
        </Notice>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('جدول اليوم', "Today's schedule")}>
          <div className="screen__pad0">
            <Schedule />
          </div>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('أدويتك', 'Your medicines')}>
          <div className="mg-tabs" role="tablist" aria-label={t(l('اختر الدواء', 'Choose a medicine'))}>
            {guideMeds.map((m) => (
              <button key={m.id} role="tab" aria-selected={m.id === sel} className={m.id === sel ? 'is-on' : ''} onClick={() => setSel(m.id)}>
                <Icon name="pill" size={14} />
                {t(m.name)}
              </button>
            ))}
          </div>
          <div className="screen__pad0">
            <AnimatePresence mode="wait">
              <MedCard key={med.id} m={med} />
            </AnimatePresence>
          </div>
        </Section>
      </motion.div>

      <motion.div variants={rise}>
        <Section title={l('اسأل الصيدلي سليمان', 'Ask Pharmacist Suleiman')}>
          <div className="ask">
            <p className="fine">
              {t(l('عن:', 'About:'))} <b>{t(med.name)}</b>
            </p>
            <div className="ask__chips">
              {ASKS.map((x) => (
                <button key={x.id} className="chip" onClick={() => ask(x.id)}>
                  {t(x.q)}
                </button>
              ))}
            </div>
            <div className="mg-thread" aria-live="polite">
              <AnimatePresence initial={false}>
                {turns.map((tu) => {
                  const m = guideMeds.find((x) => x.id === tu.med)!;
                  const a = suleimanAnswer(m, tu.ask);
                  return (
                    <motion.div key={tu.id} className="mg-turn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="msg msg--me">
                        {t(ASKS.find((x) => x.id === tu.ask)!.q)} <small>({t(m.name)})</small>
                      </p>
                      <div className="mg-say">
                        <Avatar src={pharmacist.avatar} size={30} />
                        <div className="msg msg--bot">
                          <span className="mg-say__who">{t(pharmacist.name)}</span>
                          {t(a.text)}
                          <button className="mg-say__play" onClick={() => v.speakNow(a.voice, `ask:${tu.id}`)} aria-label={t(l('استمع إلى الإجابة', 'Listen to the answer'))}>
                            <Icon name="speaker" size={14} />
                            {t(l('استمع', 'Listen'))}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <p className="fine">{t(l('الإجابات من بيانات الوصفة والنشرة المعتمدة المعروضة أعلاه فقط. لأي سؤال آخر، تحدّث مع الصيدلي أو طبيبك مباشرة.', 'Answers come only from the prescription and approved information shown above. For anything else, speak to the pharmacist or your doctor directly.'))}</p>
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
