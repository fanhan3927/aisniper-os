/**
 * Window — 通用窗口壳：拖拽 / 右下角缩放 / 交通灯 / 聚焦置顶
 * 与 App 内容分离：App 不知道拖拽实现。
 * 移动端（<768）强制最大化、禁用拖拽。
 */
import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import type { WindowInstance } from '../../types/os';
import { APP_META } from '../../types/os';
import { useOsStore } from '../../store/osStore';
import { useThemeStore } from '../../store/themeStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MENU_BAR_H } from '../../lib/layout';
import { TrafficLights } from '../ui/TrafficLights';

/** 拖拽时窗口可见部分的最小保留宽度 */
const KEEP_VISIBLE = 64;

interface WindowProps {
  win: WindowInstance;
  focused: boolean;
  children: React.ReactNode;
  /** 绿键行为覆盖（游戏 → 全屏） */
  onMaximize?: (win: WindowInstance) => void;
}

export const Window: React.FC<WindowProps> = ({ win, focused, children, onMaximize }) => {
  const isMobile = useIsMobile();
  const reduceMotion = usePrefersReducedMotion();
  const reduce = useThemeStore((s) => s.reduceMotion) || reduceMotion;
  const titleBarRef = useRef<HTMLDivElement>(null);

  const focusWindow = useOsStore((s) => s.focusWindow);
  const moveWindow = useOsStore((s) => s.moveWindow);
  const resizeWindow = useOsStore((s) => s.resizeWindow);
  const closeApp = useOsStore((s) => s.closeApp);
  const minimizeWindow = useOsStore((s) => s.minimizeWindow);
  const toggleMaximize = useOsStore((s) => s.toggleMaximize);

  const meta = APP_META[win.appId];
  const canManipulate = !isMobile;

  // 移动端渲染矩形
  const rect = isMobile
    ? { x: 0, y: MENU_BAR_H, w: window.innerWidth, h: window.innerHeight - MENU_BAR_H }
    : win.maximized
      ? { x: 0, y: MENU_BAR_H, w: window.innerWidth, h: window.innerHeight - MENU_BAR_H - 92 }
      : { x: win.x, y: win.y, w: win.w, h: win.h };

  // —— 拖拽（标题栏 pointer 事件）——
  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!canManipulate || win.maximized) return;
      if ((e.target as HTMLElement).closest('[data-traffic]')) return;
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startY = e.clientY;
      const origX = win.x;
      const origY = win.y;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const onMove = (ev: PointerEvent) => {
        let nx = origX + (ev.clientX - startX);
        let ny = origY + (ev.clientY - startY);
        // 防止拖出视口导致抓不回
        nx = Math.max(-win.w + KEEP_VISIBLE, Math.min(nx, vw - KEEP_VISIBLE));
        ny = Math.max(MENU_BAR_H - 8, Math.min(ny, vh - KEEP_VISIBLE));
        moveWindow(win.id, Math.round(nx), Math.round(ny));
      };
      const onUp = (ev: PointerEvent) => {
        el.releasePointerCapture(ev.pointerId);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
    },
    [canManipulate, win, moveWindow],
  );

  // —— 缩放（右下角）——
  const startResize = useCallback(
    (e: React.PointerEvent) => {
      if (!canManipulate || win.maximized) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startY = e.clientY;
      const ow = win.w;
      const oh = win.h;
      const minW = meta.minSize.w;
      const minH = meta.minSize.h;

      const onMove = (ev: PointerEvent) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const nw = Math.min(vw - win.x, Math.max(minW, ow + (ev.clientX - startX)));
        const nh = Math.min(vh - win.y, Math.max(minH, oh + (ev.clientY - startY)));
        resizeWindow(win.id, Math.round(nw), Math.round(nh));
      };
      const onUp = (ev: PointerEvent) => {
        el.releasePointerCapture(ev.pointerId);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
    },
    [canManipulate, win, meta, resizeWindow],
  );

  const onTitleDoubleClick = useCallback(() => {
    if (!isMobile) toggleMaximize(win.id);
  }, [isMobile, toggleMaximize, win.id]);

  const noRadius = win.maximized || isMobile;

  return (
    <motion.div
      className="pointer-events-auto absolute flex flex-col overflow-hidden"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        zIndex: win.z,
        borderRadius: noRadius ? 0 : 'var(--radius-window)',
        background: 'var(--window-content-bg)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        border: `1px solid ${focused ? 'var(--glass-border-strong)' : 'var(--glass-border)'}`,
        boxShadow: focused ? 'var(--shadow-window)' : '0 10px 30px rgba(0,0,0,0.28)',
        cursor: 'default',
      }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 18 }}
      transition={reduce ? { duration: 0.12 } : { type: 'spring', stiffness: 420, damping: 34 }}
      onPointerDown={() => focusWindow(win.id)}
      role="dialog"
      aria-label={win.title}
    >
      {/* 标题栏 */}
      <div
        ref={titleBarRef}
        className="relative flex shrink-0 items-center px-3.5"
        style={{ height: 'var(--titlebar-height)' }}
        onPointerDown={startDrag}
        onDoubleClick={onTitleDoubleClick}
        data-traffic-zone
      >
        <div data-traffic>
          <TrafficLights
            focused={focused}
            onClose={() => closeApp(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => (onMaximize ? onMaximize(win) : toggleMaximize(win.id))}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 flex justify-center px-16">
          <span
            className="truncate text-[12px] font-medium"
            style={{ color: 'var(--text-secondary)', textShadow: 'var(--glass-text-shadow)' }}
          >
            {win.title}
          </span>
        </div>
      </div>

      {/* 内容区 */}
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>

      {/* 缩放手柄 */}
      {canManipulate && !win.maximized && (
        <div
          className="absolute bottom-0 right-0 z-10 h-[18px] w-[18px] cursor-nwse-resize"
          onPointerDown={startResize}
          aria-hidden
        >
          <svg width="18" height="18" viewBox="0 0 18 18" className="absolute bottom-0 right-0 opacity-50">
            <path d="M17 11 L17 17 L11 17" stroke="var(--text-tertiary)" strokeWidth="1.4" fill="none" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};
