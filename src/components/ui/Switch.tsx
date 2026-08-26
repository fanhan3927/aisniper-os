/**
 * Switch — 玻璃开关（自制，不引入 UI 库）
 */
import React from 'react';
import { motion } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className="relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40"
    style={{ background: checked ? 'var(--accent)' : 'var(--glass-bg-strong)' }}
  >
    <motion.span
      className="absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow"
      animate={{ left: checked ? 18 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 34 }}
    />
  </button>
);
