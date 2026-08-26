/**
 * themeStore — 主题与外观偏好（Zustand + persist 到 localStorage）
 * appearance: light / dark / auto（auto 跟随 prefers-color-scheme）
 * glassLevel: 0 Clear ~ 100 Tinted
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccentKey, Appearance, ClockFormat, IconStyle, Locale } from '../theme/themes';
import { accentOf, computeGlass, glassTextShadow, hexToRgba } from '../theme/themes';

export interface ThemeState {
  appearance: Appearance;
  glassLevel: number;
  accent: AccentKey;
  wallpaperId: string;
  iconStyle: IconStyle;
  clockFormat: ClockFormat;
  locale: Locale;
  dockMagnify: boolean;
  reduceMotion: boolean;
  soundEnabled: boolean;
  /** 由 appearance 解析出的实际明暗（auto 时跟随系统） */
  resolvedTheme: 'light' | 'dark';

  setAppearance: (v: Appearance) => void;
  setGlassLevel: (v: number) => void;
  setAccent: (v: AccentKey) => void;
  setWallpaper: (id: string) => void;
  setIconStyle: (v: IconStyle) => void;
  setClockFormat: (v: ClockFormat) => void;
  setLocale: (v: Locale) => void;
  setDockMagnify: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  /** 重新解析 auto 并写回 DOM 变量 */
  resolve: () => void;
  toggleTheme: () => void;
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** 把主题状态写入 <html>：data-theme + 玻璃/强调色 CSS 变量 */
export function applyThemeVars(s: Pick<ThemeState, 'appearance' | 'glassLevel' | 'accent' | 'resolvedTheme'>): void {
  const root = document.documentElement;
  const accent = accentOf(s.accent);

  root.dataset.theme = s.resolvedTheme;
  const glass = computeGlass(s.glassLevel, s.resolvedTheme, accent.color);

  const style = root.style;
  style.setProperty('--accent', accent.color);
  style.setProperty('--accent-soft', hexToRgba(accent.color, 0.22));
  style.setProperty('--glass-bg', glass.bg);
  style.setProperty('--glass-bg-strong', glass.bgStrong);
  style.setProperty('--glass-blur', glass.blur);
  style.setProperty('--glass-border', glass.border);
  style.setProperty('--glass-border-strong', glass.borderStrong);
  style.setProperty('--glass-tint', glass.tint);
  style.setProperty('--glass-text-shadow', glassTextShadow(s.resolvedTheme, s.glassLevel));

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', s.resolvedTheme === 'dark' ? '#07080c' : '#d9dce2');
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      appearance: 'dark',
      glassLevel: 46,
      accent: 'blue',
      wallpaperId: 'deepspace',
      iconStyle: 'tinted',
      clockFormat: '24h',
      locale: 'zh',
      dockMagnify: true,
      reduceMotion: false,
      soundEnabled: true,
      resolvedTheme: 'dark',

      setAppearance: (v) => {
        set({ appearance: v });
        get().resolve(); // 立即重算 resolvedTheme 并写回 DOM 变量
      },
      setGlassLevel: (v) => {
        set({ glassLevel: Math.min(100, Math.max(0, v)) });
        get().resolve();
      },
      setAccent: (v) => {
        set({ accent: v });
        get().resolve();
      },
      setWallpaper: (id) => set({ wallpaperId: id }),
      setIconStyle: (v) => set({ iconStyle: v }),
      setClockFormat: (v) => set({ clockFormat: v }),
      setLocale: (v) => set({ locale: v }),
      setDockMagnify: (v) => set({ dockMagnify: v }),
      setReduceMotion: (v) => set({ reduceMotion: v }),
      setSoundEnabled: (v) => set({ soundEnabled: v }),

      resolve: () => {
        const { appearance } = get();
        const resolved = appearance === 'auto' ? (systemPrefersDark() ? 'dark' : 'light') : appearance;
        const next = { ...get(), resolvedTheme: resolved };
        set({ resolvedTheme: resolved });
        applyThemeVars(next);
      },

      toggleTheme: () => {
        const { resolvedTheme, setAppearance } = get();
        setAppearance(resolvedTheme === 'dark' ? 'light' : 'dark');
      },
    }),
    {
      name: 'aisniper-theme',
      partialize: (s) => ({
        appearance: s.appearance,
        glassLevel: s.glassLevel,
        accent: s.accent,
        wallpaperId: s.wallpaperId,
        iconStyle: s.iconStyle,
        clockFormat: s.clockFormat,
        locale: s.locale,
        dockMagnify: s.dockMagnify,
        reduceMotion: s.reduceMotion,
        soundEnabled: s.soundEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.resolve();
      },
    },
  ),
);

/** 订阅 prefers-color-scheme 变化（auto 模式用） */
export function watchSystemTheme(): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const s = useThemeStore.getState();
    if (s.appearance === 'auto') s.resolve();
  };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
