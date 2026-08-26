/**
 * AISniper OS — 主题常量与玻璃材质计算
 * glassLevel: 0 (Clear) ~ 100 (Tinted)
 */

export type AccentKey = 'blue' | 'purple' | 'cyan' | 'orange' | 'rose';
export type Appearance = 'light' | 'dark' | 'auto';
export type IconStyle = 'dark' | 'light' | 'tinted' | 'clear';
export type ClockFormat = '12h' | '24h';
export type Locale = 'zh' | 'en';

export interface AccentColor {
  key: AccentKey;
  color: string;
  label: string;
  /** 用于浅色玻璃上的强调色（深一点保证对比） */
  colorLight: string;
}

export const ACCENTS: AccentColor[] = [
  { key: 'blue', color: '#0a84ff', colorLight: '#0a66d6', label: '蓝' },
  { key: 'purple', color: '#bf5af2', colorLight: '#9b32d6', label: '紫' },
  { key: 'cyan', color: '#64d2ff', colorLight: '#1fa8e0', label: '青' },
  { key: 'orange', color: '#ff9f0a', colorLight: '#e07f00', label: '橙' },
  { key: 'rose', color: '#ff375f', colorLight: '#e01646', label: '玫瑰' },
];

export function accentOf(key: AccentKey): AccentColor {
  return ACCENTS.find((a) => a.key === key) ?? ACCENTS[0];
}

export interface GlassComputed {
  bg: string;
  bgStrong: string;
  blur: string;
  border: string;
  borderStrong: string;
  tint: string;
}

/**
 * 计算玻璃材质 RGBA。
 * Clear 端：更透、更大模糊；Tinted 端：更不透明 + 主题色染色 + 收一点模糊（保对比度）。
 */
export function computeGlass(glassLevel: number, theme: 'light' | 'dark', accent: string): GlassComputed {
  const level = Math.min(100, Math.max(0, glassLevel));
  const t = level / 100;

  if (theme === 'light') {
    const alpha = 0.34 + t * 0.46; // 0.34 -> 0.80
    const borderAlpha = 0.55 + t * 0.4;
    const blur = Math.round(30 - t * 12); // 30 -> 18
    return {
      bg: `rgba(255,255,255,${alpha.toFixed(3)})`,
      bgStrong: `rgba(255,255,255,${Math.min(0.96, alpha + 0.18).toFixed(3)})`,
      blur: `${blur}px`,
      border: `rgba(255,255,255,${borderAlpha.toFixed(3)})`,
      borderStrong: 'rgba(255,255,255,0.95)',
      tint: t > 0.45 ? hexToRgba(accent, (t - 0.45) * 0.16) : 'rgba(0,0,0,0)',
    };
  }

  const alpha = 0.16 + t * 0.56; // 0.16 -> 0.72
  const borderAlpha = 0.14 + t * 0.24;
  const blur = Math.round(30 - t * 10); // 30 -> 20
  return {
    bg: `rgba(30,34,46,${alpha.toFixed(3)})`,
    bgStrong: `rgba(36,40,54,${Math.min(0.9, alpha + 0.16).toFixed(3)})`,
    blur: `${blur}px`,
    border: `rgba(255,255,255,${borderAlpha.toFixed(3)})`,
    borderStrong: `rgba(255,255,255,${Math.min(0.6, borderAlpha + 0.18).toFixed(3)})`,
    tint: t > 0.4 ? hexToRgba(accent, (t - 0.4) * 0.14) : 'rgba(0,0,0,0)',
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

/** 深色壁纸上的玻璃底色需要提亮文字：给 text-shadow 提供参考 */
export function glassTextShadow(theme: 'light' | 'dark', level: number): string {
  if (theme === 'light') return '0 1px 2px rgba(255,255,255,0.4)';
  // 越 Clear 越需要深色文字阴影托底
  const t = level / 100;
  const a = 0.7 - t * 0.5;
  return a > 0 ? `0 1px 2px rgba(0,0,0,${a.toFixed(2)})` : 'none';
}
