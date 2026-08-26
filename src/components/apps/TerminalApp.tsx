/**
 * TerminalApp — 可交互伪 shell（白名单命令，禁止 eval）
 * 提示符 sniper@aisniper ~ %，方向键历史，输出区可滚动，焦点自动落在输入。
 */
import React, { useEffect, useRef, useState } from 'react';
import { useOsStore } from '../../store/osStore';
import { run } from '../../data/terminalCommands';

interface Line {
  id: number;
  text: string;
  kind: 'input' | 'output' | 'error';
}

const PROMPT = 'sniper@aisniper ~ %';
const HISTORY_MAX = 50;

const WELCOME = [
  'Welcome to AISniper OS — targeting the next desktop.',
  '输入 help 查看可用命令。',
].join('\n');

let lineSeq = 0;

export const TerminalApp: React.FC = () => {
  const openApp = useOsStore((s) => s.openApp);
  const [lines, setLines] = useState<Line[]>(() => [
    { id: ++lineSeq, text: WELCOME, kind: 'output' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  // 点击终端任意处聚焦输入
  const focusInput = () => inputRef.current?.focus();

  const execute = (raw: string) => {
    const text = raw.trim();
    if (!text) {
      setLines((l) => [...l, { id: ++lineSeq, text: '', kind: 'input' }]);
      return;
    }
    if (text !== 'clear') {
      setLines((l) => [...l, { id: ++lineSeq, text: `${PROMPT} ${text}`, kind: 'input' }]);
    }
    const outputs = run(text, { openApp });
    if (outputs.length === 1 && outputs[0] === '__CLEAR__') {
      setLines([]);
    } else {
      setLines((l) => [
        ...l,
        ...outputs.map((o) => ({ id: ++lineSeq, text: o, kind: (o.startsWith('zsh:') ? 'error' : 'output') as Line['kind'] })),
      ]);
    }
    setHistory((h) => [...h.slice(-HISTORY_MAX + 1), text]);
    setHistIdx(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execute(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      if (history[idx] !== undefined) {
        setHistIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < 0) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(-1);
        setInput('');
      } else {
        setHistIdx(idx);
        setInput(history[idx]);
      }
    }
  };

  return (
    <div
      className="flex h-full w-full flex-col"
      style={{ background: 'rgba(8,10,14,0.88)', cursor: 'text' }}
      onPointerDown={focusInput}
    >
      {/* 输出区 */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3 font-mono text-[12.5px] leading-relaxed">
        {lines.map((l) => (
          <div
            key={l.id}
            className="whitespace-pre-wrap break-all"
            style={{ color: l.kind === 'input' ? '#e8e8ee' : l.kind === 'error' ? '#ff6b6b' : '#b9bcc4' }}
          >
            {l.text || '\u00A0'}
          </div>
        ))}
        {/* 当前输入行 */}
        <div className="flex items-center gap-2">
          <span className="shrink-0" style={{ color: '#6ee7a8' }}>
            {PROMPT}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] outline-none"
            style={{ color: '#f2f3f7', caretColor: '#6ee7a8' }}
            aria-label="终端输入"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      {/* 状态条 */}
      <div
        className="flex shrink-0 items-center justify-between px-3.5 py-1 text-[10.5px]"
        style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#7d818c' }}
      >
        <span>sniper-shell · 白名单命令</span>
        <span>{lines.length} 行</span>
      </div>
    </div>
  );
};
