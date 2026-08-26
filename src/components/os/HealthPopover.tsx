/**
 * HealthPopover — 系统健康度：CPU/内存/GPU/温度/风扇 + 总分 + 30 点迷你折线
 */
import React from 'react';
import { useSimulatedHealth, healthColor } from '../../hooks/useSimulatedHealth';

const Label: React.FC<{ label: string }> = ({ label }) => (
  <div className="w-[34px] shrink-0 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
    {label}
  </div>
);

const Bar: React.FC<{ value: number; color?: string }> = ({ value, color }) => (
  <div className="relative h-[6px] flex-1 overflow-hidden rounded-full" style={{ background: 'var(--glass-bg-strong)' }}>
    <div
      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
      style={{ width: `${value}%`, background: color ?? 'var(--accent)' }}
    />
  </div>
);

function MiniTrend({ data, color }: { data: number[]; color: string }) {
  const w = 220;
  const h = 44;
  const max = 100;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="5" strokeLinejoin="round" opacity="0.15" />
    </svg>
  );
}

export const HealthPopover: React.FC = () => {
  const h = useSimulatedHealth();
  const color = healthColor(h.score);

  const items = [
    { label: 'CPU', value: h.cpu },
    { label: '内存', value: h.mem },
    { label: 'GPU', value: h.gpu },
    { label: '温度', value: h.temp, color: h.temp > 70 ? '#ff453a' : h.temp > 55 ? '#ffd60a' : undefined },
  ];

  return (
    <div className="w-full" style={{ color: 'var(--text-primary)' }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-semibold">系统健康度</span>
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            总分
          </span>
          <span className="tnum text-[16px] font-bold" style={{ color }}>
            {h.score}
          </span>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2.5">
            <Label label={it.label} />
            <Bar value={it.value} color={it.color} />
            <span className="tnum w-[34px] text-right text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              {it.value}%
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2.5">
          <Label label="风扇" />
          <span className="tnum text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {h.fan} rpm
          </span>
        </div>
      </div>

      <div className="rounded-xl p-2.5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
        <MiniTrend data={h.history} color={color} />
        <div className="mt-1 text-center text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          近 30 秒负载趋势（模拟）
        </div>
      </div>
    </div>
  );
};
