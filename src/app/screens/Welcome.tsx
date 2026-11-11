import { motion } from 'framer-motion';
import Icon from '../../components/Icon';
import { Mark } from '../../components/Logo';
import { companion, l, patient } from '../../data/content';
import { hospitalPhotos } from '../../data/people';
import { useStore, type Role } from '../../store';
import { useVoice } from '../../voice/VoiceProvider';

/** Demo patient selection: direct access, no external authentication. */
function DemoPatientSelector() {
  const { t, role, setRole } = useStore();
  const opts: { id: Role; img: string; title: ReturnType<typeof l>; sub: ReturnType<typeof l> }[] = [
    { id: 'patient', img: patient.avatar, title: l('أنا المريض', "I'm the patient"), sub: l(`${patient.name.ar} · ${patient.age.ar}`, `${patient.name.en} · ${patient.age.en}`) },
    { id: 'companion', img: companion.avatar, title: l('أنا المرافق', "I'm the companion"), sub: l(`${companion.name.ar} — ${companion.relation.ar}`, `${companion.name.en} — ${companion.relation.en}`) },
  ];
  return (
    <div className="dps" role="radiogroup" aria-label={t(l('اختر الزيارة التجريبية', 'Choose the demo visit'))}>
      {opts.map((o) => (
        <button key={o.id} role="radio" aria-checked={role === o.id} className={`dps__opt ${role === o.id ? 'is-on' : ''}`} onClick={() => setRole(o.id)}>
          <img src={o.img} alt="" />
          <span>
            <b>{t(o.title)}</b>
            <small>{t(o.sub)}</small>
          </span>
          <i className="dps__tick" aria-hidden="true">
            {role === o.id && <Icon name="check" size={13} stroke={3} />}
          </i>
        </button>
      ))}
    </div>
  );
}

export default function Welcome() {
  const { t, setLoggedIn, tab, setExplainOpen } = useStore();
  const v = useVoice();

  const enter = () => {
    setLoggedIn(true);
    tab('dashboard');
  };

  return (
    <div className="welcome">
      <div className="welcome__bg">
        <img className="welcome__img" src={hospitalPhotos.exterior.src} alt="" />
      </div>
      <div className="welcome__orbs">
        <span />
        <span />
        <span />
      </div>
      <div className="welcome__top">
        <button className="welcome__info" onClick={() => v.speak('screen.welcome')} aria-label={t(l('اسمع شرح هذه الصفحة', 'Listen to this page'))}>
          <Icon name="speaker" size={18} />
        </button>
        <button className="welcome__info" onClick={() => setExplainOpen(true)} aria-label={t(l('لماذا هذه الشاشة؟', 'Why this screen?'))}>
          <Icon name="info" size={18} />
        </button>
      </div>

      <motion.div className="welcome__hero" initial="h" animate="v" variants={{ v: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}>
        <motion.div className="welcome__mark" variants={{ h: { opacity: 0, scale: 0.6 }, v: { opacity: 1, scale: 1 } }}>
          <Mark size={70} animated />
        </motion.div>
        <motion.div className="welcome__brand" variants={{ h: { opacity: 0, y: 10 }, v: { opacity: 1, y: 0 } }}>
          <span className="welcome__ar">رفيق</span>
          <span className="welcome__en">Rafiq AI</span>
        </motion.div>
        <motion.p variants={{ h: { opacity: 0, y: 12 }, v: { opacity: 1, y: 0 } }}>
          {t(l('نرافقك في رحلتك الصحية، من بداية زيارتك وحتى اكتمالها.', 'We accompany you through your healthcare journey, from the start of your visit to its completion.'))}
        </motion.p>
      </motion.div>

      <motion.div className="welcome__actions" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 24 }}>
        <p className="welcome__pick">{t(l('زيارة تجريبية: اختر من سيستخدم رفيق', 'Demo visit: choose who is using Rafiq'))}</p>
        <DemoPatientSelector />
        <button className="btn btn--primary btn--block btn--lg" onClick={enter}>
          <Icon name="play" size={15} />
          {t(l('ابدأ رحلتك مع رفيق', 'Start Your Journey with Rafiq'))}
        </button>
        <p className="welcome__legal">
          <Icon name="lock" size={13} />
          {t(l('دخول تجريبي مباشر — بيانات تجريبية، دون أي ربط بأنظمة المستشفى.', 'Direct demo access — fictional data, with no connection to hospital systems.'))}
        </p>
      </motion.div>
    </div>
  );
}
