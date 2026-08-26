/**
 * sfx — Web Audio 简易合成音效（无外部音频文件）
 */
import { useThemeStore } from '../store/themeStore';

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function enabled(): boolean {
  return useThemeStore.getState().soundEnabled && !useThemeStore.getState().reduceMotion;
}

export const sfx = {
  /** 解除移动端自动播放限制（首次用户交互时调用） */
  unlock() {
    ac();
  },
  shoot() {
    if (!enabled()) return;
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(880, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.09);
    g.gain.setValueAtTime(0.06, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.11);
  },
  hit() {
    if (!enabled()) return;
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(520, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(180, c.currentTime + 0.12);
    g.gain.setValueAtTime(0.1, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.14);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.15);
  },
  explosion() {
    if (!enabled()) return;
    const c = ac();
    if (!c) return;
    const len = Math.floor(c.sampleRate * 0.35);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.setValueAtTime(0.16, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(900, c.currentTime);
    f.frequency.exponentialRampToValueAtTime(120, c.currentTime + 0.35);
    src.connect(f).connect(g).connect(c.destination);
    src.start();
  },
  hurt() {
    if (!enabled()) return;
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(160, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(50, c.currentTime + 0.3);
    g.gain.setValueAtTime(0.14, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.32);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.33);
  },
};
