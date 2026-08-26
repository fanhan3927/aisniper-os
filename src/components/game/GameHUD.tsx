/**
 * GameHUD — 分数/生命/连击/雷达 + 暂停菜单 + 结算 + 移动端摇杆
 */
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useThemeStore } from '../../store/themeStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { gameBridge } from './gameBridge';
import { controls } from './controls';
import { GlassPanel } from '../ui/GlassPanel';
import { Switch } from '../ui/Switch';
import { PauseIcon, PlayIcon, FullscreenIcon, ExitFullscreenIcon } from '../ui/icons';

/* ---------- 雷达（canvas，10Hz 轮询桥接数据，不触发 React 渲染） ---------- */
const Radar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const id = window.setInterval(() => {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      const size = cv.width;
      const cx = size / 2;
      const cy = size / 2;
      const r = size / 2 - 3;
      ctx.clearRect(0, 0, size, size);
      // 环
      ctx.strokeStyle = 'rgba(120,140,180,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      // 十字
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.stroke();
      // 玩家
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
      ctx.fill();
      // 目标（z: -48..2 → 半径）
      for (const p of gameBridge.radar) {
        const f = Math.max(0, Math.min(1, (p.z + 48) / 50));
        const rr = f * r * 0.92;
        const ang = Math.atan2(p.x, 1); // 左右对称映射
        const dx = cx + Math.sin(ang) * rr;
        const dy = cy + (p.x / 8) * rr * 0.6;
        ctx.fillStyle = p.kind === 'enemy' ? '#ff6b4a' : '#d9a05b';
        ctx.beginPath();
        ctx.arc(dx, dy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 opacity-80" title="雷达（模拟）">
      <canvas ref={canvasRef} width={104} height={104} className="rounded-full" style={{ background: 'rgba(10,14,24,0.55)' }} />
    </div>
  );
};

/* ---------- 移动端虚拟摇杆 + 射击键 ---------- */
const Joystick: React.FC = () => {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  const update = (e: React.PointerEvent) => {
    const el = baseRef.current;
    if (!el || !knobRef.current) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const max = rect.width / 2 - 6;
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    controls.joy.active = true;
    controls.joy.x = dx / max;
    controls.joy.y = -dy / max;
  };
  const end = () => {
    controls.joy.active = false;
    controls.joy.x = 0;
    controls.joy.y = 0;
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)';
  };

  return (
    <div
      ref={baseRef}
      className="absolute bottom-5 left-5 h-[92px] w-[92px] touch-none rounded-full"
      style={{ background: 'rgba(20,26,40,0.4)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={update}
      onPointerUp={end}
      onPointerCancel={end}
      aria-label="虚拟摇杆"
    >
      <div
        ref={knobRef}
        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'rgba(255,255,255,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
      />
    </div>
  );
};

const FireButton: React.FC = () => (
  <button
    className="absolute bottom-5 right-5 flex h-16 w-16 touch-none items-center justify-center rounded-full text-[22px] font-bold"
    style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', boxShadow: '0 4px 18px rgba(0,0,0,0.4)' }}
    onPointerDown={(e) => {
      e.stopPropagation();
      controls.fire = true;
    }}
    onPointerUp={() => (controls.fire = false)}
    onPointerCancel={() => (controls.fire = false)}
    onPointerLeave={() => (controls.fire = false)}
    aria-label="射击"
  >
    ✦
  </button>
);

/* ---------- 主 HUD ---------- */
export const GameHUD: React.FC<{ fullscreen: boolean; onToggleFullscreen: () => void }> = ({ fullscreen, onToggleFullscreen }) => {
  const phase = useGameStore((s) => s.phase);
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const combo = useGameStore((s) => s.combo);
  const wave = useGameStore((s) => s.wave);
  const muted = useGameStore((s) => s.muted);
  const setMuted = useGameStore((s) => s.setMuted);
  const reset = useGameStore((s) => s.reset);
  const setPhase = useGameStore((s) => s.setPhase);
  const highscores = useGameStore((s) => s.highscores);
  const lastResult = useGameStore((s) => s.lastResult);
  const isMobile = useIsMobile();
  const reduceMotion = usePrefersReducedMotion();
  const reduce = useThemeStore((s) => s.reduceMotion) || reduceMotion;

  const rank = lastResult ? highscores.findIndex((h) => h === lastResult) + 1 : null;
  const mult = 1 + Math.floor(combo / 5);
  const inGame = phase === 'playing' || phase === 'paused';

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      {/* 顶部状态条 */}
      {inGame && (
        <div className="absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-3">
          <div className="flex items-baseline gap-3">
            <span className="tnum text-[26px] font-bold" style={{ color: '#f5f5f7', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              {score.toLocaleString()}
            </span>
            {combo >= 5 && (
              <motion.span
                key={combo}
                initial={reduce ? { opacity: 0 } : { scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-md px-1.5 py-0.5 text-[12px] font-bold"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                ×{mult} 连击 {combo}
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md px-2 py-0.5 text-[12px]" style={{ background: 'rgba(20,26,40,0.5)', color: '#cbd5e1' }}>
              波次 {wave}
            </span>
            <button
              className="pointer-events-auto pressable flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'rgba(20,26,40,0.55)', color: '#e2e8f0' }}
              onClick={() => setPhase(phase === 'paused' ? 'playing' : 'paused')}
              aria-label={phase === 'paused' ? '继续' : '暂停'}
              title={phase === 'paused' ? '继续 (P)' : '暂停 (P)'}
            >
              {phase === 'paused' ? <PlayIcon size={15} /> : <PauseIcon size={15} />}
            </button>
            <button
              className="pointer-events-auto pressable flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'rgba(20,26,40,0.55)', color: '#e2e8f0' }}
              onClick={onToggleFullscreen}
              aria-label={fullscreen ? '退出全屏' : '全屏'}
              title={fullscreen ? '退出全屏' : '全屏'}
            >
              {fullscreen ? <ExitFullscreenIcon size={15} /> : <FullscreenIcon size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* 生命（左上角） */}
      {phase === 'playing' && (
        <div className="absolute left-4 top-12 flex gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: i < lives ? 1 : 0.22 }}>
              <path d="M12 3l2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3z" fill={i < lives ? '#38bdf8' : '#94a3b8'} />
            </svg>
          ))}
        </div>
      )}

      {/* 雷达 */}
      {phase === 'playing' && !isMobile && <Radar />}

      {/* 移动端控件 */}
      {phase === 'playing' && isMobile && (
        <>
          <Joystick />
          <FireButton />
        </>
      )}

      {/* 开始菜单 */}
      {phase === 'menu' && (
        <Overlay>
          <div className="text-center">
            <div className="mb-1 text-[30px] font-bold tracking-wide" style={{ color: '#f5f5f7' }}>
              AISniper 太空射击
            </div>
            <div className="mb-6 text-[12.5px]" style={{ color: '#94a3b8' }}>
              {isMobile ? '摇杆移动 · 射击键开火' : '鼠标 / WASD / 方向键移动 · 空格射击 · P 暂停'}
            </div>
            <button
              className="pointer-events-auto pressable rounded-full px-8 py-2.5 text-[15px] font-semibold"
              style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 6px 24px rgba(10,132,255,0.4)' }}
              onClick={reset}
            >
              开始游戏
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-[12px]" style={{ color: '#94a3b8' }}>
              <span>音效</span>
              <Switch checked={!muted} onChange={(v) => setMuted(!v)} label="游戏音效" />
            </div>
          </div>
        </Overlay>
      )}

      {/* 暂停菜单 */}
      {phase === 'paused' && (
        <Overlay>
          <GlassPanel radius="window" shadow="window" className="w-[260px] p-5">
            <div className="mb-3 text-center text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              已暂停
            </div>
            <div className="flex flex-col gap-1.5">
              <MenuButton onClick={() => setPhase('playing')}>继续</MenuButton>
              <MenuButton onClick={reset}>重新开始</MenuButton>
              <MenuButton onClick={() => setPhase('menu')}>返回主菜单</MenuButton>
            </div>
            <div className="mt-3 flex items-center justify-between px-1 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              <span>音效</span>
              <Switch checked={!muted} onChange={(v) => setMuted(!v)} label="游戏音效" />
            </div>
          </GlassPanel>
        </Overlay>
      )}

      {/* 结算 */}
      {phase === 'over' && (
        <Overlay>
          <GlassPanel radius="window" shadow="window" className="w-[320px] p-5">
            <div className="mb-1 text-center text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>
              任务结束
            </div>
            {rank !== null && rank <= 10 && (
              <div className="mb-2 text-center text-[12px]" style={{ color: 'var(--accent)' }}>
                ★ 上榜 · 第 {rank} 名
              </div>
            )}
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <Stat label="得分" value={score.toLocaleString()} />
              <Stat label="最高连击" value={String(combo)} />
              <Stat label="波次" value={String(wave)} />
            </div>
            <div className="mb-4 max-h-[140px] overflow-y-auto rounded-lg p-2" style={{ background: 'var(--glass-bg)' }}>
              <div className="mb-1 text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                Top 10
              </div>
              {highscores.slice(0, 10).map((h, i) => (
                <div key={i} className="flex justify-between py-0.5 text-[12px]" style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  <span>
                    {i + 1}. {h.score.toLocaleString()}
                  </span>
                  <span className="tnum">波 {h.waves}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <MenuButton onClick={reset}>再玩一次</MenuButton>
              <MenuButton onClick={() => setPhase('menu')}>主菜单</MenuButton>
            </div>
          </GlassPanel>
        </Overlay>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg py-2" style={{ background: 'var(--glass-bg)' }}>
    <div className="tnum text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>
      {value}
    </div>
    <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
      {label}
    </div>
  </div>
);

const MenuButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    className="pointer-events-auto pressable rounded-xl px-4 py-2 text-[13px] font-medium"
    style={{ background: 'var(--glass-bg-strong)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
    onClick={onClick}
  >
    {children}
  </button>
);

const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="pointer-events-auto absolute inset-0 flex items-center justify-center"
    style={{ background: 'rgba(3,5,10,0.62)', backdropFilter: 'blur(10px)' }}
  >
    {children}
  </div>
);
