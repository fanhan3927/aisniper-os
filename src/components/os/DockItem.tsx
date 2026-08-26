/**
 * DockItem — 单个 Dock 图标：放大 + 邻近让位 + 运行指示点
 */
import React from 'react';
import { motion } from 'framer-motion';
import type { DockApp } from '../../data/dockApps';
import { SquircleIcon } from '../ui/SquircleIcon';
import { useThemeStore } from '../../store/themeStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface DockItemProps {
  app: DockApp;
  running: boolean;
  focused: boolean;
  scale: number;
  size?: number;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

export const DockItem: React.FC<DockItemProps> = ({ app, running, focused, scale, size = 52, onSelect, onHover, onLeave }) => {
  const dockMagnify = useThemeStore((s) => s.dockMagnify);
  const reduceMotion = usePrefersReducedMotion();
  const reduce = useThemeStore((s) => s.reduceMotion) || reduceMotion;
  const effective = dockMagnify ? scale : 1;

  return (
    <motion.button
      className="group relative flex flex-col items-center justify-end outline-none"
      animate={{ scale: effective, y: (effective - 1) * -8 }}
      transition={reduce ? { duration: 0.08 } : { type: 'spring', stiffness: 480, damping: 30 }}
      onPointerEnter={onHover}
      onPointerLeave={onLeave}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onSelect}
      aria-label={app.name}
      title={app.name}
    >
      <SquircleIcon appId={app.appId} size={size} className="transition-shadow group-hover:shadow-xl" />
      {/* 运行指示点 */}
      <span
        className="mt-1.5 block h-[4px] w-[4px] rounded-full transition-opacity"
        style={{
          background: focused ? 'var(--accent)' : 'var(--text-secondary)',
          opacity: running ? 1 : 0,
          boxShadow: focused ? '0 0 6px var(--accent)' : 'none',
        }}
      />
      {/* 工具提示 */}
      <span
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: 'var(--glass-bg-strong)', color: 'var(--text-primary)', backdropFilter: 'blur(8px)' }}
      >
        {app.name}
      </span>
    </motion.button>
  );
};
