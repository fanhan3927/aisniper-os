# 技术设计

## 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS（CSS 变量驱动主题与 Liquid Glass）
- Framer Motion（窗口、Dock、弹窗、开机）
- Zustand（OS 级状态：窗口、主题、状态栏、游戏是否前台）
- Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing（3D 太空射击）
- date-fns（时钟与日历）
- 可选：howler 或 Web Audio API（UI / 游戏音效）
- localStorage 持久化：主题、通透、强调色、壁纸、时钟格式、游戏排行榜、开机是否已播放

不使用 React Router：整机是单页「桌面」，App 是窗口实例而不是路由。

## 项目结构

```
src/
  components/
    os/
      Desktop.tsx            # 壁纸 + 桌面图标层 + 事件总线
      MenuBar.tsx            # 透明菜单栏
      MenuClock.tsx
      StatusIcons.tsx
      WifiPopover.tsx
      HealthPopover.tsx
      CalendarPopover.tsx
      Dock.tsx
      DockItem.tsx
      Window.tsx             # 通用窗口壳（交通灯、拖拽、缩放）
      WindowManager.tsx
      BootSplash.tsx
      Toast.tsx
    apps/
      FinderApp.tsx
      CalculatorApp.tsx
      SettingsApp.tsx
      TerminalApp.tsx
      GameApp.tsx            # 包装 R3F Canvas
    game/
      SpaceScene.tsx
      PlayerShip.tsx
      Enemies.tsx
      Projectiles.tsx
      Asteroids.tsx
      Effects.tsx
      GameHUD.tsx
      GameMenu.tsx
      useGameLoop.ts
    ui/
      GlassPanel.tsx
      TrafficLights.tsx
      SquircleIcon.tsx
      SegmentedControl.tsx
      Slider.tsx
      Switch.tsx
  store/
    osStore.ts               # 窗口列表、焦点、弹窗、通知
    themeStore.ts            # appearance / glass / accent / wallpaper
    fsStore.ts               # 虚拟文件系统
    gameStore.ts             # 分数、生命、暂停、排行榜
  hooks/
    useClock.ts
    useSimulatedHealth.ts
    useHotkeys.ts
    usePrefersReducedMotion.ts
  data/
    dockApps.ts
    mockWifi.ts
    mockFiles.ts
    wallpapers.ts
    terminalCommands.ts
  theme/
    tokens.css               # CSS 变量
    themes.ts
  types/
    os.ts
    fs.ts
    game.ts
  App.tsx
  main.tsx
  index.css
```

## 主题与 Liquid Glass Token

在 `:root` 与 `[data-theme="light"]` / `[data-theme="dark"]` 定义：

```css
--bg-desktop: ...;
--glass-bg: rgba(255,255,255,0.08);      /* 随 Tinted 滑杆变不透明 */
--glass-blur: 24px;
--glass-border: rgba(255,255,255,0.22);
--glass-highlight: linear-gradient(...) ;
--accent: #0a84ff;
--text-primary: ...;
--text-secondary: ...;
--shadow-window: ...;
--radius-window: 18px;
--radius-popover: 22px;
--radius-dock: 26px;
```

通透滑杆映射：

- Clear：`--glass-bg` 更透，`--glass-blur` 更大，文字依赖阴影与 Tinted 自动下限
- Tinted：提高不透明度并加一层主题色 6–10% 染色，保证 WCAG 对比

实现要点：

- `GlassPanel` 统一 `background: var(--glass-bg)` + `backdrop-filter: blur(var(--glass-blur)) saturate(140%)` + inset highlight
- 低性能或 `prefers-reduced-transparency` 时关闭 blur，改实色

## 数据管理

- **OS 状态（Zustand `osStore`）**
  - `windows: WindowInstance[]`（id, appId, title, x, y, w, h, minimized, maximized, z）
  - `focusedId`, `nextZ`
  - `openPopover: 'wifi' | 'health' | 'clock' | null`
  - `toasts[]`
  - actions: `openApp`, `closeApp`, `focus`, `move`, `resize`, `minimize`, `maximize`
- **主题（`themeStore`）**：appearance、glassLevel 0–100、accent、iconStyle、wallpaperId、clockFormat、locale、reduceMotion、dockMagnify
- **虚拟 FS（`fsStore`）**：树形节点，CRUD 仅内存 + 可选 persist
- **游戏（`gameStore`）**：phase `menu | playing | paused | over`，score，lives，combo，highscores
- 模拟健康：`useSimulatedHealth` 用 `requestAnimationFrame` / 1s interval 做平滑随机游走；游戏 `playing` 时 CPU/GPU 目标值抬高

## 窗口管理

- 坐标为桌面像素，拖拽写在标题栏 `pointer` 事件，需考虑菜单栏高度与 Dock 高度，最大化时避开这两带
- 缩放：右下角 handle；最小宽高按 App 配置（计算器更小，游戏更大）
- 同一 App 默认单例（再点 Dock 则 focus / unminimize）。终端允许未来扩展多实例，本期单例即可
- 游戏窗口进入全屏：Canvas 填满视口，隐藏菜单栏文字但保留 4px 热区，Dock 自动隐藏

## 3D 游戏架构

- `GameApp` 只在窗口打开时挂载 Canvas，关闭即卸载，避免后台占 GPU
- 场景分层：星空 skybox / 粒子尘埃、玩家舰、敌机实例（instancedMesh 优先）、子弹池（对象池，禁止每发 `new` 网格）、爆炸 sprite / 简易粒子
- 碰撞：简单 AABB 或距离检测，不做 cannon.js，除非有余力
- 控制：桌面 `pointer lock` 可选，默认鼠标移动映射飞船 X/Y；移动端虚拟摇杆
- 渲染：`dpr` 上限 2，可见性 API 暂停，`frameloop="always"` 仅在 playing
- 美术方向：暗色宇宙 + 青紫引擎光 + 敌机橙红警示，与 OS 强调色可轻微呼应

## 终端

- `terminalCommands.ts` 导出纯函数 `run(cmd, ctx): string | { openApp }`
- 禁止 `eval`、禁止用户输入进 `Function`
- 历史 50 条；输出为行数组，ANSI 色可用简单 class 代替

## 性能

- 弹窗与窗口用 `layout` 动画时避免同时动画整棵桌面树
- 健康折线图用 canvas 或轻量 svg polyline，30 点即可
- Dock 放大只改 transform
- 壁纸用 CSS 或一张优化过的 webp；动态星空用 canvas 2d 低密度粒子，不要和游戏抢 WebGL 上下文（桌面用 CSS/canvas2d，游戏独占 WebGL）

## 适配

- `sm` 以下：MenuBar 精简图标；Dock 无放大；窗口强制 `maximized`
- 触控：弹窗点遮罩关闭；游戏双按钮

## 启动流程

`main.tsx` → `App` 读取 themeStore → 决定是否 `BootSplash` → `Desktop` 挂载 MenuBar + WindowManager + Dock
