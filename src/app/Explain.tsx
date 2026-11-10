import { motion } from 'framer-motion';
import Icon from '../components/Icon';
import { explanations, l, type ScreenId } from '../data/content';
import { useStore } from '../store';

const PARTS = [
  { k: 'problem', icon: 'help', label: l('المشكلة', 'The problem') },
  { k: 'decision', icon: 'sparkle', label: l('قرار التصميم', 'The design decision') },
  { k: 'value', icon: 'heart', label: l('القيمة', 'The value') },
  { k: 'connection', icon: 'route', label: l('الارتباط بالرحلة', 'The journey connection') },
] as const;

export default function ExplainCard({ screen, compact = false }: { screen: ScreenId; compact?: boolean }) {
  const { t, lang } = useStore();
  const e = explanations[screen];
  if (!e) return null;
  const other = lang === 'ar' ? 'en' : 'ar';
  return (
    <motion.div key={`${screen}-${lang}`} className={`explain ${compact ? 'explain--compact' : ''}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="explain__eyebrow">
        <Icon name="present" size={14} />
        {t(l('لماذا هذه الميزة؟', 'Why this feature?'))}
      </div>
      <h3 className="explain__title">
        {t(e.title)}
        <small lang={other} dir={other === 'ar' ? 'rtl' : 'ltr'}>
          {e.title[other]}
        </small>
      </h3>
      <ol className="explain__parts">
        {PARTS.map((p, i) => (
          <motion.li key={p.k} initial={{ opacity: 0, x: lang === 'ar' ? 12 : -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.08 }}>
            <span className="explain__num">
              <Icon name={p.icon} size={15} />
            </span>
            <div>
              <b>
                {i + 1}. {t(p.label)}
              </b>
              <p>{t(e[p.k])}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}
