/**
 * terminalCommands — 终端白名单命令（禁止 eval，禁止任意 JS 执行）
 * run() 返回输出行数组；'__CLEAR__' 表示清屏。
 */
import type { AppId } from '../types/os';
import { useThemeStore } from '../store/themeStore';
import { useWifiStore } from '../store/wifiStore';
import { useGameStore } from '../store/gameStore';
import { useFsStore } from '../store/fsStore';

export interface CmdContext {
  openApp: (appId: AppId) => void;
}

const APP_ALIASES: Record<string, AppId> = {
  finder: 'finder',
  calc: 'calculator',
  calculator: 'calculator',
  settings: 'settings',
  terminal: 'terminal',
  game: 'game',
};

const HELP = [
  '可用命令：',
  '  help            显示帮助',
  '  clear           清空屏幕',
  '  date            当前日期时间',
  '  whoami          当前用户',
  '  neofetch        系统信息',
  '  ls [路径]       列出虚拟文件',
  '  cat <文件名>     查看文本内容',
  '  open <app>      打开应用（finder/calc/settings/terminal/game）',
  '  theme <mode>    切换主题（dark/light/auto）',
  '  health          查看模拟系统健康度',
  '  wifi [on|off]   Wi-Fi 开关与状态',
  '  play            开始太空射击',
  '  echo <文本>      回显',
  '  uname           系统内核信息',
].join('\n');

const NEOFETCH = [
  '       sniper@aisniper',
  '      ───────────────',
  '  OS: AISniper OS 0.1.0',
  '  Host: Liquid Glass Desktop',
  '  Kernel: browser-6.4 (simulated)',
  '  Shell: sniper-shell 1.0',
  '  GPU: Sniper Neural GPU (simulated)',
  '  Theme: ' + useThemeStore.getState().appearance + ' / glass ' + useThemeStore.getState().glassLevel,
  '  Uptime: 太久没重启了（模拟）',
].join('\n');

function healthSnapshot(): string {
  const playing = useGameStore.getState().phase === 'playing';
  const boost = playing ? 1 : 0;
  const rand = (lo: number, hi: number) => Math.round(lo + Math.random() * (hi - lo));
  const cpu = playing ? rand(72, 92) : rand(16, 40);
  const gpu = playing ? rand(80, 95) : rand(10, 24);
  const mem = rand(36, 58);
  const temp = Math.round(38 + cpu * 0.5 + gpu * 0.25 + boost * 6);
  return [
    `CPU    ${cpu}%`,
    `内存   ${mem}%`,
    `GPU    ${gpu}%`,
    `温度   ${temp}°C`,
    playing ? '（游戏运行中，负载已抬高）' : '（空闲）',
  ].join('\n');
}

function lsVirtual(): string {
  const fs = useFsStore.getState();
  const items = fs.children(fs.rootId);
  return items.map((n) => (n.type === 'folder' ? `${n.name}/` : n.name)).join('   ') || '（空）';
}

function catFile(name: string): string {
  const fs = useFsStore.getState();
  const q = name.toLowerCase();
  const hit = Object.values(fs.nodes).find(
    (n) => n.type === 'file' && n.name.toLowerCase().includes(q),
  );
  if (!hit) return `cat: ${name}: No such file`;
  return hit.content?.trim() ? hit.content : `（二进制文件 ${hit.name}，无法以文本显示）`;
}

export function run(cmdline: string, ctx: CmdContext): string[] {
  const parts = cmdline.trim().split(/\s+/);
  const cmd = (parts[0] ?? '').toLowerCase();
  const args = parts.slice(1);

  const out = (s: string): string[] => s.split('\n');

  switch (cmd) {
    case '':
      return [];
    case 'help':
      return out(HELP);
    case 'clear':
      return ['__CLEAR__'];
    case 'date':
      return [new Date().toString()];
    case 'whoami':
      return ['sniper'];
    case 'neofetch':
      return out(NEOFETCH);
    case 'ls':
      return out(lsVirtual());
    case 'cat':
      return out(catFile(args[0] ?? ''));
    case 'open': {
      const app = APP_ALIASES[(args[0] ?? '').toLowerCase()];
      if (!app) return [`open: 未知应用「${args[0] ?? ''}」`];
      ctx.openApp(app);
      return [`已打开 ${app}`];
    }
    case 'theme': {
      const mode = (args[0] ?? '').toLowerCase();
      if (mode !== 'dark' && mode !== 'light' && mode !== 'auto') {
        return ['用法: theme dark|light|auto'];
      }
      useThemeStore.getState().setAppearance(mode);
      return [`外观已切换为 ${mode}`];
    }
    case 'health':
      return out(healthSnapshot());
    case 'wifi': {
      const wifi = useWifiStore.getState();
      const arg = (args[0] ?? '').toLowerCase();
      if (arg === 'on') {
        wifi.setEnabled(true);
        return ['Wi-Fi 已开启'];
      }
      if (arg === 'off') {
        wifi.setEnabled(false);
        return ['Wi-Fi 已关闭'];
      }
      return [wifi.enabled ? `已连接 ${wifi.ssid}（模拟）` : 'Wi-Fi 已关闭'];
    }
    case 'play':
      ctx.openApp('game');
      return ['正在启动 AISniper 太空射击…'];
    case 'echo':
      return [args.join(' ')];
    case 'uname':
      return ['AISniper OS 0.1.0 · Sniper Neural GPU · x86_64（模拟）'];
    default:
      return [`zsh: command not found: ${cmd}（试试 help）`];
  }
}
