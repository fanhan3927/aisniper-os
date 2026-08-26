/**
 * Slider — 玻璃滑杆（Liquid Glass 通透滑杆等复用）
 */
import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  label?: string;
  /** 左侧 / 右侧刻度文案 */
  leftLabel?: string;
  rightLabel?: string;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({ min, max, value, onChange, label, leftLabel, rightLabel, step = 1 }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      {(label || leftLabel || rightLabel) && (
        <div className="mb-1.5 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          <span>{label ?? leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
      <input
        type="range"
        className="as-slider w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill': `${pct}%` } as React.CSSProperties}
        aria-label={label}
      />
    </div>
  );
};
