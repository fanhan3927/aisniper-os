/**
 * WifiPopover — Wi-Fi 开关 / 当前网络 / 附近网络列表
 * 关闭 Wi-Fi 时弹出 Toast「未连接」。
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useWifiStore } from '../../store/wifiStore';
import { useOsStore } from '../../store/osStore';
import { WIFI_SPEED } from '../../data/mockWifi';
import { WifiIcon } from '../ui/icons';
import { useThemeStore } from '../../store/themeStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className="relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200"
    style={{ background: checked ? 'var(--accent)' : 'var(--glass-bg-strong)' }}
  >
    <motion.span
      className="absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow"
      animate={{ left: checked ? 18 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 34 }}
    />
  </button>
);

const SignalBars: React.FC<{ level: number }> = ({ level }) => (
  <span className="flex items-end gap-[2px]" aria-hidden>
    {[0, 1, 2, 3].map((i) => (
      <span
        key={i}
        className="w-[3px] rounded-sm"
        style={{
          height: 4 + i * 3,
          background: i < level ? 'var(--accent)' : 'var(--text-tertiary)',
          opacity: i < level ? 0.9 : 0.4,
        }}
      />
    ))}
  </span>
);

export const WifiPopover: React.FC = () => {
  const { enabled, ssid, signal, networks, setEnabled, connect } = useWifiStore();
  const pushToast = useOsStore((s) => s.pushToast);
  const reduceMotion = usePrefersReducedMotion();
  const reduce = useThemeStore((s) => s.reduceMotion) || reduceMotion;

  const handleToggle = (v: boolean) => {
    setEnabled(v);
    if (!v) pushToast({ title: 'Wi-Fi 已关闭', message: '未连接任何网络', kind: 'warn' });
  };

  return (
    <div className="w-full" style={{ color: 'var(--text-primary)' }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-semibold">Wi-Fi</span>
        <Switch checked={enabled} onChange={handleToggle} label="Wi-Fi 开关" />
      </div>

      {/* 当前网络 */}
      <div
        className="mb-3 flex items-center justify-between rounded-xl px-3 py-2.5"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--accent-soft)' }}>
            <WifiIcon size={18} />
          </span>
          <div>
            <div className="text-[13px] font-medium">{enabled ? ssid : '未连接'}</div>
            <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              {enabled ? `${WIFI_SPEED} · 安全` : '打开 Wi-Fi 以连接网络'}
            </div>
          </div>
        </div>
        <SignalBars level={enabled ? signal : 0} />
      </div>

      {/* 附近网络 */}
      <div className="mb-1 text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
        附近网络
      </div>
      <div className="flex flex-col gap-0.5">
        {networks.map((n) => {
          const isCurrent = enabled && n.current;
          return (
            <button
              key={n.id}
              onClick={() => {
                connect(n.ssid);
                pushToast({ title: `已连接到 ${n.ssid}`, kind: 'success' });
              }}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--accent-soft)]"
              style={{ background: isCurrent ? 'var(--accent-soft)' : 'transparent' }}
            >
              <span className="text-[12.5px]" style={{ color: 'var(--text-primary)' }}>
                {n.ssid}
                {!n.secured && <span className="ml-1.5 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>开放</span>}
              </span>
              <span className="flex items-center gap-2">
                <SignalBars level={n.signal} />
                {isCurrent && (
                  <span className="text-[10px]" style={{ color: 'var(--accent)' }}>
                    已连接
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 border-t pt-2.5 text-[11px]" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-tertiary)' }}>
        隔空投送 · 附近设备占位（模拟）
      </div>
    </div>
  );
};
