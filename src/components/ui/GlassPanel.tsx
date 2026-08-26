/**
 * GlassPanel — 全 OS 统一玻璃材质容器
 * 圆角 / backdrop-blur / 半透明背景 / 1px 边 / 顶部镜面高光 / 可选 Tinted 染色
 * 所有菜单、窗口、Dock、弹窗都应使用它（或等价的 .glass token）。
 */
import React from 'react';

export type GlassTone = 'default' | 'strong' | 'subtle';
export type GlassRadius = 'window' | 'popover' | 'dock' | 'none';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: GlassTone;
  radius?: GlassRadius | number;
  /** 顶部镜面高光 */
  highlight?: boolean;
  /** 主题色 Tinted 染色层 */
  tint?: boolean;
  shadow?: 'window' | 'popover' | 'dock' | 'none';
  innerRef?: React.Ref<HTMLDivElement>;
}

const RADIUS_MAP: Record<GlassRadius, string> = {
  window: 'var(--radius-window)',
  popover: 'var(--radius-popover)',
  dock: 'var(--radius-dock)',
  none: '0px',
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
  tone = 'default',
  radius = 'popover',
  highlight = true,
  tint = false,
  shadow = 'none',
  className = '',
  style,
  children,
  innerRef,
  ...rest
}) => {
  const radiusValue = typeof radius === 'number' ? `${radius}px` : RADIUS_MAP[radius];

  return (
    <div
      ref={innerRef}
      className={['glass', 'relative', className].join(' ')}
      style={{
        borderRadius: radiusValue,
        background: tone === 'strong' ? 'var(--glass-bg-strong)' : tone === 'subtle' ? 'transparent' : 'var(--glass-bg)',
        borderColor: tone === 'strong' ? 'var(--glass-border-strong)' : 'var(--glass-border)',
        boxShadow:
          shadow === 'window'
            ? 'var(--shadow-window)'
            : shadow === 'popover'
              ? 'var(--shadow-popover)'
              : shadow === 'dock'
                ? 'var(--shadow-dock)'
                : undefined,
        ...style,
      }}
      {...rest}
    >
      {highlight && <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit]" style={{ background: 'var(--glass-highlight)' }} />}
      {tint && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: 'var(--glass-tint)' }} />}
      <div className="relative">{children}</div>
    </div>
  );
};
