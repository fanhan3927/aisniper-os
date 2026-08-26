/** OS 层类型：窗口、App 注册表、弹窗、Toast */

export type AppId = 'finder' | 'calculator' | 'settings' | 'terminal' | 'game';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowInstance {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
  maximized: boolean;
  z: number;
  /** 最大化前保存的原始矩形 */
  prevRect: Rect | null;
  /** App 窗口运行时额外状态（如计算器是否科学模式），不参与持久化 */
  meta?: Record<string, unknown>;
}

export interface AppMeta {
  id: AppId;
  name: string;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  /** 单例 App：再点 Dock 只聚焦不新开 */
  singleton: boolean;
  /** 支持全屏（游戏） */
  fullscreenable?: boolean;
}

export type PopoverKind = 'wifi' | 'health' | 'clock' | null;

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  kind: 'info' | 'warn' | 'success';
}

/** App 注册表：所有窗口的默认尺寸与最小尺寸集中在这里 */
export const APP_META: Record<AppId, AppMeta> = {
  finder: {
    id: 'finder',
    name: 'Finder',
    defaultSize: { w: 760, h: 480 },
    minSize: { w: 420, h: 300 },
    singleton: true,
  },
  calculator: {
    id: 'calculator',
    name: '计算器',
    defaultSize: { w: 280, h: 420 },
    minSize: { w: 240, h: 360 },
    singleton: true,
  },
  settings: {
    id: 'settings',
    name: '设置',
    defaultSize: { w: 760, h: 520 },
    minSize: { w: 560, h: 420 },
    singleton: true,
  },
  terminal: {
    id: 'terminal',
    name: '终端',
    defaultSize: { w: 640, h: 400 },
    minSize: { w: 420, h: 260 },
    singleton: true,
  },
  game: {
    id: 'game',
    name: 'AISniper 太空射击',
    defaultSize: { w: 900, h: 560 },
    minSize: { w: 480, h: 320 },
    singleton: true,
    fullscreenable: true,
  },
};
