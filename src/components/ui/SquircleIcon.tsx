/**
 * SquircleIcon — 多层玻璃 squircle 图标（超椭圆 + 3D 层叠高光）
 * iconStyle: dark / light / tinted / clear（来自 themeStore）
 */
import React from 'react';
import type { AppId } from '../../types/os';
import { FinderIcon, CalcIcon, SettingsIcon, TerminalIcon, GameIcon, type IconProps } from './icons';
import { useThemeStore } from '../../store/themeStore';
import type { IconStyle } from '../../theme/themes';

/** 每个 App 的 tinted 色相（Monterey 风格渐变） */
const APP_TINTS: Record<AppId, { from: string; to: string }> = {
  finder: { from: '#5bb8ff', to: '#0a66e8' },
  calculator: { from: '#ffc15a', to: '#f0790a' },
  settings: { from: '#a79cff', to: '#5e4fd8' },
  terminal: { from: '#5a5f6b', to: '#23262e' },
  game: { from: '#8f6bff', to: '#d44bff' },
};

const GLYPHS: Record<AppId, React.FC<IconProps>> = {
  finder: FinderIcon,
  calculator: CalcIcon,
  settings: SettingsIcon,
  terminal: TerminalIcon,
  game: GameIcon,
};

function bgFor(style: IconStyle, appId: AppId): string {
  const t = APP_TINTS[appId];
  switch (style) {
    case 'light':
      return 'linear-gradient(180deg, #ffffff 0%, #d9dce4 100%)';
    case 'dark':
      return 'linear-gradient(180deg, #5c6270 0%, #2a2d36 100%)';
    case 'tinted':
      return `linear-gradient(155deg, ${t.from} 0%, ${t.to} 100%)`;
    case 'clear':
      return 'linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.08))';
  }
}

function glyphColorFor(style: IconStyle): string {
  switch (style) {
    case 'light':
      return '#3a3d45';
    default:
      return '#ffffff';
  }
}

interface SquircleIconProps {
  appId: AppId;
  size?: number;
  className?: string;
}

export const SquircleIcon: React.FC<SquircleIconProps> = ({ appId, size = 48, className = '' }) => {
  const iconStyle = useThemeStore((s) => s.iconStyle);
  const Glyph = GLYPHS[appId];
  const radius = size * 0.228;
  const glyphSize = Math.round(size * 0.55);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center shadow-lg ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bgFor(iconStyle, appId),
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 16px rgba(0,0,0,0.35)',
      }}
      aria-hidden
    >
      {/* 顶部镜面高光 */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: size * 0.45,
          borderRadius: `${radius}px ${radius}px ${radius * 0.5}px ${radius * 0.5}px`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.02))',
        }}
      />
      <Glyph size={glyphSize} className="relative" />
      {/* 底部玻璃反光 */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: size * 0.22,
          borderRadius: `0 0 ${radius}px ${radius}px`,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.18), transparent)',
        }}
      />
    </div>
  );
};
