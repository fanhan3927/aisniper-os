/**
 * 原创 SVG 图标集 — 全部手绘，不使用任何 Apple 商标图形。
 * 统一 API：size / className / strokeWidth。
 */
import React from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

function base(props: IconProps): Pick<IconProps, 'className' | 'strokeWidth'> {
  return { className: props.className, strokeWidth: props.strokeWidth ?? 2 };
}

/** AISniper 瞄准镜 Logo */
export const LogoIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" {...base(p)} aria-hidden>
    <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="2.4" opacity="0.9" />
    <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
    <circle cx="24" cy="24" r="2.6" fill="currentColor" />
    <path d="M24 2v8M24 38v8M2 24h8M38 24h8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
    <path d="M37.5 10.5l-4.2 4.2M10.5 37.5l4.2-4.2M10.5 10.5l4.2 4.2M37.5 37.5l-4.2-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
  </svg>
);

/** Finder：双窗格文件浏览 */
export const FinderIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <path d="M3 8.5h18" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <rect x="5.2" y="10.5" width="6" height="7" rx="1" fill="currentColor" opacity="0.45" />
    <rect x="12.8" y="10.5" width="6" height="4.4" rx="1" fill="currentColor" opacity="0.22" />
  </svg>
);

/** 计算器 */
export const CalcIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <rect x="6.4" y="5.4" width="11.2" height="3.4" rx="1" fill="currentColor" opacity="0.35" />
    <g fill="currentColor">
      <rect x="6.5" y="10.5" width="3" height="2.6" rx="0.8" />
      <rect x="10.5" y="10.5" width="3" height="2.6" rx="0.8" />
      <rect x="14.5" y="10.5" width="3" height="2.6" rx="0.8" />
      <rect x="6.5" y="14.4" width="3" height="2.6" rx="0.8" />
      <rect x="10.5" y="14.4" width="3" height="2.6" rx="0.8" />
      <rect x="14.5" y="14.4" width="3" height="2.6" rx="0.8" opacity="0.5" />
      <rect x="6.5" y="18.2" width="7.4" height="2" rx="0.8" opacity="0.6" />
    </g>
  </svg>
);

/** 设置：齿轮 */
export const SettingsIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path
      d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8zm0-2.9c.55 0 1.08.08 1.6.22l.5-1.05 1.95.85-.32 1.12c.5.3.94.66 1.32 1.1l1.12-.38.85 1.95-1.05.5c.06.55.06 1.12 0 1.67l1.05.5-.85 1.95-1.12-.38c-.38.44-.82.8-1.32 1.1l.32 1.12-1.95.85-.5-1.05a6.6 6.6 0 0 1-1.6.22c-.55 0-1.08-.08-1.6-.22l-.5 1.05-1.95-.85.32-1.12a5.9 5.9 0 0 1-1.32-1.1l-1.12.38-.85-1.95 1.05-.5a6.6 6.6 0 0 1 0-1.67l-1.05-.5.85-1.95 1.12.38c.38-.44.82-.8 1.32-1.1l-.32-1.12 1.95-.85.5 1.05c.52-.14 1.05-.22 1.6-.22z"
      fill="currentColor"
    />
    <circle cx="12" cy="12" r="2.2" fill="var(--glass-bg-strong)" />
  </svg>
);

/** 终端：提示符 */
export const TerminalIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <rect x="3" y="4.5" width="18" height="15" rx="3" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <path d="M6.5 9.5l3.2 2.5-3.2 2.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 14.5h4.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" />
  </svg>
);

/** 太空射击：飞船 */
export const GameIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M12 3l2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3z" fill="currentColor" opacity="0.9" />
    <path d="M12 6.5v4M12 13.5v4M6.5 12h4M13.5 12h4" stroke="var(--glass-bg-strong)" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

/** Wi-Fi */
export const WifiIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M2.5 9.2a14.5 14.5 0 0 1 19 0" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" />
    <path d="M5.5 12.6a10 10 0 0 1 13 0" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" />
    <path d="M8.7 15.9a5.6 5.6 0 0 1 6.6 0" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" />
    <circle cx="12" cy="19.2" r="1.5" fill="currentColor" />
  </svg>
);

export const WifiOffIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M2.5 9.2a14.5 14.5 0 0 1 19 0" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" />
    <path d="M5.5 12.6a10 10 0 0 1 13 0" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" />
    <path d="M8.7 15.9a5.6 5.6 0 0 1 6.6 0" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" />
    <circle cx="12" cy="19.2" r="1.5" fill="currentColor" />
    <path d="M3.5 3.5l17 17" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" />
  </svg>
);

/** 系统健康：脉冲 */
export const HealthIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <rect x="3.5" y="4" width="17" height="16" rx="4" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <path
      d="M5.5 12.5h3l1.6-3.4 2.6 6 1.7-3.4 1.2 0.8h2.9"
      stroke="currentColor"
      strokeWidth={p.strokeWidth ?? 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** 电池 */
export const BatteryIcon: React.FC<{ size?: number; level?: number; className?: string }> = ({ size = 16, level = 0.8, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
    <rect x="2.5" y="7" width="17" height="10" rx="2.5" stroke="currentColor" strokeWidth={1.6} opacity="0.55" />
    <rect x="21" y="10" width="2.2" height="4" rx="1" fill="currentColor" opacity="0.55" />
    <rect x="4.5" y="9" width={Math.max(1, 13 * level)} height="6" rx="1" fill="currentColor" />
  </svg>
);

/** 日历 / 时钟（菜单） */
export const ClockIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <path d="M12 7.5V12l3 1.8" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" />
  </svg>
);

/** 搜索 */
export const SearchIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <path d="M15.8 15.8L20.5 20.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" />
  </svg>
);

export const BackIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M14.5 5.5L8 12l6.5 6.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ForwardIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M9.5 5.5L16 12l-6.5 6.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GridIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <rect x="4" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <rect x="14" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <rect x="4" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <rect x="14" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
  </svg>
);

export const ListIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" />
    <circle cx="5" cy="6" r="1.2" fill="currentColor" />
    <circle cx="5" cy="12" r="1.2" fill="currentColor" />
    <circle cx="5" cy="18" r="1.2" fill="currentColor" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M7.5 5.2v13.6L19 12 7.5 5.2z" fill="currentColor" />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" />
    <rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" />
  </svg>
);

/** 全屏 */
export const FullscreenIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ExitFullscreenIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M4.5 6.5h15" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" />
    <path d="M9 6.5V4.8A1.3 1.3 0 0 1 10.3 3.5h3.4A1.3 1.3 0 0 1 15 4.8v1.7" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <path d="M6.5 6.5l.8 12.2a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5l.8-12.2" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" />
    <path d="M10 10.5v6M14 10.5v6" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={p.strokeWidth ?? 2} strokeLinecap="round" />
  </svg>
);

/** 文件夹 */
export const FolderIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path
      d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4.2l1.8 2H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5v-11z"
      fill="currentColor"
      opacity="0.85"
      stroke="none"
    />
    <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.4} opacity="0.4" />
  </svg>
);

/** 文本文件 */
export const FileTextIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M6 3.5h8l4 4V20.5H6z" fill="currentColor" opacity="0.85" stroke="none" />
    <path d="M14 3.5v4h4" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.4} fill="none" />
    <path d="M9 11h6M9 14h6M9 17h4" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.4} strokeLinecap="round" />
  </svg>
);

/** 图片 */
export const ImageIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <rect x="3.5" y="4" width="17" height="16" rx="2.5" fill="currentColor" opacity="0.85" stroke="none" />
    <circle cx="9" cy="9.5" r="1.6" fill="var(--glass-bg-strong)" />
    <path d="M4.5 17l4.5-4.5 3 3 3.5-3.5 4 4" stroke="var(--glass-bg-strong)" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
  </svg>
);

/** 应用文件 */
export const AppFileIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="currentColor" opacity="0.9" stroke="none" />
    <path d="M12 7.5l1.4 3.1 3.1 1.4-3.1 1.4L12 16.5l-1.4-3.1-3.1-1.4 3.1-1.4L12 7.5z" fill="var(--glass-bg-strong)" />
  </svg>
);

/** 日志 */
export const LogIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <rect x="3.5" y="4" width="17" height="16" rx="2.5" fill="currentColor" opacity="0.85" stroke="none" />
    <path d="M7 9h10M7 12.5h7M7 16h9" stroke="var(--glass-bg-strong)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="17" cy="16" r="1.2" fill="var(--glass-bg-strong)" />
  </svg>
);

/** 废纸篓 */
export const BinIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <path d="M4.5 6.5h15" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" />
    <path d="M9 6.5V4.8A1.3 1.3 0 0 1 10.3 3.5h3.4A1.3 1.3 0 0 1 15 4.8v1.7" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <path d="M6.5 6.5l.8 12.2a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5l.8-12.2" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" />
  </svg>
);

/** 硬盘 / 桌面电脑 */
export const DriveIcon: React.FC<IconProps> = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...base(p)} aria-hidden>
    <rect x="3.5" y="7" width="17" height="10" rx="2" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} />
    <circle cx="7" cy="12" r="1.2" fill="currentColor" />
    <path d="M10 12h7" stroke="currentColor" strokeWidth={p.strokeWidth ?? 1.8} strokeLinecap="round" opacity="0.5" />
  </svg>
);
