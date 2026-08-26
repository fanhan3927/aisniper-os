/**
 * SettingsApp — 系统设置
 * 外观（浅/深/自动）/ Liquid Glass 滑杆 / 强调色 / 图标外观 / 壁纸 /
 * 时钟格式 / Dock 放大 / 减少动效 / 声音 / 关于本机
 * 所有改动即时写入 themeStore 并全局生效。
 */
import React, { useState } from 'react';
import type { AccentKey } from '../../theme/themes';
import { ACCENTS } from '../../theme/themes';
import { useThemeStore, type ThemeState } from '../../store/themeStore';
import { WALLPAPERS } from '../../data/wallpapers';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Slider } from '../ui/Slider';
import { Switch } from '../ui/Switch';
import { SquircleIcon } from '../ui/SquircleIcon';
import { LogoIcon } from '../ui/icons';

type Category = 'appearance' | 'desktop' | 'clock' | 'sound' | 'about';

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'appearance', label: '外观', icon: '◐' },
  { id: 'desktop', label: '桌面与 Dock', icon: '▦' },
  { id: 'clock', label: '时钟', icon: '🕒' },
  { id: 'sound', label: '声音', icon: '♪' },
  { id: 'about', label: '关于本机', icon: 'ℹ' },
];

const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '12px 4px',
  borderBottom: '1px solid var(--glass-border)',
};

export const SettingsApp: React.FC = () => {
  const [category, setCategory] = useState<Category>('appearance');

  const theme = useThemeStore();

  return (
    <div className="flex h-full w-full" style={{ background: 'var(--window-content-bg)' }}>
      {/* 侧边栏 */}
      <aside className="w-[190px] shrink-0 overflow-y-auto px-2 py-3" style={{ borderRight: '1px solid var(--glass-border)' }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className="mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[12.5px]"
            style={{
              background: category === c.id ? 'var(--accent-soft)' : 'transparent',
              color: 'var(--text-primary)',
              fontWeight: category === c.id ? 500 : 400,
            }}
            onClick={() => setCategory(c.id)}
          >
            <span className="w-4 text-center text-[13px] opacity-80" aria-hidden>
              {c.icon}
            </span>
            {c.label}
          </button>
        ))}
      </aside>

      {/* 内容 */}
      <main className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
        <h2 className="mb-4 text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {CATEGORIES.find((c) => c.id === category)?.label}
        </h2>
        {category === 'appearance' && <AppearanceSection theme={theme} />}
        {category === 'desktop' && <DesktopSection theme={theme} />}
        {category === 'clock' && <ClockSection theme={theme} />}
        {category === 'sound' && <SoundSection theme={theme} />}
        {category === 'about' && <AboutSection />}
      </main>
    </div>
  );
};

/* ---------------- 外观 ---------------- */
const AppearanceSection: React.FC<{ theme: ThemeState }> = ({ theme }) => (
  <div className="max-w-[480px]">
    <Section label="外观" desc="选择整体配色，自动会跟随系统深浅色。">
      <SegmentedControl
        id="appearance"
        value={theme.appearance}
        onChange={theme.setAppearance}
        options={[
          { value: 'light', label: '浅色' },
          { value: 'dark', label: '深色' },
          { value: 'auto', label: '自动' },
        ]}
      />
    </Section>

    <Section label="Liquid Glass" desc="Clear 更通透，Tinted 更实、保对比度。">
      <Slider
        min={0}
        max={100}
        value={theme.glassLevel}
        onChange={theme.setGlassLevel}
        leftLabel="Clear"
        rightLabel="Tinted"
      />
    </Section>

    <Section label="强调色" desc="影响开关、焦点环、Dock 指示点。">
      <div className="flex gap-2.5">
        {ACCENTS.map((a) => (
          <button
            key={a.key}
            className="pressable relative flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: a.color }}
            onClick={() => theme.setAccent(a.key as AccentKey)}
            aria-label={`强调色 ${a.label}`}
            title={a.label}
          >
            {theme.accent === a.key && (
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow" />
            )}
            {theme.accent === a.key && (
              <span
                className="absolute -inset-1 rounded-full"
                style={{ boxShadow: `0 0 0 2px var(--glass-bg), 0 0 0 3.5px ${a.color}` }}
                aria-hidden
              />
            )}
          </button>
        ))}
      </div>
    </Section>

    <Section label="图标外观" desc="Dock 与桌面的图标风格。">
      <SegmentedControl
        id="iconstyle"
        value={theme.iconStyle}
        onChange={theme.setIconStyle}
        options={[
          { value: 'dark', label: '深色' },
          { value: 'light', label: '浅色' },
          { value: 'tinted', label: '着色' },
          { value: 'clear', label: 'Clear' },
        ]}
      />
      <div className="mt-4 flex gap-3">
        {(['finder', 'game', 'terminal'] as const).map((app) => (
          <SquircleIcon key={app} appId={app} size={46} />
        ))}
      </div>
    </Section>
  </div>
);

/* ---------------- 桌面与 Dock ---------------- */
const DesktopSection: React.FC<{ theme: ThemeState }> = ({ theme }) => (
  <div className="max-w-[520px]">
    <Section label="壁纸" desc="桌面背景，随选择即时切换。">
      <div className="grid grid-cols-2 gap-2.5">
        {WALLPAPERS.map((w) => (
          <button
            key={w.id}
            className="overflow-hidden rounded-xl text-left transition-transform hover:scale-[1.02]"
            style={{
              border: theme.wallpaperId === w.id ? `2px solid var(--accent)` : '1px solid var(--glass-border)',
            }}
            onClick={() => theme.setWallpaper(w.id)}
            aria-label={`壁纸 ${w.name}`}
          >
            <div className="h-[64px] w-full" style={{ background: w.css }} />
            <div
              className="px-2.5 py-1.5 text-[11.5px]"
              style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
            >
              {w.name}
              <span className="ml-1.5 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                {w.nameEn}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Section>

    <Section label="Dock" desc="图标 hover 放大与邻近让位。">
      <div style={ROW}>
        <span className="text-[12.5px]" style={{ color: 'var(--text-primary)' }}>
          Dock 放大效果
        </span>
        <Switch checked={theme.dockMagnify} onChange={theme.setDockMagnify} label="Dock 放大" />
      </div>
    </Section>

    <Section label="辅助功能" desc="减少桌面动画与 spring 动效。">
      <div style={ROW}>
        <span className="text-[12.5px]" style={{ color: 'var(--text-primary)' }}>
          减少动态效果
        </span>
        <Switch checked={theme.reduceMotion} onChange={theme.setReduceMotion} label="减少动态效果" />
      </div>
    </Section>
  </div>
);

/* ---------------- 时钟 ---------------- */
const ClockSection: React.FC<{ theme: ThemeState }> = ({ theme }) => (
  <div className="max-w-[480px]">
    <Section label="时间格式" desc="菜单栏时钟的显示方式。">
      <SegmentedControl
        id="clockfmt"
        value={theme.clockFormat}
        onChange={theme.setClockFormat}
        options={[
          { value: '24h', label: '24 小时' },
          { value: '12h', label: '12 小时' },
        ]}
      />
    </Section>
    <Section label="语言" desc="星期与日期的语言。">
      <SegmentedControl
        id="locale"
        value={theme.locale}
        onChange={theme.setLocale}
        options={[
          { value: 'zh', label: '中文' },
          { value: 'en', label: 'English' },
        ]}
      />
    </Section>
  </div>
);

/* ---------------- 声音 ---------------- */
const SoundSection: React.FC<{ theme: ThemeState }> = ({ theme }) => (
  <div className="max-w-[480px]">
    <Section label="声音" desc="UI 与游戏音效开关（Web Audio 合成）。">
      <div style={ROW}>
        <span className="text-[12.5px]" style={{ color: 'var(--text-primary)' }}>
          播放界面音效
        </span>
        <Switch checked={theme.soundEnabled} onChange={theme.setSoundEnabled} label="界面音效" />
      </div>
    </Section>
  </div>
);

/* ---------------- 关于本机 ---------------- */
const AboutSection: React.FC = () => {
  const [memUsed] = useState(() => 6.2 + Math.random() * 1.4);
  return (
    <div className="flex max-w-[480px] flex-col items-center gap-3 pt-4 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-[24px]"
        style={{ background: 'linear-gradient(155deg,#0a84ff,#7c5cff)', boxShadow: '0 12px 32px rgba(10,132,255,0.35)' }}
      >
        <LogoIcon size={44} className="text-white" />
      </div>
      <div>
        <div className="text-[19px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          AISniper OS
        </div>
        <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          版本 0.1.0 (Golden Gate 风格)
        </div>
      </div>
      <div className="mt-2 w-full space-y-1.5 rounded-xl p-4 text-[12px]" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
        <InfoRow k="芯片" v="Sniper Neural GPU（模拟）" />
        <InfoRow k="内存" v={`${memUsed.toFixed(1)} GB 已用（模拟）`} />
        <InfoRow k="浏览器" v={navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' : 'Chromium'} />
        <InfoRow k="类型" v="纯前端模拟 OS · 无真实系统权限" />
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div className="flex items-center justify-between gap-4">
    <span style={{ color: 'var(--text-tertiary)' }}>{k}</span>
    <span className="text-right" style={{ color: 'var(--text-primary)' }}>
      {v}
    </span>
  </div>
);

const Section: React.FC<{ label: string; desc?: string; children: React.ReactNode }> = ({ label, desc, children }) => (
  <div className="mb-7">
    <div className="mb-2">
      <div className="text-[13.5px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
      </div>
      {desc && (
        <div className="mt-0.5 text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>
          {desc}
        </div>
      )}
    </div>
    {children}
  </div>
);
