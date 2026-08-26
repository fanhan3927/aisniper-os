/**
 * SegmentedControl — 分段选择器（自制）
 */
import React from 'react';
import { motion } from 'framer-motion';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: SegmentedOption<T>[];
  /** layoutId 命名空间（多个实例同页时需要区分） */
  id: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({ value, onChange, options, id, size = 'md' }: SegmentedControlProps<T>) {
  const idx = options.findIndex((o) => o.value === value);
  return (
    <div
      className="relative flex rounded-lg p-0.5"
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
      role="tablist"
    >
      {options.map((o, i) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={`relative rounded-md font-medium transition-colors ${
            size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3.5 py-1 text-[12px]'
          }`}
          style={{ color: o.value === value ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          {i === idx && (
            <motion.span
              layoutId={`seg-${id}`}
              className="absolute inset-0 rounded-md"
              style={{ background: 'var(--glass-bg-strong)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}
              transition={{ type: 'spring', stiffness: 480, damping: 34 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
