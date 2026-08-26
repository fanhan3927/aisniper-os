/**
 * gameStore — 3D 太空射击的 OS 级状态（分数 / 生命 / 暂停 / 排行榜）
 * 供游戏组件与健康模拟（useSimulatedHealth）共享。
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GamePhase, GameStats, Quality, ScoreEntry } from '../types/game';

const HIGHSCORE_KEY = 'aisniper-game-highscores';

interface GameState extends GameStats {
  phase: GamePhase;
  muted: boolean;
  quality: Quality;
  highscores: ScoreEntry[];
  lastResult: ScoreEntry | null;

  setPhase: (p: GamePhase) => void;
  reset: () => void;
  addScore: (n: number) => void;
  hit: () => void;
  loseLife: () => void;
  setWave: (n: number) => void;
  setKills: (n: number) => void;
  setMuted: (b: boolean) => void;
  setQuality: (q: Quality) => void;
  /** 结算：写入排行榜并返回名次（1-based），未进榜返回 null */
  recordScore: () => number | null;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'menu',
      score: 0,
      lives: 3,
      combo: 0,
      kills: 0,
      wave: 0,
      muted: false,
      quality: 'high',
      highscores: [],
      lastResult: null,

      setPhase: (phase) => set({ phase }),
      reset: () => set({ phase: 'playing', score: 0, lives: 3, combo: 0, kills: 0, wave: 0, lastResult: null }),
      addScore: (n) => set((s) => ({ score: s.score + n })),
      hit: () => set((s) => ({ combo: s.combo + 1, kills: s.kills + 1 })),
      loseLife: () => set((s) => ({ lives: Math.max(0, s.lives - 1), combo: 0 })),
      setWave: (n) => set({ wave: n }),
      setKills: (n) => set({ kills: n }),
      setMuted: (muted) => set({ muted }),
      setQuality: (quality) => set({ quality }),

      recordScore: () => {
        const s = get();
        const entry: ScoreEntry = {
          score: s.score,
          combo: s.combo,
          date: new Date().toISOString(),
          waves: s.wave,
        };
        const list = [...s.highscores, entry].sort((a, b) => b.score - a.score).slice(0, 10);
        set({ highscores: list, lastResult: entry });
        return list.findIndex((e) => e === entry) + 1 || null;
      },
    }),
    {
      name: 'aisniper-game',
      partialize: (s) => ({ muted: s.muted, quality: s.quality, highscores: s.highscores }),
    },
  ),
);
