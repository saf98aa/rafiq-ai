import { useState } from 'react';
import Icon from '../components/Icon';
import { l, type L } from '../data/content';
import { useStore, type Display, type TextSize } from '../store';
import { screenLine } from '../voice/logic';
import { useVoice } from '../voice/VoiceProvider';
import { Sheet } from './ui';

const SIZES: { id: TextSize; t: L; px: number }[] = [
  { id: 'standard', t: l('عادي', 'Standard'), px: 14 },
  { id: 'large', t: l('كبير', 'Large'), px: 17 },
  { id: 'xl', t: l('كبير جدًا', 'Extra large'), px: 20 },
];

const MODES: { id: Display; icon: string; t: L; d: L }[] = [
  { id: 'standard', icon: 'sun', t: l('الوضع العادي', 'Standard'), d: l('مظهر رفيق الرسمي', 'The official Rafiq look') },
  { id: 'contrast', icon: 'contrast', t: l('تباين عالٍ', 'High contrast'), d: l('نص أوضح وحدود أقوى', 'Clearer text, stronger edges') },
  { id: 'dark', icon: 'moon', t: l('الوضع الليلي', 'Dark mode'), d: l('مريح في الإضاءة الخافتة', 'Comfortable in low light') },
];

/** Standard / large / extra-large text. */
export function TextSizeSelect() {
  const { t, a11y, setA11y } = useStore();
  return (
    <div className="tsize" role="radiogroup" aria-label={t(l('حجم الخط', 'Text size'))}>
      {SIZES.map((s) => (
        <button key={s.id} role="radio" aria-checked={a11y.textSize === s.id} className={a11y.textSize === s.id ? 'is-on' : ''} onClick={() => setA11y({ textSize: s.id })}>
          <span className="tsize__a" style={{ fontSize: s.px }} aria-hidden="true">
            {t(l('أ', 'A'))}
          </span>
          <span>{t(s.t)}</span>
        </button>
      ))}
    </div>
  );
}

/** Standard brand / high contrast / dark (night) mode. */
export function DisplaySelect() {
  const { t, a11y, setA11y } = useStore();
  return (
    <div className="dmode" role="radiogroup" aria-label={t(l('وضع العرض', 'Display mode'))}>
      {MODES.map((m) => (
        <button key={m.id} role="radio" aria-checked={a11y.display === m.id} className={`dmode__b dmode__b--${m.id} ${a11y.display === m.id ? 'is-on' : ''}`} onClick={() => setA11y({ display: m.id })}>
          <span className="dmode__sw" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="dmode__t">
            <Icon name={m.icon} size={15} />
            {t(m.t)}
          </span>
          <small>{t(m.d)}</small>
          {a11y.display === m.id && (
            <span className="dmode__ok">
              <Icon name="check" size={12} stroke={3} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Voice assistance on/off. Listening to Rafiq (speaker) is separate from speaking to Rafiq (microphone). */
export function VoiceSwitch() {
  const { t, screen, stage, queue, admitted } = useStore();
  const v = useVoice();
  const turn = () => {
    if (v.enabled) v.setEnabled(false);
    else {
      const line = screenLine(screen, { stage, ahead: queue.ahead, admitted });
      if (line) v.speakNow(line);
      else v.setEnabled(true);
    }
  };
  return (
    <div className={`vswitch ${v.enabled ? 'is-on' : ''}`}>
      <span className="vswitch__ic">
        <Icon name={v.enabled ? 'speaker' : 'mute'} size={20} />
      </span>
      <span className="vswitch__t">
        <b>{t(l('صوت رفيق (الاستماع)', "Rafiq's voice (listening)"))}</b>
        <small>
          {v.enabled
            ? t(l('مفعّل — يقرأ رفيق الشرح عندما تطلبه، ويمكنك إيقافه في أي وقت.', 'On — Rafiq reads explanations when you ask, and you can stop it any time.'))
            : t(l('متوقف — لا يُشغَّل أي صوت. التطبيق يعمل كاملًا دون صوت.', 'Off — no audio plays. The app works fully without voice.'))}
        </small>
      </span>
      <button className={`toggle ${v.enabled ? 'is-on' : ''}`} role="switch" aria-checked={v.enabled} onClick={turn} aria-label={t(l('صوت رفيق', "Rafiq's voice"))}>
        <i />
      </button>
    </div>
  );
}

/** Small header buttons: voice on/off and text size & display — reachable from every screen. */
export function HeaderTools() {
  const { t, screen, stage, queue, admitted } = useStore();
  const v = useVoice();
  const [open, setOpen] = useState(false);
  const toggleVoice = () => {
    if (v.enabled) v.setEnabled(false);
    else {
      const line = screenLine(screen, { stage, ahead: queue.ahead, admitted });
      if (line) v.speakNow(line);
      else v.setEnabled(true);
    }
  };
  return (
    <div className="ah__tools">
      <button
        className={`ah__tool ${v.enabled ? 'is-on' : ''}`}
        onClick={toggleVoice}
        aria-pressed={v.enabled}
        aria-label={v.enabled ? t(l('صوت رفيق مفعّل — اضغط للإيقاف', "Rafiq's voice is on — tap to turn off")) : t(l('صوت رفيق متوقف — اضغط للتفعيل والاستماع', "Rafiq's voice is off — tap to turn on and listen"))}
        title={t(l('صوت رفيق', "Rafiq's voice"))}
      >
        <Icon name={v.enabled ? 'speaker' : 'mute'} size={18} />
        {v.status === 'playing' && <span className="ah__dot" aria-hidden="true" />}
      </button>
      <button className="ah__tool ah__tool--aa" onClick={() => setOpen(true)} aria-label={t(l('حجم الخط وألوان العرض', 'Text size and display colours'))} title={t(l('حجم الخط والعرض', 'Text & display'))}>
        <span aria-hidden="true">{t(l('أ', 'Aa'))}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t(l('العرض والصوت', 'Display & voice'))}>
        <div className="dpanel">
          <h3>{t(l('العرض والصوت', 'Display & voice'))}</h3>
          <p className="dpanel__sub">{t(l('تُحفظ اختياراتك على هذا الجهاز، وتبقى في رحلتك الحالية.', 'Your choices are saved on this device, and you stay on your current journey.'))}</p>
          <h4>{t(l('حجم الخط', 'Text size'))}</h4>
          <TextSizeSelect />
          <h4>{t(l('وضع العرض', 'Display mode'))}</h4>
          <DisplaySelect />
          <h4>{t(l('الصوت', 'Voice'))}</h4>
          <VoiceSwitch />
          {v.status !== 'idle' && (
            <button className="btn btn--soft btn--block" onClick={v.stop}>
              <Icon name="stop" size={15} />
              {t(l('إيقاف الصوت الآن', 'Stop the voice now'))}
            </button>
          )}
        </div>
      </Sheet>
    </div>
  );
}
