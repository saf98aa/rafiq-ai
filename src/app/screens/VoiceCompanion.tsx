import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon';
import { Mark } from '../../components/Logo';
import { l, type L } from '../../data/content';
import { destById } from '../../data/blueprint';
import { categories, type CatId } from '../../data/inpatient';
import { useStore } from '../../store';
import { answerFor, matchIntent, SUGGESTED, type Intent } from '../../voice/logic';
import { lines, useVoice } from '../../voice/VoiceProvider';
import { SpeedSelect, VoiceLangSelect, Waveform } from '../../voice/VoiceUI';
import { Header, Notice } from '../ui';

type Msg = { id: number; who: 'me' | 'rafiq'; text: L | string; dest?: ReturnType<typeof destById>; inpatient?: CatId | 'home' };

// Minimal typing for the Web Speech API (not in TS DOM lib everywhere)
type SR = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> & { length: number } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
const getSR = (): (new () => SR) | null => {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/** Rafiq Voice Companion — "رفيق يتحدث معك". */
export default function VoiceCompanion() {
  const { t, stage, queue, openMap, go, lang, admitted, requests, openInpatient } = useStore();
  const v = useVoice();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [micError, setMicError] = useState<L | null>(null);
  // the microphone is used only after the user explicitly agrees (then the browser asks its own permission)
  const [micOk, setMicOk] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rafiq-mic-ok') === 'yes';
    } catch {
      return false;
    }
  });
  const [askMic, setAskMic] = useState(false);
  const rec = useRef<SR | null>(null);
  const seq = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const SRClass = getSR();

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [msgs.length]);
  useEffect(() => () => rec.current?.abort(), []);

  const reply = (intent: Intent | null, asked: L | string) => {
    const me: Msg = { id: ++seq.current, who: 'me', text: asked };
    if (!intent) {
      setMsgs((m) => [...m, me, { id: ++seq.current, who: 'rafiq', text: lines['vc.unknown'] }]);
      v.speak('vc.unknown');
      return;
    }
    const a = answerFor(intent, { stage, ahead: queue.ahead, admitted, reqStatus: requests[0]?.status ?? null });
    setMsgs((m) => [...m, me, { id: ++seq.current, who: 'rafiq', text: lines[a.line], dest: a.dest ? destById(a.dest) : undefined, inpatient: a.inpatient }]);
    v.speak(a.line);
  };

  const startMic = (agreed = false) => {
    setMicError(null);
    if (!listening && !micOk && !agreed) {
      setAskMic(true);
      return;
    }
    if (!SRClass) {
      setMicError(l('التعرّف على الصوت غير مدعوم في هذا المتصفح. اختر سؤالًا من الأسئلة المقترحة.', 'Speech recognition is not supported in this browser. Choose one of the suggested questions.'));
      return;
    }
    if (listening) {
      rec.current?.stop();
      return;
    }
    v.stop();
    const r = new SRClass();
    r.lang = v.voiceLang === 'ar' ? 'ar-SA' : 'en-US';
    r.interimResults = true;
    r.maxAlternatives = 1;
    let finalText = '';
    r.onresult = (e) => {
      const res = e.results[e.results.length - 1];
      finalText = res[0].transcript;
      setHeard(finalText);
    };
    r.onerror = (e) => {
      setMicError(
        e.error === 'not-allowed' || e.error === 'service-not-allowed'
          ? l('لم يُسمح باستخدام الميكروفون. يمكنك اختيار سؤال من الأسئلة المقترحة.', 'Microphone access was not allowed. You can choose a suggested question instead.')
          : e.error === 'no-speech'
          ? l('لم أسمع شيئًا. اضغط على الميكروفون وتكلّم بوضوح.', "I didn't hear anything. Press the microphone and speak clearly.")
          : l('تعذّر التعرّف على الصوت. جرّب مرة أخرى أو اختر سؤالًا.', "Couldn't recognise speech. Try again or choose a question.")
      );
    };
    r.onend = () => {
      setListening(false);
      setHeard('');
      if (finalText.trim()) reply(matchIntent(finalText), finalText);
    };
    rec.current = r;
    try {
      r.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const allowMic = () => {
    setMicOk(true);
    setAskMic(false);
    try {
      localStorage.setItem('rafiq-mic-ok', 'yes');
    } catch {
      /* ignore */
    }
    startMic(true);
  };

  const state = listening ? 'listening' : v.status === 'playing' ? 'speaking' : 'idle';

  return (
    <div className="screen screen--voice">
      <Header title={l('رفيق يتحدث معك', 'Rafiq Voice Companion')} sub={l('اسأل بصوتك أو اختر سؤالًا', 'Ask out loud or pick a question')} />

      <div className={`vc vc--${state}`}>
        <div className="vc__stage">
          <div className="vc__orb" aria-hidden="true">
            <span className="vc__ring" />
            <span className="vc__ring vc__ring--2" />
            <Mark size={46} light animated={state !== 'idle'} />
          </div>
          <Waveform bars={28} state={state === 'idle' ? 'idle' : 'playing'} className="vc__wave" />
          <p className="vc__status" role="status" aria-live="polite">
            {state === 'listening'
              ? heard || t(l('أستمع إليك…', "I'm listening…"))
              : state === 'speaking'
              ? t(l('رفيق يتحدث…', 'Rafiq is speaking…'))
              : t(l('اضغط على الميكروفون وتكلّم', 'Press the microphone and speak'))}
          </p>
        </div>

        <div className="vc__controls">
          <button
            className="vc__ctl"
            onClick={() => {
              setMsgs((m) => [...m, { id: ++seq.current, who: 'rafiq', text: lines['vc.hello'] }]);
              v.speakNow('vc.hello');
            }}
            aria-label={t(l('الاستماع إلى رفيق: اسمع ترحيبه', 'Listen to Rafiq: hear his greeting'))}
          >
            <Icon name="speaker" size={24} />
            <span>{t(l('استمع', 'Listen'))}</span>
          </button>
          <motion.button
            className={`vc__mic ${listening ? 'is-on' : ''}`}
            onClick={() => startMic()}
            whileTap={{ scale: 0.94 }}
            aria-label={listening ? t(l('إيقاف الاستماع', 'Stop listening')) : t(l('تحدّث مع رفيق', 'Talk to Rafiq'))}
            aria-pressed={listening}
          >
            <Icon name={listening ? 'stop' : 'mic'} size={34} stroke={2} />
            <span className="vc__miclbl">{listening ? t(l('إيقاف', 'Stop')) : t(l('تحدّث', 'Speak'))}</span>
          </motion.button>
          <button
            className="vc__ctl"
            onClick={v.status === 'playing' ? v.pause : v.status === 'paused' ? v.resume : v.replay}
            aria-label={v.status === 'playing' ? t(l('إيقاف مؤقت', 'Pause')) : v.status === 'paused' ? t(l('متابعة', 'Resume')) : t(l('إعادة آخر إجابة', 'Replay last answer'))}
          >
            <Icon name={v.status === 'playing' ? 'pause' : v.status === 'paused' ? 'play' : 'replay'} size={24} />
            <span>{v.status === 'playing' ? t(l('إيقاف مؤقت', 'Pause')) : v.status === 'paused' ? t(l('متابعة', 'Resume')) : t(l('إعادة', 'Replay'))}</span>
          </button>
        </div>
        <div className="vc__modes" aria-hidden="true">
          <span>
            <Icon name="speaker" size={14} />
            {t(l('استمع إلى رفيق: يقرأ الإجابة بصوت', 'Listen to Rafiq: he reads the answer aloud'))}
          </span>
          <span>
            <Icon name="mic" size={14} />
            {t(l('تحدّث إلى رفيق: الميكروفون بعد إذنك فقط', 'Speak to Rafiq: microphone only with your permission'))}
          </span>
        </div>
        {askMic && (
          <div className="screen__pad">
            <div className="micask" role="dialog" aria-label={t(l('إذن الميكروفون', 'Microphone permission'))}>
              <span className="micask__ic">
                <Icon name="mic" size={22} />
              </span>
              <b>{t(l('هل تسمح لرفيق باستخدام الميكروفون؟', 'Allow Rafiq to use the microphone?'))}</b>
              <p>
                {t(
                  l(
                    'يُستخدم الميكروفون فقط أثناء ضغطك على زر «تحدّث» لفهم سؤالك، ثم يتوقف. سيطلب المتصفح إذنه أيضًا. يمكنك دائمًا اختيار سؤال مكتوب بدلًا من ذلك.',
                    'The microphone is used only while you press “Speak”, to understand your question, and then it stops. Your browser will also ask for permission. You can always choose a written question instead.'
                  )
                )}
              </p>
              <div className="micask__btns">
                <button className="btn btn--primary" onClick={allowMic}>
                  <Icon name="mic" size={16} />
                  {t(l('السماح والبدء', 'Allow and start'))}
                </button>
                <button className="btn btn--soft" onClick={() => setAskMic(false)}>
                  {t(l('ليس الآن', 'Not now'))}
                </button>
              </div>
            </div>
          </div>
        )}
        {!v.enabled && (
          <div className="screen__pad">
            <div className="vc__off">
              <Icon name="mute" size={17} />
              <span>{t(l('صوت رفيق متوقف: ستظهر الإجابات مكتوبة فقط.', "Rafiq's voice is off: answers appear as text only."))}</span>
              <button className="linkbtn" onClick={() => v.setEnabled(true)}>
                {t(l('تفعيل الصوت', 'Turn voice on'))}
              </button>
            </div>
          </div>
        )}
        {v.status !== 'idle' && (
          <button className="vc__stopall" onClick={v.stop}>
            <Icon name="stop" size={15} />
            {t(l('إيقاف الصوت', 'Stop voice'))}
          </button>
        )}
        {micError && (
          <div className="screen__pad">
            <Notice tone="warn" icon="mic">
              {t(micError)}
            </Notice>
          </div>
        )}
      </div>

      <section className="sec" aria-label={t(l('أسئلة مقترحة', 'Suggested questions'))}>
        <div className="sec__head">
          <h2>{t(l('أسئلة مقترحة', 'Suggested questions'))}</h2>
        </div>
        <div className="vc__qs">
          {SUGGESTED.map((s) => (
            <button key={s.intent} className="vc__q" onClick={() => reply(s.intent, s.q)}>
              <Icon name={s.icon} size={19} />
              <span>{t(s.q)}</span>
            </button>
          ))}
        </div>
      </section>

      {msgs.length > 0 && (
        <section className="sec" aria-label={t(l('المحادثة', 'Conversation'))}>
          <div className="sec__head">
            <h2>{t(l('المحادثة', 'Conversation'))}</h2>
            <button className="linkbtn" onClick={() => setMsgs([])}>
              {t(l('مسح', 'Clear'))}
            </button>
          </div>
          <div className="vc__thread" ref={scroller} aria-live="polite">
            <AnimatePresence initial={false}>
              {msgs.map((m) => (
                <motion.div key={m.id} className={`msg msg--${m.who === 'me' ? 'me' : 'bot'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {typeof m.text === 'string' ? m.text : t(m.text)}
                  {m.dest && (
                    <button className="msg__act" onClick={() => openMap(m.dest!.id)}>
                      <Icon name="map" size={15} />
                      {t(l('اعرض على الخريطة:', 'Show on map:'))} {t(m.dest.name)}
                    </button>
                  )}
                  {m.inpatient && (
                    <button className="msg__act" onClick={() => openInpatient(m.inpatient === 'home' ? null : m.inpatient!)}>
                      <Icon name="bed" size={15} />
                      {m.inpatient === 'home'
                        ? t(l('افتح طلبات التنويم', 'Open inpatient requests'))
                        : `${t(l('اختر الطلب:', 'Choose a request:'))} ${t(categories.find((c) => c.id === m.inpatient)!.title)}`}
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="sec__head">
          <h2>{t(l('إعدادات الصوت', 'Voice settings'))}</h2>
        </div>
        <div className="settings">
          <div className="setting">
            <Icon name="globe" size={19} />
            <span>{t(l('لغة الصوت', 'Voice language'))}</span>
            <VoiceLangSelect />
          </div>
          <div className="setting">
            <Icon name="wave" size={19} />
            <span>{t(l('سرعة الكلام', 'Speaking speed'))}</span>
            <SpeedSelect />
          </div>
          <button className="setting setting--link" onClick={() => go('access')}>
            <Icon name="a11y" size={19} />
            <span>{t(l('إعدادات الوصول الميسر', 'Accessibility settings'))}</span>
            <Icon name="chevron" size={16} className="flip-rtl" />
          </button>
        </div>
      </section>

      <div className="screen__pad">
        <Notice>
          {t(
            l(
              'الإجابات من بيانات الزيارة التجريبية فقط، ولا يوجد ربط فعلي بأنظمة المستشفى. في الأماكن العامة، استخدم السماعة للحفاظ على خصوصيتك.',
              'Answers come only from the demo visit data; there is no real hospital-system connection. In public places, use earphones to keep your information private.'
            )
          )}
        </Notice>
        {lang && !SRClass && (
          <p className="fine center">{t(l('الميكروفون غير مدعوم في هذا المتصفح؛ الأسئلة المقترحة تعمل دائمًا.', 'The microphone is not supported in this browser; suggested questions always work.'))}</p>
        )}
      </div>
    </div>
  );
}
