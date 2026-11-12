import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../components/Icon';
import { l, type L } from '../data/content';
import { useStore } from '../store';
import { screenLine } from '../voice/logic';
import { ListenBar } from '../voice/VoiceUI';
import { HeaderTools } from './DisplayPanel';

export const PortalCtx = createContext<HTMLElement | null>(null);

export function Header({ title, sub, back = true, right, listen = true }: { title: L; sub?: L; back?: boolean; right?: ReactNode; listen?: boolean }) {
  const { t, back: goBack, nav, screen, stage, queue, admitted } = useStore();
  const line = listen ? screenLine(screen, { stage, ahead: queue.ahead, admitted }) : null;
  return (
    <>
    <header className="ah">
      {back && nav.length > 1 ? (
        <button className="ah__btn" onClick={goBack} aria-label={t(l('رجوع', 'Back'))}>
          <Icon name="chevron" size={20} className="flip-ltr" />
        </button>
      ) : (
        <span className="ah__spacer" />
      )}
      <div className="ah__titles">
        <h1>{t(title)}</h1>
        {sub && <p>{t(sub)}</p>}
      </div>
      <div className="ah__end">
        {right}
        <HeaderTools />
      </div>
    </header>
    {line && (
      <div className="ah__listen">
        <ListenBar line={line} />
      </div>
    )}
    </>
  );
}

export function Sheet({ open, onClose, children, title, tone = 'light' }: { open: boolean; onClose: () => void; children: ReactNode; title?: string; tone?: 'light' | 'dark' }) {
  const host = useContext(PortalCtx);
  const { t } = useStore();
  const controls = useDragControls();
  if (!host) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="sheet-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="sheet-scrim" onClick={onClose} />
          <motion.div
            className={`sheet sheet--${tone}`}
            role="dialog"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => {
              if (i.offset.y > 110 || i.velocity.y > 600) onClose();
            }}
          >
            <div className="sheet__grip" onPointerDown={(e) => controls.start(e)} />
            <button className="sheet__close" onClick={onClose} aria-label={t(l('إغلاق', 'Close'))}>
              <Icon name="close" size={18} />
            </button>
            <div className="sheet__body">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    host
  );
}

export type Status = 'done' | 'current' | 'upcoming' | 'action' | 'pending' | 'progress' | 'available';
const statusText: Record<Status, L> = {
  done: l('مكتمل', 'Completed'),
  current: l('جارٍ الآن', 'In progress'),
  upcoming: l('قادم', 'Upcoming'),
  action: l('يحتاج إلى إجراء', 'Action needed'),
  pending: l('بانتظار التنفيذ', 'Awaiting'),
  progress: l('قيد التنفيذ', 'In progress'),
  available: l('متاحة', 'Available'),
};
export function Badge({ s, label }: { s: Status; label?: L }) {
  const { t } = useStore();
  return (
    <span className={`badge badge--${s}`}>
      <i />
      {t(label ?? statusText[s])}
    </span>
  );
}

/** Number that rolls when it changes. */
export function Roll({ value, className = '' }: { value: string | number; className?: string }) {
  return (
    <span className={`roll ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(value)}
          initial={{ y: '70%', opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-70%', opacity: 0, filter: 'blur(4px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function DemoButton({ children, onClick, variant = 'ghost' }: { children: ReactNode; onClick: () => void; variant?: 'ghost' | 'solid' }) {
  const { t } = useStore();
  return (
    <button className={`demo-btn demo-btn--${variant}`} onClick={onClick}>
      <span className="demo-btn__tag">{t(l('محاكاة', 'Demo'))}</span>
      {children}
    </button>
  );
}

export function Notice({ children, icon = 'info', tone = 'info' }: { children: ReactNode; icon?: string; tone?: 'info' | 'warn' | 'calm' }) {
  return (
    <div className={`notice notice--${tone}`}>
      <Icon name={icon} size={17} />
      <p>{children}</p>
    </div>
  );
}

export function Section({ title, children, action }: { title: L; children: ReactNode; action?: ReactNode }) {
  const { t } = useStore();
  return (
    <section className="sec">
      <div className="sec__head">
        <h2>{t(title)}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Empty({ icon, title, body, children }: { icon: string; title: L; body: L; children?: ReactNode }) {
  const { t } = useStore();
  return (
    <div className="empty">
      <motion.div className="empty__ic" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}>
        <Icon name={icon} size={30} />
      </motion.div>
      <h3>{t(title)}</h3>
      <p>{t(body)}</p>
      {children}
    </div>
  );
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
export const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } },
};

export function Avatar({ src, size = 44, ring = false }: { src: string; size?: number; ring?: boolean }) {
  return <img className={`avatar ${ring ? 'avatar--ring' : ''}`} src={src} alt="" width={size} height={size} style={{ width: size, height: size }} />;
}
