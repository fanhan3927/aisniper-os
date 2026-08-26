/**
 * Desktop — 桌面舞台
 * 层次：壁纸 < 桌面空白点击层 < 桌面图标(步骤11) < 窗口 < Dock < 菜单栏
 */
import React from 'react';
import { useOsStore } from '../../store/osStore';
import { useThemeStore } from '../../store/themeStore';
import { wallpaperById } from '../../data/wallpapers';
import { Starfield } from './Starfield';
import { MenuBar } from './MenuBar';
import { WindowManager } from './WindowManager';
import { Dock } from './Dock';
import { DesktopIcons } from './DesktopIcons';

export const Desktop: React.FC = () => {
  const closePopover = useOsStore((s) => s.closePopover);
  const wallpaperId = useThemeStore((s) => s.wallpaperId);
  const wallpaper = wallpaperById(wallpaperId);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: 'var(--bg-desktop)' }}>
      {/* 壁纸层（最底） */}
      <div className="absolute inset-0" style={{ background: wallpaper.css }}>
        <Starfield className={wallpaper.id === 'deepspace' ? 'opacity-100' : 'opacity-30'} />
      </div>

      {/* 桌面空白：点击关闭所有弹窗（位于窗口之下） */}
      <div className="absolute inset-0 z-[50]" onPointerDown={() => closePopover()} aria-hidden />

      {/* 桌面图标 */}
      <DesktopIcons />

      {/* 窗口层 */}
      <WindowManager />

      {/* Dock */}
      <Dock />

      {/* 菜单栏（命中最前） */}
      <MenuBar />
    </div>
  );
};
