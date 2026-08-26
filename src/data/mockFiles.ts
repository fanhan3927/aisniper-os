/** 虚拟文件系统 mock 数据（内存态，刷新重置） */
import type { FsNode } from '../types/fs';

const now = Date.now();
const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export function buildMockTree(): { nodes: Record<string, FsNode>; rootId: string; trashId: string } {
  const nodes: Record<string, FsNode> = {};

  const add = (n: FsNode) => {
    nodes[n.id] = n;
  };

  const folder = (id: string, name: string, parentId: string | null, children: string[] = [], system = false, modified = now - HOUR): FsNode => {
    const n: FsNode = { id, name, type: 'folder', parentId, children, modified, system };
    add(n);
    return n;
  };

  const file = (
    id: string,
    name: string,
    parentId: string,
    kind: FsNode['kind'],
    size: number,
    content = '',
    modified = now - HOUR,
  ): FsNode => {
    const n: FsNode = { id, name, type: 'file', parentId, kind, size, content, modified };
    add(n);
    return n;
  };

  const app = (id: string, name: string, parentId: string): FsNode => {
    const n: FsNode = { id, name, type: 'app', parentId, kind: 'app', size: 12_400_000, modified: now - DAY };
    add(n);
    return n;
  };

  // 根
  const rootId = 'root';
  folder(rootId, 'AISniper', null, ['personal', 'desktop', 'documents', 'downloads', 'applications', 'trash'], true, now - 30 * DAY);

  // 个人
  const personalId = 'personal';
  folder(personalId, '个人', rootId, ['readme', 'notes', 'todo']);
  file('readme', 'README.md', personalId, 'text', 2048, [
    '# AISniper OS',
    '',
    '一套在浏览器里运行的「下一代桌面操作系统」体验。',
    '',
    '- Liquid Glass 玻璃材质',
    '- 窗口管理器 / Dock / 菜单栏',
    '- 内置 3D 太空射击游戏',
    '',
    '纯前端模拟，无真实系统权限。',
  ].join('\n'), now - 5 * DAY);
  file('notes', '项目笔记.txt', personalId, 'text', 1320, [
    '设计语言对标 macOS Tahoe 26 的 Liquid Glass。',
    '',
    '- 玻璃：backdrop-blur + 半透明 + 顶部镜面高光',
    '- 动效：Framer Motion spring（stiffness 380–500）',
    '- 层次：壁纸 < 窗口 < 弹窗 < Dock < 菜单栏',
  ].join('\n'), now - 2 * DAY);
  file('todo', '待办.md', personalId, 'text', 640, '- [x] 初始化项目\n- [x] 主题系统与 GlassPanel\n- [ ] 3D 太空射击\n- [ ] 部署', now - DAY);

  // 桌面
  const desktopId = 'desktop';
  folder(desktopId, '桌面', rootId, ['wallpaper', 'starmap', 'notes2']);
  file('wallpaper', '深空壁纸.png', desktopId, 'image', 4_800_000, undefined, now - 8 * DAY);
  file('starmap', '星图.svg', desktopId, 'image', 12_800, undefined, now - 6 * DAY);
  file('notes2', '灵感碎片.txt', desktopId, 'text', 420, '凌晨三点写下的想法：让菜单栏时钟只显示分钟，秒针跳动会打扰人。', now - 3 * HOUR);

  // 文稿
  const documentsId = 'documents';
  folder(documentsId, '文稿', rootId, ['space-archive', 'syslog']);
  folder('space-archive', '太空档案', documentsId, ['highscore', 'replay']);
  file('highscore', '最高分记录.txt', 'space-archive', 'text', 800, [
    'AISniper 太空射击 · Top 10',
    '==========================',
    '1.  (游戏结算后自动写入)',
    '2.  (等待你的名字)',
  ].join('\n'), now - DAY);
  file('replay', '回放_第12波.bin', 'space-archive', 'other', 64_000, undefined, now - 12 * HOUR);
  file('syslog', '系统日志.log', documentsId, 'log', 22_400, [
    '[boot] AISniper OS 0.1.0 (Sniper Neural GPU)',
    '[wifi] connected to AISniper-Net @ 866 Mbps',
    '[health] cpu 24% · gpu 18% · temp 42°C',
    '[game] highscore saved: 12840 (wave 12)',
  ].join('\n'), now - 40 * MIN);

  // 下载
  const downloadsId = 'downloads';
  folder(downloadsId, '下载', rootId, ['dmg']);
  file('dmg', 'AISniper-OS-0.1.dmg', downloadsId, 'other', 128_000_000, undefined, now - 5 * HOUR);

  // 应用
  const applicationsId = 'applications';
  folder(applicationsId, '应用', rootId, ['game-app', 'calc-app']);
  app('game-app', '太空射击.app', applicationsId);
  app('calc-app', '计算器.app', applicationsId);

  // 废纸篓（系统节点，初始为空）
  const trashId = 'trash';
  folder(trashId, '废纸篓', rootId, [], true, now);

  return { nodes, rootId, trashId };
}
