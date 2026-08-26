/**
 * BootSplash — 开机动画：黑色 → 星核亮起 → 桌面淡入
 * 1.2–1.6s，点击跳过；localStorage 只自动播一次。
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export const BOOT_KEY = 'aisniper-boot-played';

export const BootSplash: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [phase, setPhase] = useState<'core' | 'expand'>('core');
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce) {
      onDone();
      return;
    }
    const t1 = window.setTimeout(() => setPhase('expand'), 620);
    const t2 = window.setTimeout(onDone, 1480);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone, reduce]);

  return (
    <motion.div
      className="fixed inset-0 z-[20000] flex cursor-pointer flex-col items-center justify-center"
      style={{ background: '#020208' }}
      onClick={onDone}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      aria-label="点击跳过开机动画"
    >
      {/* 星核 */}
      <div className="relative flex h-40 w-40 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(10,132,255,0.55), rgba(10,132,255,0.08) 55%, transparent 70%)' }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 0.9, 1], scale: phase === 'core' ? [0.3, 1.15] : [1.15, 1.65] }}
          transition={{ duration: phase === 'core' ? 0.62 : 0.85, ease: 'easeOut' }}
        />
        <motion.svg
          width="72"
          height="72"
          viewBox="0 0 48 48"
          fill="none"
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.18, duration: 0.5, ease: 'easeOut' }}
        >
          <circle cx="24" cy="24" r="17" stroke="#7db8ff" strokeWidth="2.4" opacity="0.9" />
          <circle cx="24" cy="24" r="10" stroke="#7db8ff" strokeWidth="1.4" opacity="0.55" />
          <circle cx="24" cy="24" r="2.6" fill="#9cc8ff" />
          <path d="M24 2v8M24 38v8M2 24h8M38 24h8" stroke="#7db8ff" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
        </motion.svg>
      </div>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="text-[26px] font-semibold tracking-[0.08em] text-white">AISniper OS</div>
        <div className="mt-1 text-[11px] tracking-widest text-[#6d7480]">TARGETING THE NEXT DESKTOP</div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 text-[10px] text-[#3a4050]"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'core' ? 0.4 : 0 }}
        transition={{ duration: 0.3 }}
      >
        点击任意处跳过
      </motion.div>
    </motion.div>
  );
};
