/** Dock App 注册数据（固定 5 个入口，不可删除） */
import type { AppId } from '../types/os';

export interface DockApp {
  appId: AppId;
  name: string;
  /** 显示顺序 */
  order: number;
}

export const DOCK_APPS: DockApp[] = [
  { appId: 'finder', name: 'Finder', order: 0 },
  { appId: 'calculator', name: '计算器', order: 1 },
  { appId: 'settings', name: '设置', order: 2 },
  { appId: 'terminal', name: '终端', order: 3 },
  { appId: 'game', name: '太空射击', order: 4 },
];
