/**
 * StatusIcons — 菜单栏右侧状态簇：Wi-Fi / 系统健康 / 电池（模拟）
 * 点击切换 osStore.openPopover（互斥）。
 */
import React from 'react';
import { useOsStore } from '../../store/osStore';
import { useWifiStore } from '../../store/wifiStore';
import { WifiIcon, WifiOffIcon, HealthIcon, BatteryIcon } from '../ui/icons';

interface StatusIconsProps {
  wifiRef: React.RefObject<HTMLButtonElement>;
  healthRef: React.RefObject<HTMLButtonElement>;
}

export const StatusIcons: React.FC<StatusIconsProps> = ({ wifiRef, healthRef }) => {
  const openPopover = useOsStore((s) => s.openPopover);
  const setPopover = useOsStore((s) => s.setPopover);
  const wifiOn = useWifiStore((s) => s.enabled);

  return (
    <div className="flex items-center gap-0.5">
      <button
        ref={wifiRef}
        className="pressable flex h-6 w-7 items-center justify-center rounded-md"
        style={{ background: openPopover === 'wifi' ? 'var(--glass-bg-strong)' : 'transparent' }}
        onClick={() => setPopover('wifi')}
        aria-label={wifiOn ? 'Wi-Fi 已连接' : 'Wi-Fi 已关闭'}
        title={wifiOn ? 'Wi-Fi' : 'Wi-Fi 已关闭'}
      >
        {wifiOn ? <WifiIcon size={15} /> : <WifiOffIcon size={15} className="opacity-60" />}
      </button>

      <button
        ref={healthRef}
        className="pressable flex h-6 w-7 items-center justify-center rounded-md"
        style={{ background: openPopover === 'health' ? 'var(--glass-bg-strong)' : 'transparent' }}
        onClick={() => setPopover('health')}
        aria-label="系统健康度"
        title="系统健康度"
      >
        <HealthIcon size={15} />
      </button>

      <div className="flex h-6 w-7 items-center justify-center" title="电池（模拟）">
        <BatteryIcon size={17} level={0.86} className="opacity-80" />
      </div>
    </div>
  );
};
