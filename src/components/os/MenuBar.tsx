/**
 * MenuBar — 顶部透明菜单栏
 * 左：AISniper 瞄准镜 Logo + 当前前台 App 名；右：状态图标簇 + 时钟。
 * 视觉透明（壁纸透上来），命中层在最前。
 */
import React, { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOsStore } from '../../store/osStore';
import { APP_META } from '../../types/os';
import { MENU_BAR_H } from '../../lib/layout';
import { LogoIcon } from '../ui/icons';
import { StatusIcons } from './StatusIcons';
import { MenuClock } from './MenuClock';
import { PopoverShell } from './PopoverShell';
import { WifiPopover } from './WifiPopover';
import { HealthPopover } from './HealthPopover';
import { CalendarPopover } from './CalendarPopover';

export const MenuBar: React.FC = () => {
  const openPopover = useOsStore((s) => s.openPopover);
  const setPopover = useOsStore((s) => s.setPopover);
  const closePopover = useOsStore((s) => s.closePopover);
  const focusedId = useOsStore((s) => s.focusedId);
  const windows = useOsStore((s) => s.windows);
  const gameFullscreen = useOsStore((s) => s.gameFullscreen);

  const wifiRef = useRef<HTMLButtonElement>(null);
  const healthRef = useRef<HTMLButtonElement>(null);
  const clockRef = useRef<HTMLButtonElement>(null);

  // 前台 App 名
  const focused = windows.find((w) => w.id === focusedId);
  const appName = focused ? APP_META[focused.appId].name : '桌面';

  const anchorFor = (kind: 'wifi' | 'health' | 'clock'): HTMLElement | null => {
    const ref = kind === 'wifi' ? wifiRef : kind === 'health' ? healthRef : clockRef;
    return ref.current;
  };

  // 全屏游戏时菜单栏收起为 4px 热区（内容隐藏）
  if (gameFullscreen) {
    return <div className="fixed inset-x-0 top-0 z-[10000]" style={{ height: 4 }} aria-hidden />;
  }

  return (
    <header
      className="fixed inset-x-0 top-0 z-[10000] flex items-center justify-between px-2.5"
      style={{ height: MENU_BAR_H }}
    >
      {/* 左侧：Logo + App 名 */}
      <div className="flex items-center gap-2">
        <button
          className="pressable flex h-5 w-5 items-center justify-center rounded-md"
          onClick={() => closePopover()}
          aria-label="AISniper OS"
          title="AISniper OS"
        >
          <LogoIcon size={15} />
        </button>
        <span
          className="text-[12.5px] font-semibold tracking-wide"
          style={{ color: 'var(--text-primary)', textShadow: 'var(--glass-text-shadow)' }}
        >
          AISniper
        </span>
        <span className="mx-1 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          /
        </span>
        <span className="max-w-[180px] truncate text-[12px]" style={{ color: 'var(--text-secondary)', textShadow: 'var(--glass-text-shadow)' }}>
          {appName}
        </span>
      </div>

      {/* 右侧：状态簇 + 时钟 */}
      <div className="flex items-center gap-1.5">
        <StatusIcons wifiRef={wifiRef} healthRef={healthRef} />
        <button
          ref={clockRef}
          className="pressable rounded-md px-2 py-0.5"
          style={{ background: openPopover === 'clock' ? 'var(--glass-bg-strong)' : 'transparent' }}
          onClick={() => setPopover('clock')}
          aria-label="时钟与日历"
        >
          <MenuClock />
        </button>
      </div>

      {/* 状态弹窗（互斥） */}
      <AnimatePresence>
        {openPopover === 'wifi' && (
          <PopoverShell key="wifi" anchor={anchorFor('wifi')} width={300} onClose={closePopover}>
            <WifiPopover />
          </PopoverShell>
        )}
        {openPopover === 'health' && (
          <PopoverShell key="health" anchor={anchorFor('health')} width={300} onClose={closePopover}>
            <HealthPopover />
          </PopoverShell>
        )}
        {openPopover === 'clock' && (
          <PopoverShell key="clock" anchor={anchorFor('clock')} width={300} onClose={closePopover}>
            <CalendarPopover />
          </PopoverShell>
        )}
      </AnimatePresence>
    </header>
  );
};
