/**
 * osStore — OS 级状态：窗口列表、焦点、弹窗互斥、Toast
 * 窗口状态是唯一数据源，组件只消费不私有持有。
 */
import { create } from 'zustand';
import type { AppId, PopoverKind, Rect, ToastItem, WindowInstance } from '../types/os';
import { APP_META } from '../types/os';
import { MENU_BAR_H, DOCK_H, DOCK_BOTTOM_GAP, DOCK_SAFE_GAP } from '../lib/layout';

export interface OsState {
  windows: WindowInstance[];
  focusedId: string | null;
  nextZ: number;
  openPopover: PopoverKind;
  toasts: ToastItem[];
  /** 游戏全屏（隐藏菜单栏内容、Dock 自动隐藏） */
  gameFullscreen: boolean;

  openApp: (appId: AppId) => void;
  closeApp: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  restoreWindow: (id: string) => void;
  setGameFullscreen: (b: boolean) => void;
  /** 游戏全屏切换（绿键 / HUD 按钮） */
  toggleGameFullscreen: () => void;
  /** 更新窗口标题（Finder 随目录变化） */
  setWindowTitle: (id: string, title: string) => void;

  setPopover: (kind: Exclude<PopoverKind, null>) => void;
  closePopover: () => void;
  pushToast: (t: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

let toastSeq = 0;

export const useOsStore = create<OsState>()((set, get) => ({
  windows: [],
  focusedId: null,
  nextZ: 10,
  openPopover: null,
  toasts: [],
  gameFullscreen: false,

  openApp: (appId) => {
    const meta = APP_META[appId];
    const existing = get().windows.find((w) => w.appId === appId);
    if (existing) {
      // 单例：还原 + 聚焦
      set((s) => ({
        windows: s.windows.map((w) => (w.id === existing.id ? { ...w, minimized: false } : w)),
      }));
      get().focusWindow(existing.id);
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(meta.defaultSize.w, Math.max(meta.minSize.w, vw - 48));
    const h = Math.min(meta.defaultSize.h, Math.max(meta.minSize.h, vh - MENU_BAR_H - DOCK_H - DOCK_BOTTOM_GAP - 40));

    const count = get().windows.length;
    const offset = 20 + (count % 5) * 30;
    const x = Math.max(16, Math.round((vw - w) / 2 - 40 + offset));
    const y = Math.max(MENU_BAR_H + 8, Math.round((vh - h) / 2 - 20 + offset));

    const win: WindowInstance = {
      id: appId, // 单例 id 即 appId
      appId,
      title: meta.name,
      x,
      y,
      w,
      h,
      minimized: false,
      maximized: false,
      z: get().nextZ + 1,
      prevRect: null,
    };
    set((s) => ({
      windows: [...s.windows, win],
      nextZ: win.z,
      focusedId: win.id,
    }));
  },

  closeApp: (id) =>
    set((s) => {
      const windows = s.windows.filter((w) => w.id !== id);
      const focusedId = s.focusedId === id ? (windows.length ? windows[windows.length - 1].id : null) : s.focusedId;
      // 关闭游戏窗口时退出全屏
      const gameFullscreen = s.gameFullscreen && windows.some((w) => w.appId === 'game') ? s.gameFullscreen : false;
      return { windows, focusedId, gameFullscreen };
    }),

  focusWindow: (id) =>
    set((s) => {
      const win = s.windows.find((w) => w.id === id);
      if (!win || s.focusedId === id) return s;
      const z = s.nextZ + 1;
      return {
        windows: s.windows.map((w) => (w.id === id ? { ...w, z } : w)),
        focusedId: id,
        nextZ: z,
      };
    }),

  moveWindow: (id, x, y) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)) })),

  resizeWindow: (id, w, h) =>
    set((s) => ({ windows: s.windows.map((win) => (win.id === id ? { ...win, w, h } : win)) })),

  minimizeWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
      focusedId: s.focusedId === id ? null : s.focusedId,
    })),

  toggleMaximize: (id) =>
    set((s) => {
      const win = s.windows.find((w) => w.id === id);
      if (!win) return s;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (!win.maximized) {
        const prevRect: Rect = { x: win.x, y: win.y, w: win.w, h: win.h };
        const isMobile = vw < 768;
        const rect = isMobile
          ? { x: 0, y: MENU_BAR_H, w: vw, h: vh - MENU_BAR_H }
          : { x: 0, y: MENU_BAR_H, w: vw, h: vh - MENU_BAR_H - DOCK_H - DOCK_BOTTOM_GAP - DOCK_SAFE_GAP };
        return {
          windows: s.windows.map((w) => (w.id === id ? { ...w, ...rect, maximized: true, prevRect } : w)),
          focusedId: id,
        };
      }
      const pr = win.prevRect ?? { x: 60, y: 60, w: win.w, h: win.h };
      return {
        windows: s.windows.map((w) => (w.id === id ? { ...w, ...pr, maximized: false, prevRect: null } : w)),
      };
    }),

  restoreWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: false } : w)),
    })),

  setGameFullscreen: (b) => set({ gameFullscreen: b }),
  /** 游戏全屏切换：隐藏菜单栏/Dock + 窗口最大化（或还原） */
  toggleGameFullscreen: () =>
    set((s) => {
      const win = s.windows.find((w) => w.appId === 'game');
      if (!win) return s;
      const toFull = !s.gameFullscreen;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let next = { gameFullscreen: toFull, windows: s.windows } as const;
      if (toFull) {
        const prevRect: Rect = { x: win.x, y: win.y, w: win.w, h: win.h };
        const rect: Rect = { x: 0, y: 0, w: vw, h: vh };
        next = {
          gameFullscreen: true,
          windows: s.windows.map((w) => (w.id === win.id ? { ...w, ...rect, maximized: true, prevRect: win.prevRect ?? prevRect } : w)),
        };
      } else {
        const pr = win.prevRect ?? { x: 60, y: 60, w: win.w, h: win.h };
        next = {
          gameFullscreen: false,
          windows: s.windows.map((w) => (w.id === win.id ? { ...w, ...pr, maximized: false, prevRect: null } : w)),
        };
      }
      return next;
    }),

  setWindowTitle: (id, title) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, title } : w)) })),

  // 弹窗互斥：再点同一个关闭，点另一个切换
  setPopover: (kind) => set((s) => ({ openPopover: s.openPopover === kind ? null : kind })),
  closePopover: () => set({ openPopover: null }),

  pushToast: (t) => {
    const id = `toast-${Date.now()}-${++toastSeq}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    // 自动消失
    window.setTimeout(() => {
      get().dismissToast(id);
    }, 3200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
