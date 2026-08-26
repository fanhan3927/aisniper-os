/**
 * Toast — 右上角短暂通知（AnimatePresence）
 */
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOsStore } from '../../store/osStore';
import { GlassPanel } from '../ui/GlassPanel';
import type { ToastItem } from '../../types/os';
import { useThemeStore } from '../../store/themeStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const KIND_COLOR: Record<ToastItem['kind'], string> = {
  info: 'var(--accent)',
  warn: '#ffd60a',
  success: '#30d158',
};

const ToastCard: React.FC<{ t: ToastItem }> = ({ t }) => {
  const dismiss = useOsStore((s) => s.dismissToast);
  const reduceMotion = usePrefersReducedMotion();
  const reduce = useThemeStore((s) => s.reduceMotion) || reduceMotion;

  return (
    <motion.div
      layout
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.95 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.95 }}
      transition={reduce ? { duration: 0.12 } : { type: 'spring', stiffness: 380, damping: 30 }}
    >
      <GlassPanel radius="popover" shadow="popover" className="w-[260px] px-3.5 py-2.5" highlight>
        <div className="flex items-start gap-2.5">
          <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full" style={{ background: KIND_COLOR[t.kind] }} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-medium" style={{ color: 'var(--text-primary)' }}>
              {t.title}
            </div>
            {t.message && (
              <div className="mt-0.5 text-[11.5px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {t.message}
              </div>
            )}
          </div>
          <button
            className="pressable mt-0.5 text-[11px]"
            style={{ color: 'var(--text-tertiary)' }}
            onClick={() => dismiss(t.id)}
            aria-label="关闭通知"
          >
            ✕
          </button>
        </div>
      </GlassPanel>
    </motion.div>
  );
};

export const ToastHost: React.FC = () => {
  const toasts = useOsStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed right-4 top-10 z-[9500] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard t={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
