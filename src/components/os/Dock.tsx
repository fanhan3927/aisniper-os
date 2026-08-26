/**
 * Dock — 底部居中玻璃 Dock（五个固定入口）
 * - hover 放大 + 邻近让位（可开关）
 * - 运行中小圆点指示器
 * - 已开则 focus/还原，未开则 openApp
 * - 游戏全屏时滑出隐藏，鼠标到底部热区再滑出
 */
import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DOCK_APPS } from '../../data/dockApps';
import { useOsStore } from '../../store/osStore';
import { useThemeStore } from '../../store/themeStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { GlassPanel } from '../ui/GlassPanel';
import { DockItem } from './DockItem';

const BASE = 52;
const GAP = 10;
const MAGNIFY_PEAK = 1.42;

export const Dock: React.FC = () => {
  const windows = useOsStore((s) => s.windows);
  const focusedId = useOsStore((s) => s.focusedId);
  const openApp = useOsStore((s) => s.openApp);
  const focusWindow = useOsStore((s) => s.focusWindow);
  const restoreWindow = useOsStore((s) => s.restoreWindow);
  const gameFullscreen = useOsStore((s) => s.gameFullscreen);
  const dockMagnify = useThemeStore((s) => s.dockMagnify);
  const reduceMotion = usePrefersReducedMotion();
  const reduce = useThemeStore((s) => s.reduceMotion) || reduceMotion;

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const isMobile = useIsMobile();

  // 游戏全屏：鼠标到底部 14px 显示，离开 60px 隐藏
  useEffect(() => {
    if (!gameFullscreen) {
      setRevealed(false);
      return;
    }
    const onMove = (e: MouseEvent) => {
      const vh = window.innerHeight;
      if (e.clientY > vh - 14) setRevealed(true);
      else if (e.clientY < vh - 64) setRevealed(false);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [gameFullscreen]);

  const hidden = gameFullscreen && !revealed;

  const scales = useMemo(() => {
    if (!dockMagnify || hoverIndex === null) return DOCK_APPS.map(() => 1);
    return DOCK_APPS.map((_, i) => {
      const d = Math.abs(i - hoverIndex);
      const s = Math.max(1, MAGNIFY_PEAK - d * 0.32);
      return s;
    });
  }, [hoverIndex, dockMagnify]);

  const select = (appId: (typeof DOCK_APPS)[number]['appId']) => {
    const win = windows.find((w) => w.appId === appId);
    if (win) {
      if (win.minimized) restoreWindow(win.id);
      focusWindow(win.id);
    } else {
      openApp(appId);
    }
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[9000]"
      style={{ bottom: 10, display: 'flex', justifyContent: 'center' }}
    >
      <AnimatePresence>
        {!hidden && (
          <motion.div
            key="dock"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.9 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.9 }}
            transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 380, damping: 30 }}
            className="pointer-events-auto"
          >
            <GlassPanel radius="dock" shadow="dock" className="flex items-end px-3 pb-2 pt-2.5" highlight>
              <div className="flex items-end" style={{ gap: GAP }}>
                {DOCK_APPS.map((app, i) => {
                  const win = windows.find((w) => w.appId === app.appId);
                  const running = Boolean(win);
                  const focused = win ? win.id === focusedId : false;
                  return (
                    <DockItem
                      key={app.appId}
                      app={app}
                      running={running}
                      focused={focused}
                      scale={scales[i]}
                      size={isMobile ? 44 : 52}
                      onSelect={() => select(app.appId)}
                      onHover={() => setHoverIndex(i)}
                      onLeave={() => setHoverIndex(null)}
                    />
                  );
                })}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
