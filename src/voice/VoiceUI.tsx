import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../components/Icon';
import { l } from '../data/content';
import { useStore } from '../store';
import { RATES, useVoice, type Utterance } from './VoiceProvider';

/** Animated audio waveform. Bars move only while Rafiq is speaking. */
export function Waveform({ bars = 22, state, className = '' }: { bars?: number; state: 'idle' | 'playing' | 'paused'; className?: string }) {
  return (
    <span className={`wave wave--${state} ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <i key={i} style={{ animationDelay: `${(i * 137) % 900}ms`, animationDuration: `${700 + ((i * 89) % 500)}ms` }} />
      ))}
    </span>
  );
}

/** "Listen to this page" — large, clear button for spoken explanations. */
export function ListenBar({ line, label }: { line: Utterance | Utterance[]; label?: ReturnType<typeof l> }) {
  const { t } = useStore();
  const v = useVoice();
  const key = Array.isArray(line) ? `list:${line.map((x) => (typeof x === 'string' ? x : x.id)).join(',')}` : typeof line === 'string' ? line : line.id ?? 'custom';
  const mine = v.isPlaying(key);
  const text = t(label ?? l('اسمع شرح هذه الصفحة', 'Listen to this page'));
  return (
    <div className={`listen ${mine ? 'is-on' : ''}`}>
      <button
        className="listen__main"
        onClick={() => (mine ? (v.status === 'playing' ? v.pause() : v.resume()) : v.speak(line, key))}
        aria-label={mine ? (v.status === 'playing' ? t(l('إيقاف مؤقت', 'Pause')) : t(l('متابعة', 'Resume'))) : text}
        aria-pressed={mine}
      >
        <span className="listen__ic">
          <Icon name={mine ? (v.status === 'playing' ? 'pause' : 'play') : 'speaker'} size={20} stroke={2} />
        </span>
        <span className="listen__t">{mine ? (v.status === 'playing' ? t(l('رفيق يتحدث الآن…', 'Rafiq is speaking…')) : t(l('متوقف مؤقتًا', 'Paused'))) : text}</span>
        {mine && <Waveform bars={10} state={v.status} className="listen__wave" />}
      </button>
      {mine && (
        <button className="listen__stop" onClick={v.stop} aria-label={t(l('إيقاف', 'Stop'))}>
          <Icon name="stop" size={16} stroke={2.2} />
        </button>
      )}
    </div>
  );
}

export function SpeedSelect() {
  const { t } = useStore();
  const v = useVoice();
  const names = [l('أبطأ', 'Slower'), l('عادي', 'Normal'), l('أسرع', 'Faster')];
  return (
    <div className="seg seg--voice" role="radiogroup" aria-label={t(l('سرعة الكلام', 'Speaking speed'))}>
      {RATES.map((r, i) => (
        <button key={r} role="radio" aria-checked={v.rate === r} className={v.rate === r ? 'is-on' : ''} onClick={() => v.setRate(r)}>
          {t(names[i])}
        </button>
      ))}
    </div>
  );
}

export function VoiceLangSelect() {
  const { t } = useStore();
  const v = useVoice();
  return (
    <div className="seg seg--voice" role="radiogroup" aria-label={t(l('لغة الصوت', 'Voice language'))}>
      <button role="radio" aria-checked={v.voiceLang === 'ar'} className={v.voiceLang === 'ar' ? 'is-on' : ''} onClick={() => v.setVoiceLang('ar')}>
        العربية
      </button>
      <button role="radio" aria-checked={v.voiceLang === 'en'} className={v.voiceLang === 'en' ? 'is-on' : ''} onClick={() => v.setVoiceLang('en')}>
        English
      </button>
    </div>
  );
}

/** Global player shown while Rafiq speaks: caption, waveform and all playback controls. */
export function VoicePlaybackControls({ docked = true }: { docked?: boolean }) {
  const { t } = useStore();
  const v = useVoice();
  const nextRate = RATES[(RATES.indexOf(v.rate as (typeof RATES)[number]) + 1) % RATES.length] ?? 1;
  return (
    <AnimatePresence>
      {v.status !== 'idle' && (
        <motion.div
          className={`vplayer ${docked ? 'vplayer--docked' : ''}`}
          role="region"
          aria-label={t(l('مشغّل صوت رفيق', 'Rafiq voice player'))}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          <div className="vplayer__top">
            <span className="vplayer__orb" aria-hidden="true">
              <Icon name="speaker" size={16} stroke={2} />
            </span>
            <Waveform bars={18} state={v.status} />
            <span className="vplayer__eng">{v.engine === 'browser' ? t(l('صوت المتصفح', 'Browser voice')) : t(l('صوت رفيق', 'Rafiq voice'))}</span>
          </div>
          <p className="vplayer__cap" lang={v.voiceLang} dir={v.voiceLang === 'ar' ? 'rtl' : 'ltr'}>
            {v.caption}
          </p>
          <div className="vplayer__btns">
            <button onClick={v.replay} aria-label={t(l('إعادة', 'Replay'))}>
              <Icon name="replay" size={18} />
            </button>
            <button className="vplayer__pp" onClick={v.status === 'playing' ? v.pause : v.resume} aria-label={v.status === 'playing' ? t(l('إيقاف مؤقت', 'Pause')) : t(l('تشغيل', 'Play'))}>
              <Icon name={v.status === 'playing' ? 'pause' : 'play'} size={20} stroke={2.4} />
            </button>
            <button onClick={v.stop} aria-label={t(l('إيقاف', 'Stop'))}>
              <Icon name="stop" size={17} />
            </button>
            <button className="vplayer__rate" onClick={() => v.setRate(nextRate)} aria-label={`${t(l('سرعة الكلام', 'Speaking speed'))}: ${v.rate}×`}>
              <span dir="ltr">{v.rate}×</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
