/**
 * CalculatorApp — 玻璃计算器
 * 精确字符串状态机 + 科学模式展开；键盘可用。
 * 展示值经 12 位舍入，规避 0.1+0.2 类浮点误差。
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOsStore } from '../../store/osStore';
import { useThemeStore } from '../../store/themeStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { motion } from 'framer-motion';

type Op = '+' | '-' | '×' | '÷';

/** 展示数字：修浮点误差 + 限制位数 */
function fmt(n: number): string {
  if (!Number.isFinite(n)) return '错误';
  const r = Math.round(n * 1e12) / 1e12;
  if (Math.abs(r) >= 1e12) return r.toExponential(8).replace('e+', 'e');
  const s = String(r);
  return s.length > 14 ? r.toPrecision(12).replace(/\.?0+$/, '') : s;
}

const SCI_FNS = [
  { label: 'sin', fn: (x: number) => Math.sin((x * Math.PI) / 180) },
  { label: 'cos', fn: (x: number) => Math.cos((x * Math.PI) / 180) },
  { label: 'tan', fn: (x: number) => Math.tan((x * Math.PI) / 180) },
  { label: 'log', fn: (x: number) => Math.log10(x) },
  { label: 'ln', fn: (x: number) => Math.log(x) },
  { label: '√', fn: (x: number) => Math.sqrt(x) },
  { label: 'x²', fn: (x: number) => x * x },
  { label: '1/x', fn: (x: number) => 1 / x },
];

export const CalculatorApp: React.FC = () => {
  const windows = useOsStore((s) => s.windows);
  const resizeWindow = useOsStore((s) => s.resizeWindow);
  const reduceMotion = usePrefersReducedMotion();
  const reduce = useThemeStore((s) => s.reduceMotion) || reduceMotion;

  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [overwrite, setOverwrite] = useState(true);
  const [science, setScience] = useState(false);
  const winRef = useRef<HTMLDivElement>(null);

  const calcWin = windows.find((w) => w.appId === 'calculator');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // 科学模式切换 → 窗口加宽（移动端不改变尺寸）
  const toggleScience = useCallback(() => {
    setScience((s) => {
      const next = !s;
      if (calcWin && !isMobile) {
        resizeWindow(calcWin.id, next ? 372 : 280, next ? 500 : 430);
      }
      return next;
    });
  }, [calcWin, isMobile, resizeWindow]);

  const currentValue = useMemo(() => parseFloat(display) || 0, [display]);

  const inputDigit = useCallback(
    (d: string) => {
      setDisplay((cur) => {
        if (overwrite) {
          setOverwrite(false);
          return d === '.' ? '0.' : d;
        }
        if (d === '.') return cur.includes('.') ? cur : cur + '.';
        if (cur === '0') return d;
        if (cur.replace(/[-.]/g, '').length >= 14) return cur;
        return cur + d;
      });
    },
    [overwrite],
  );

  const compute = (a: number, o: Op, b: number): number => {
    switch (o) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? NaN : a / b;
    }
  };

  const applyOp = useCallback(
    (nextOp: Op) => {
      setDisplay((cur) => {
        const v = parseFloat(cur) || 0;
        if (acc === null || op === null) {
          setAcc(v);
        } else {
          const r = compute(acc, op, v);
          setAcc(Number.isFinite(r) ? r : null);
          return fmt(r);
        }
        setOp(nextOp);
        setOverwrite(true);
        return cur;
      });
      setOp(nextOp);
      setOverwrite(true);
    },
    [acc, op],
  );

  const equals = useCallback(() => {
    if (op === null || acc === null) return;
    const r = compute(acc, op, currentValue);
    setDisplay(fmt(r));
    setAcc(null);
    setOp(null);
    setOverwrite(true);
  }, [acc, op, currentValue]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setOverwrite(true);
  }, []);

  const backspace = useCallback(() => {
    setDisplay((cur) => {
      if (overwrite) return cur;
      const next = cur.length <= 1 || (cur.length === 2 && cur.startsWith('-')) ? '0' : cur.slice(0, -1);
      setOverwrite(next === '0');
      return next;
    });
  }, [overwrite]);

  const negate = useCallback(() => {
    setDisplay((cur) => (cur.startsWith('-') ? cur.slice(1) : cur === '0' ? cur : '-' + cur));
  }, []);

  const percent = useCallback(() => {
    setDisplay(fmt(currentValue / 100));
    setOverwrite(true);
  }, [currentValue]);

  const sciFn = useCallback(
    (fn: (x: number) => number) => {
      const r = fn(currentValue);
      setDisplay(fmt(r));
      setAcc(null);
      setOp(null);
      setOverwrite(true);
    },
    [currentValue],
  );

  const pi = useCallback(() => {
    setDisplay(fmt(Math.PI));
    setAcc(null);
    setOp(null);
    setOverwrite(true);
  }, []);

  // 键盘输入
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) {
        inputDigit(k);
      } else if (k === '.') {
        inputDigit('.');
      } else if (k === '+') applyOp('+');
      else if (k === '-') applyOp('-');
      else if (k === '*') applyOp('×');
      else if (k === '/') {
        e.preventDefault();
        applyOp('÷');
      } else if (k === 'Enter' || k === '=') {
        e.preventDefault();
        equals();
      } else if (k === 'Escape' || k === 'c' || k === 'C') {
        clearAll();
      } else if (k === 'Backspace') {
        backspace();
      } else if (k === '%') {
        percent();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputDigit, applyOp, equals, clearAll, backspace, percent]);

  const isError = display === '错误';

  return (
    <div
      ref={winRef}
      className="flex h-full w-full flex-col px-3 pb-3"
      style={{ background: 'var(--window-content-bg)' }}
    >
      {/* 显示区 */}
      <div className="flex min-h-0 flex-1 flex-col items-end justify-end gap-1 px-2 pb-2 pt-4">
        {acc !== null && op !== null && (
          <div className="tnum text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            {fmt(acc)} {op}
          </div>
        )}
        <div
          className="tnum w-full truncate text-right text-[44px] font-light leading-tight"
          style={{ color: isError ? 'var(--traffic-red)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
        >
          {display}
        </div>
      </div>

      {/* 科学模式行 */}
      <motion.div
        className="overflow-hidden"
        initial={false}
        animate={{ height: science ? 'auto' : 0, opacity: science ? 1 : 0 }}
        transition={reduce ? { duration: 0.1 } : { type: 'spring', stiffness: 380, damping: 34 }}
      >
        {science && (
          <div className="mb-2 grid grid-cols-8 gap-1.5">
            {SCI_FNS.map((s) => (
              <CalcButton key={s.label} label={s.label} className="col-span-1 text-[12px]" onClick={() => sciFn(s.fn)} />
            ))}
            <CalcButton label="π" className="col-span-1 text-[12px]" onClick={pi} />
            <CalcButton label="e" className="col-span-1 text-[12px]" onClick={() => sciFn((x) => Math.exp(x))} />
          </div>
        )}
      </motion.div>

      {/* 按键区 */}
      <div className="grid shrink-0 grid-cols-4 gap-1.5">
        <CalcButton label="AC" kind="fn" onClick={clearAll} />
        <CalcButton label="±" kind="fn" onClick={negate} />
        <CalcButton label="%" kind="fn" onClick={percent} />
        <CalcButton label="÷" kind="op" active={op === '÷'} onClick={() => applyOp('÷')} />

        <CalcButton label="7" onClick={() => inputDigit('7')} />
        <CalcButton label="8" onClick={() => inputDigit('8')} />
        <CalcButton label="9" onClick={() => inputDigit('9')} />
        <CalcButton label="×" kind="op" active={op === '×'} onClick={() => applyOp('×')} />

        <CalcButton label="4" onClick={() => inputDigit('4')} />
        <CalcButton label="5" onClick={() => inputDigit('5')} />
        <CalcButton label="6" onClick={() => inputDigit('6')} />
        <CalcButton label="-" kind="op" active={op === '-'} onClick={() => applyOp('-')} />

        <CalcButton label="1" onClick={() => inputDigit('1')} />
        <CalcButton label="2" onClick={() => inputDigit('2')} />
        <CalcButton label="3" onClick={() => inputDigit('3')} />
        <CalcButton label="+" kind="op" active={op === '+'} onClick={() => applyOp('+')} />

        <CalcButton label="科学" kind="fn" className="text-[10.5px]" onClick={toggleScience} />
        <CalcButton label="0" onClick={() => inputDigit('0')} />
        <CalcButton label="." onClick={() => inputDigit('.')} />
        <CalcButton label="=" kind="eq" onClick={equals} />
      </div>
    </div>
  );
};

const CalcButton: React.FC<{
  label: string;
  kind?: 'num' | 'op' | 'fn' | 'eq';
  active?: boolean;
  className?: string;
  onClick: () => void;
}> = ({ label, kind = 'num', active, className = '', onClick }) => {
  let bg = 'var(--glass-bg)';
  let color = 'var(--text-primary)';
  if (kind === 'op') {
    bg = active ? 'var(--accent)' : 'var(--glass-bg-strong)';
    color = active ? 'var(--accent-contrast)' : 'var(--accent)';
  } else if (kind === 'fn') {
    bg = 'var(--glass-bg)';
    color = 'var(--text-primary)';
  } else if (kind === 'eq') {
    bg = 'var(--accent)';
    color = 'var(--accent-contrast)';
  }
  return (
    <button
      className={`pressable flex aspect-[1.25] items-center justify-center rounded-xl text-[17px] font-medium transition-colors ${className}`}
      style={{
        background: bg,
        color,
        border: '1px solid var(--glass-border)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
        fontFamily: 'var(--font-ui)',
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
