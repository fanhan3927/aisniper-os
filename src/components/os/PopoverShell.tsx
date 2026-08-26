/**
 * PopoverShell — 菜单栏状态弹窗的通用容器
 * 负责：锚点定位（右对齐 + 视口钳制）、点击外部关闭、Esc 关闭、spring 弹出。
 * 打开/关闭动画由父级 AnimatePresence 驱动。
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from '../ui/GlassPanel';
import { MENU_BAR_H } from '../../lib/layout';
import { useThemeStore } from '../../store/themeStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface PopoverShellProps {
  /** 锚点元素（状态图标按钮） */
  anchor: HTMLElement | null;
  width: number;
  onClose: () => void;
  children: React.ReactNode;
}

export const PopoverShell: React.FC<PopoverShellProps> = ({ anchor, width, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: MENU_BAR_H + 8, left: 16 });
  const reduceMotion = usePrefersReducedMotion();
  const reduce = useThemeStore((s) => s.reduceMotion) || reduceMotion;

  useLayoutEffect(() => {
    if (!anchor) return;
    const update = () => {
      const r = anchor.getBoundingClientRect();
      const vw = window.innerWidth;
      let left = r.left + r.width - width;
      left = Math.min(Math.max(8, left), vw - width - 8);
      setPos({ top: MENU_BAR_H + 7, left });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [anchor, width]);

  // 点击外部关闭
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [onClose]);

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width, zIndex: 9000 }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
      transition={reduce ? { duration: 0.12 } : { type: 'spring', stiffness: 420, damping: 32 }}
    >
      <GlassPanel radius="popover" shadow="popover" className="p-4" highlight>
        {children}
      </GlassPanel>
    </motion.div>
  );
};
