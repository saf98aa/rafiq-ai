import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Icon from '../../components/Icon';
import { l, patient } from '../../data/content';
import { admission, available, carePlan, categories, hiddenCount, itemById, nextPtSession, planLabels, REQ_STATUS, type CatId, type PlanKey, type Req } from '../../data/inpatient';
import { useStore } from '../../store';
import { ListenBar } from '../../voice/VoiceUI';
import { DemoButton, Header, Notice, Section } from '../ui';

type Step = { k: 'home' } | { k: 'cat'; cat: CatId } | { k: 'confirm'; item: string } | { k: 'track'; id: number };

function StatusTrack({ r }: { r: Req }) {
  const { t } = useStore();
  return (
    <ol className="inp-track" aria-label={t(l('حالة الطلب', 'Request status'))}>
      {REQ_STATUS.map((s, i) => {
        const st = i < r.status ? 'done' : i === r.status ? 'now' : 'next';
        return (
          <li key={i} className={`inp-track__s is-${st}`} aria-current={st === 'now' ? 'step' : undefined}>
            <span className="inp-track__dot">
              <Icon name={st === 'done' ? 'check' : s.icon} size={15} stroke={2.4} />
            </span>
            <span className="inp-track__t">
              <b>{t(s.title)}</b>
              <small>{st === 'done' ? t(l('تمّ', 'Done')) : st === 'now' ? t(l('الحالة الحالية', 'Current status')) : t(l('لاحقًا', 'Later'))}</small>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Inpatient Requests | طلبات المريض أثناء التنويم */
export default function Inpatient() {
  const { t, admitted, setAdmitted, requests, submitRequest, advanceRequest, inpatientCat, announce } = useStore();
  const [step, setStep] = useState<Step>(inpatientCat ? { k: 'cat', cat: inpatientCat } : { k: 'home' });

  useEffect(() => {
    if (inpatientCat) setStep({ k: 'cat', cat: inpatientCat });
  }, [inpatientCat]);

  if (!admitted) {
    return (
      <div className="screen screen--inp">
        <Header title={l('طلبات التنويم', 'Inpatient requests')} sub={l('طلبات المريض أثناء التنويم', 'Requests during your hospital stay')} listen={false} />
        <div className="screen__pad">
          <div className="inp-gate">
            <span className="inp-gate__ic">
              <Icon name="bed" size={30} />
            </span>
            <b>{t(l('تظهر هذه الخدمة بعد التنويم', 'This service appears once you are admitted'))}</b>
            <p>
              {t(
                l(
                  'عند تنويم المريض، يعرض رفيق الطلبات المتاحة له حسب حالته وخطة رعايته المعتمدة: التمريض، والعلاج الطبيعي، والأقسام الأخرى.',
                  'When a patient is admitted, Rafiq shows the requests available to them based on their condition and approved care plan: nursing, physical therapy and other departments.'
                )
              )}
            </p>
            <ListenBar line="ans.notadmitted" label={l('استمع إلى الشرح', 'Listen to the explanation')} />
            <DemoButton variant="solid" onClick={() => setAdmitted(true)}>
              {t(l(`محاكاة: تنويم ${patient.first.ar}`, `Simulate: admit ${patient.first.en}`))}
            </DemoButton>
          </div>
        </div>
      </div>
    );
  }

  const latest = requests[0];
  const back = () => setStep(step.k === 'confirm' ? { k: 'cat', cat: itemById(step.item).cat } : { k: 'home' });

  const body = (() => {
    switch (step.k) {
      case 'cat': {
        const c = categories.find((x) => x.id === step.cat)!;
        const list = available(step.cat);
        const hidden = hiddenCount(step.cat);
        return (
          <>
            <ListenBar line={c.line} label={l('استمع إلى الخيارات المتاحة', 'Listen to the available options')} />
            <Section title={c.title}>
              {step.cat === 'pt' && (
                <p className="inp-plan__next">
                  <Icon name="calendar" size={15} />
                  {t(nextPtSession)}
                </p>
              )}
              <div className="actions" role="list">
                {list.map((it) => (
                  <button key={it.id} role="listitem" className="action" onClick={() => setStep({ k: 'confirm', item: it.id })}>
                    <span className="action__ic">
                      <Icon name={it.icon} size={20} />
                    </span>
                    <span className="action__txt">
                      <b>{t(it.title)}</b>
                      <small>{t(it.desc)}</small>
                    </span>
                    <Icon name="chevron" size={16} className="action__chev flip-rtl" />
                  </button>
                ))}
              </div>
              {hidden > 0 && (
                <p className="inp-hidden">
                  <Icon name="eye" size={14} />
                  {t(
                    l(
                      `لا تظهر ${hidden === 1 ? 'خدمة واحدة' : hidden === 2 ? 'خدمتان' : `${hidden} خدمات`} غير مدرجة في خطة رعايتك.`,
                      `${hidden} service${hidden === 1 ? ' is' : 's are'} hidden because ${hidden === 1 ? 'it is' : 'they are'} not in your care plan.`
                    )
                  )}
                </p>
              )}
            </Section>
          </>
        );
      }
      case 'confirm': {
        const it = itemById(step.item);
        const c = categories.find((x) => x.id === it.cat)!;
        return (
          <>
            <ListenBar line="inp.confirm" label={l('استمع إلى التأكيد', 'Listen to the confirmation')} />
            <Section title={l('تأكيد الطلب', 'Confirm your request')}>
              <div className="inp-confirm">
                <div className="inp-confirm__head">
                  <span className="action__ic">
                    <Icon name={it.icon} size={22} />
                  </span>
                  <b>{t(it.title)}</b>
                </div>
                <dl>
                  <div>
                    <dt>{t(l('الفئة', 'Category'))}</dt>
                    <dd>{t(c.title)}</dd>
                  </div>
                  <div>
                    <dt>{t(l('يُرسَل إلى', 'Goes to'))}</dt>
                    <dd>{t(it.to)}</dd>
                  </div>
                  <div>
                    <dt>{t(l('الموقع', 'Location'))}</dt>
                    <dd>{t(admission.ward)}</dd>
                  </div>
                  <div>
                    <dt>{t(l('مقدّم الطلب', 'Requested by'))}</dt>
                    <dd>{t(patient.name)}</dd>
                  </div>
                </dl>
                {it.urgentNote && (
                  <Notice tone="warn" icon="bell">
                    {t(l('إذا كان الأمر عاجلًا أو تشعر بخطر، اضغط زر استدعاء التمريض بجانب سريرك فورًا — هذا الطلب ليس للطوارئ.', 'If it is urgent or you feel unsafe, press the nurse-call button by your bed right away — this request is not for emergencies.'))}
                  </Notice>
                )}
                <div className="inp-confirm__btns">
                  <button
                    className="btn btn--primary btn--block btn--lg"
                    onClick={() => {
                      const id = submitRequest(it.id);
                      announce(t(l('تم إرسال الطلب (محاكاة).', 'Request submitted (simulated).')));
                      setStep({ k: 'track', id });
                    }}
                  >
                    <Icon name="send" size={17} />
                    {t(l('إرسال الطلب', 'Submit request'))}
                  </button>
                  <button className="btn btn--soft btn--block" onClick={back}>
                    {t(l('رجوع', 'Back'))}
                  </button>
                </div>
              </div>
            </Section>
          </>
        );
      }
      case 'track': {
        const r = requests.find((x) => x.id === step.id);
        if (!r) return null;
        const it = itemById(r.item);
        return (
          <>
            <ListenBar line={`req.${r.status}`} label={l('استمع إلى حالة الطلب', 'Listen to the request status')} />
            <Section title={l('حالة طلبك', 'Your request status')}>
              <div className="inp-req inp-req--big">
                <span className="action__ic">
                  <Icon name={it.icon} size={20} />
                </span>
                <span>
                  <b>{t(it.title)}</b>
                  <small>
                    {t(it.to)} · <span dir="ltr">{r.at}</span>
                  </small>
                </span>
              </div>
              <StatusTrack r={r} />
              {r.status < 3 && (
                <DemoButton
                  onClick={() => {
                    advanceRequest(r.id);
                    announce(t(REQ_STATUS[r.status + 1].title));
                  }}
                >
                  {t(l('محاكاة: تحديث حالة الطلب', 'Simulate: update the status'))}
                </DemoButton>
              )}
              <button className="btn btn--soft btn--block" onClick={() => setStep({ k: 'home' })}>
                {t(l('طلب آخر', 'Another request'))}
              </button>
            </Section>
          </>
        );
      }
      default:
        return (
          <>
            <ListenBar line="screen.inpatient" />
            <Section title={l('بماذا تحتاج المساعدة؟', 'What do you need help with?')}>
              <div className="inp-cats">
                {categories.map((c) => (
                  <motion.button key={c.id} className="inp-cat" whileTap={{ scale: 0.97 }} onClick={() => setStep({ k: 'cat', cat: c.id })}>
                    <span className="inp-cat__ic">
                      <Icon name={c.icon} size={24} />
                    </span>
                    <b>{t(c.title)}</b>
                    <small>{t(c.sub)}</small>
                    <i>{t(l(`${available(c.id).length} طلبات متاحة`, `${available(c.id).length} available`))}</i>
                  </motion.button>
                ))}
              </div>
            </Section>
            <Section title={l('طلباتي', 'My requests')}>
              {requests.length === 0 ? (
                <p className="inp-empty">{t(l('لا توجد طلبات بعد. اختر نوع المساعدة من الأعلى، أو اطلب بصوتك من «رفيق يتحدث معك».', 'No requests yet. Choose a type of help above, or ask by voice in the Voice Companion.'))}</p>
              ) : (
                <div className="inp-reqs">
                  {requests.map((r) => {
                    const it = itemById(r.item);
                    return (
                      <button key={r.id} className="inp-req" onClick={() => setStep({ k: 'track', id: r.id })}>
                        <span className="action__ic">
                          <Icon name={it.icon} size={18} />
                        </span>
                        <span>
                          <b>{t(it.title)}</b>
                          <small dir="ltr">{r.at}</small>
                        </span>
                        <em className={`inp-badge is-${r.status}`}>
                          <Icon name={r.status === 3 ? 'check' : REQ_STATUS[r.status].icon} size={12} stroke={2.4} />
                          {t(REQ_STATUS[r.status].title)}
                        </em>
                      </button>
                    );
                  })}
                </div>
              )}
            </Section>
          </>
        );
    }
  })();

  return (
    <div className="screen screen--inp">
      <Header title={l('طلبات التنويم', 'Inpatient requests')} sub={l('طلبات المريض أثناء التنويم', 'Requests during your hospital stay')} listen={false} />
      <div className="screen__pad">
        <div className="inp-adm">
          <span className="inp-adm__ic">
            <Icon name="bed" size={22} />
          </span>
          <span>
            <small>{t(l('منوَّم حاليًا', 'Currently admitted'))}</small>
            <b>{t(admission.ward)}</b>
            <small>
              {t(admission.since)} · {t(l('بيانات تجريبية', 'Demo data'))}
            </small>
          </span>
        </div>
        <div className="inp-plan" aria-label={t(l('خطة الرعاية المعتمدة', 'Approved care plan'))}>
          <small>{t(l('خطة رعايتك المعتمدة تشمل:', 'Your approved care plan includes:'))}</small>
          <div>
            {(Object.keys(carePlan) as PlanKey[])
              .filter((k) => carePlan[k])
              .map((k) => (
                <span key={k} className="inp-plan__chip">
                  <Icon name="check" size={11} stroke={3} />
                  {t(planLabels[k])}
                </span>
              ))}
          </div>
        </div>
        {step.k !== 'home' && (
          <button className="linkbtn inp-back" onClick={back}>
            <Icon name="chevron" size={15} className="flip-ltr" />
            {t(l('رجوع', 'Back'))}
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step.k === 'cat' ? `cat-${step.cat}` : step.k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
          {body}
        </motion.div>
      </AnimatePresence>
      <div className="screen__pad">
        <Notice>
          {t(
            l(
              'نموذج تجريبي: الطلبات وحالاتها محاكاة، ولا يصل أي طلب إلى طاقم أو قسم فعلي. للحالات العاجلة استخدم زر استدعاء التمريض بجانب السرير.',
              'Prototype: requests and their statuses are simulated, and nothing reaches real staff or departments. For anything urgent, use the nurse-call button by the bed.'
            )
          )}
        </Notice>
      </div>
      {latest && step.k === 'home' && <span className="sr-only">{t(REQ_STATUS[latest.status].title)}</span>}
    </div>
  );
}
