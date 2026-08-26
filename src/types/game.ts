/** 游戏状态类型 */

export type GamePhase = 'menu' | 'playing' | 'paused' | 'over';

export interface ScoreEntry {
  score: number;
  combo: number;
  date: string; // ISO
  waves: number;
}

export interface GameStats {
  score: number;
  lives: number;
  combo: number;
  kills: number;
  wave: number;
}

/** 低性能模式（自动检测） */
export type Quality = 'high' | 'low';
