import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Icon from '../../components/Icon';
import { Mark } from '../../components/Logo';
import { l } from '../../data/content';
import { useStore } from '../../store';
import { Sheet } from '../ui';

export default function Welcome() {
  const { t, setLoggedIn, tab, setExplainOpen } = useStore();
  const [nafath, setNafath] = useState(false);
  const [step, setStep] = useState<'wait' | 'ok'>('wait');
  const [secs, setSecs] = useState(60);

  useEffect(() => {
    if (!nafath || step !== 'wait') return;
    setSecs(60);
    const id = window.setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [nafath, step]);

  const enter = () => {
    setLoggedIn(true);
    tab('dashboard');
  };
  const approve = () => {
    setStep('ok');
    window.setTimeout(() => {
      setNafath(false);
      enter();
    }, 1300);
  };

  return (
    <div className="welcome">
      <div className="welcome__bg">
        <img className="welcome__img" src="./media/S01_Emergency.webp" alt="" />
      </div>
      <div className="welcome__orbs">
        <span />
        <span />
        <span />
      </div>
      <button className="welcome__info" onClick={() => setExplainOpen(true)} aria-label={t(l('لماذا هذه الشاشة؟', 'Why this screen?'))}>
        <Icon name="info" size={18} />
      </button>

      <motion.div className="welcome__hero" initial="h" animate="v" variants={{ v: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}>
        <motion.div className="welcome__mark" variants={{ h: { opacity: 0, scale: 0.6 }, v: { opacity: 1, scale: 1 } }}>
          <Mark size={78} animated />
        </motion.div>
        <motion.div className="welcome__brand" variants={{ h: { opacity: 0, y: 10 }, v: { opacity: 1, y: 0 } }}>
          <span className="welcome__ar">رفيق</span>
          <span className="welcome__en">Rafiq AI</span>
        </motion.div>
        <motion.h2 variants={{ h: { opacity: 0, y: 12 }, v: { opacity: 1, y: 0 } }}>{t(l('أهلًا بك في رفيق', 'Welcome to Rafiq'))}</motion.h2>
        <motion.p variants={{ h: { opacity: 0, y: 12 }, v: { opacity: 1, y: 0 } }}>
          {t(l('نرافقك في رحلتك الصحية، من بداية زيارتك وحتى اكتمالها.', 'We accompany you through your healthcare journey, from the start of your visit to its completion.'))}
        </motion.p>
      </motion.div>

      <motion.div className="welcome__actions" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 24 }}>
        <button
          className="btn btn--primary btn--block btn--lg"
          onClick={() => {
            setStep('wait');
            setNafath(true);
          }}
        >
          <Icon name="shield" size={20} />
          {t(l('الدخول عبر نفاذ', 'Sign in with Nafath'))}
        </button>
        <button className="btn btn--soft btn--block" onClick={enter}>
          <Icon name="play" size={14} />
          {t(l('دخول تجريبي سريع', 'Quick demo access'))}
        </button>
        <p className="welcome__legal">
          <Icon name="lock" size={13} />
          {t(l('نموذج توضيحي — لا يوجد ربط فعلي بخدمة نفاذ.', 'Demo prototype — no real Nafath integration.'))}
        </p>
      </motion.div>

      <Sheet open={nafath} onClose={() => setNafath(false)} title="Nafath">
        <AnimatePresence mode="wait">
          {step === 'wait' ? (
            <motion.div key="w" className="nafath" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="nafath__brand">
                <span className="nafath__logo">
                  <Icon name="shield" size={20} />
                </span>
                <div>
                  <b>{t(l('التحقق عبر نفاذ', 'Verify with Nafath'))}</b>
                  <small>{t(l('محاكاة لتجربة الدخول', 'Simulated sign-in experience'))}</small>
                </div>
              </div>
              <p className="nafath__lead">{t(l('افتح تطبيق نفاذ واختر الرقم التالي لتأكيد هويتك:', 'Open the Nafath app and choose this number to confirm your identity:'))}</p>
              <div className="nafath__num">
                <svg viewBox="0 0 120 120" className="nafath__ring">
                  <circle cx="60" cy="60" r="54" />
                  <circle cx="60" cy="60" r="54" className="nafath__prog" style={{ strokeDashoffset: 339 * (1 - secs / 60) }} />
                </svg>
                <span>37</span>
              </div>
              <p className="nafath__wait">
                <span className="dots">
                  <i />
                  <i />
                  <i />
                </span>
                {t(l('بانتظار التأكيد…', 'Waiting for confirmation…'))} <b>{secs}</b>
              </p>
              <button className="btn btn--primary btn--block" onClick={approve}>
                <Icon name="check" size={18} />
                {t(l('محاكاة الموافقة في تطبيق نفاذ', 'Simulate approval in Nafath'))}
              </button>
              <p className="nafath__note">{t(l('هذه شاشة عرض فقط ولا تتصل بأي خدمة حكومية.', 'This is a demonstration screen only and connects to no government service.'))}</p>
            </motion.div>
          ) : (
            <motion.div key="ok" className="nafath nafath--ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.span className="okmark" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
                <Icon name="check" size={36} stroke={2.6} />
              </motion.span>
              <b>{t(l('تم التحقق بنجاح', 'Verified successfully'))}</b>
              <small>{t(l('جارٍ فتح زيارتك VIS-0001…', 'Opening your visit VIS-0001…'))}</small>
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>
    </div>
  );
}
