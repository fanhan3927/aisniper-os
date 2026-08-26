/**
 * useSimulatedHealth — 平滑随机游走的系统健康模拟
 * 游戏 playing 时把 CPU / GPU / 温度目标抬高。
 * 30 点迷你趋势折线。
 */
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export interface HealthMetrics {
  cpu: number;
  mem: number;
  gpu: number;
  temp: number;
  fan: number;
  /** 0-100 健康总分（越高越健康） */
  score: number;
  /** 最近 30 秒趋势（折线图数据点，0-100） */
  history: number[];
}

interface MetricState {
  current: number;
  target: number;
  history: number[];
}

const TICK_MS = 1000;
const HISTORY_LEN = 30;

function makeMetric(init: number): MetricState {
  return { current: init, target: init, history: Array(HISTORY_LEN).fill(init) };
}

/** 目标值范围 [lo, hi]，随机游走目标 */
function wanderTarget(base: [number, number], boost: number): number {
  const [lo, hi] = base;
  const b = Math.random() * 0.5 + 0.25;
  return Math.round(lo + (hi - lo) * b + boost * b * 0.5);
}

export function useSimulatedHealth(): HealthMetrics {
  const playing = useGameStore((s) => s.phase === 'playing');
  const [state, setState] = useState(() => ({
    cpu: makeMetric(24),
    mem: makeMetric(42),
    gpu: makeMetric(18),
    temp: makeMetric(42),
  }));

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((prev) => {
        const boost = playing ? 1 : 0;
        const cpuBoost = playing ? 42 : 0;
        const gpuBoost = playing ? 48 : 0;

        const tick = (m: MetricState, base: [number, number], boostAmt: number): MetricState => {
          // 目标偶尔重选
          if (Math.random() < 0.3) m.target = wanderTarget(base, boostAmt);
          const pull = (m.target - m.current) * 0.35;
          const noise = (Math.random() - 0.5) * 6;
          const next = Math.min(99, Math.max(2, m.current + pull + noise));
          const history = [...m.history.slice(1), next];
          return { current: next, target: m.target, history };
        };

        const cpu = tick(prev.cpu, [14, 42], cpuBoost);
        const gpu = tick(prev.gpu, [10, 26], gpuBoost);
        const mem = tick(prev.mem, [34, 58], boost * 10);
        // 温度跟随 cpu/gpu
        const tempTarget = 36 + cpu.current * 0.5 + gpu.current * 0.25 + boost * 6;
        const tempNext = Math.min(96, Math.max(30, prev.temp.current + (tempTarget - prev.temp.current) * 0.3 + (Math.random() - 0.5) * 1.6));
        const temp = { current: tempNext, target: tempTarget, history: [...prev.temp.history.slice(1), tempNext] };

        return { cpu, gpu, mem, temp };
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  // 汇总与健康分
  const cpu = Math.round(state.cpu.current);
  const mem = Math.round(state.mem.current);
  const gpu = Math.round(state.gpu.current);
  const temp = Math.round(state.temp.current);
  const fan = Math.round(900 + cpu * 28 + temp * 12);

  // 负载越高健康分越低：绿色 ≥80 / 黄 50-79 / 红 <50
  const load = cpu * 0.38 + mem * 0.16 + gpu * 0.3 + temp * 0.16;
  const score = Math.max(5, Math.min(99, Math.round(100 - load * 0.9)));

  // 历史折线（最近一分钟的平均值近似）
  const history = state.cpu.history.map((c, i) =>
    Math.max(2, Math.min(99, Math.round(c * 0.45 + state.mem.history[i] * 0.2 + state.gpu.history[i] * 0.35))),
  );

  return { cpu, mem, gpu, temp, fan, score, history };
}

export function healthColor(score: number): string {
  if (score >= 80) return '#30d158';
  if (score >= 50) return '#ffd60a';
  return '#ff453a';
}
