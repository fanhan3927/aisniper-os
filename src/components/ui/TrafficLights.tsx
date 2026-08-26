/**
 * TrafficLights — 交通灯：红关 / 黄最小化 / 绿最大化（或游戏全屏）
 * hover 时显示符号。
 */
import React from 'react';

interface TrafficLightsProps {
  focused: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

const Light: React.FC<{ color: string; onClick: () => void; symbol: string; label: string; visible: boolean }> = ({
  color,
  onClick,
  symbol,
  label,
  visible,
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className="group/light flex h-[12px] w-[12px] items-center justify-center rounded-full transition-shadow hover:shadow-inner"
    style={{ background: color }}
  >
    <span
      className="text-[9px] font-bold leading-none transition-opacity"
      style={{ color: 'rgba(0,0,0,0.55)', opacity: visible ? 1 : 0 }}
    >
      {symbol}
    </span>
  </button>
);

export const TrafficLights: React.FC<TrafficLightsProps> = ({ focused, onClose, onMinimize, onMaximize }) => (
  <div className="group flex items-center gap-2">
    <Light color="var(--traffic-red)" onClick={onClose} symbol="×" label="关闭" visible={focused} />
    <Light color="var(--traffic-yellow)" onClick={onMinimize} symbol="−" label="最小化" visible={focused} />
    <Light color="var(--traffic-green)" onClick={onMaximize} symbol="+" label="最大化" visible={focused} />
  </div>
);
