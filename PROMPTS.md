# 分步提示词（直接复制给 Coding Agent）

按顺序提交。每一步完成并在浏览器确认后再进行下一步。始终遵守同目录 `PRD.md`、`TECH_DESIGN.md`、`AGENTS.md`。

## 1. 初始化项目

请根据 PRD.md、TECH_DESIGN.md 和 AGENTS.md 初始化 React 18 + TypeScript + Vite 项目，安装 Tailwind CSS、Framer Motion、Zustand、date-fns。配置 `index.css`：引入 Tailwind、定义深色/浅色 CSS 变量（含 `--glass-bg`、`--glass-blur`、`--accent`、`--radius-window` 等）。创建 `src/theme/tokens.css` 与空的 store / types 文件骨架。`App.tsx` 先渲染全屏深色桌面占位和居中标题「AISniper OS」。确保 `npm run dev` 可启动。

## 2. 主题系统与 GlassPanel

实现 `themeStore`（appearance: light/dark/auto，glassLevel 0–100，accent，wallpaperId，iconStyle）。根据 `prefers-color-scheme` 处理 auto。编写 `GlassPanel`：圆角、backdrop-blur、半透明背景、边框、顶部高光，所有后续菜单/窗口/Dock 必须用它或同等 token。在桌面放一块预览玻璃卡片验证浅色/深色切换（临时按钮即可，下一步会接到设置）。

## 3. 菜单栏 + 时钟

创建 `MenuBar`：整行视觉透明，左侧原创 AISniper 瞄准镜 Logo + 当前 App 名，右侧状态图标位与 `MenuClock`。时钟用 `useClock` 每秒更新，菜单栏只显示星期+日期+时分（设置项稍后接）。点击时钟打开 `CalendarPopover`（本月日历、今天高亮、三个城市时间 mock）。Esc 与点击外部关闭。用 Framer Motion spring 做弹出。

## 4. Wi-Fi 与系统健康弹窗

实现 `StatusIcons`、`WifiPopover`、`HealthPopover`。Wi-Fi：开关、当前 SSID、信号、附近网络列表（`data/mockWifi.ts`）。健康：模拟 CPU/内存/GPU/温度，0–100 总分变色，30 点折线，游戏未接入时用随机游走。`osStore.openPopover` 互斥。Toast 组件：关闭 Wi-Fi 时提示未连接。图标用 SVG，不要用 Apple 商标图形。

## 5. 窗口管理器

实现 `osStore` 窗口列表与 `Window` + `WindowManager`。窗口可拖拽、右下角缩放、最小化、最大化（避开菜单栏与 Dock 预留位）、关闭、聚焦置顶。交通灯红黄绿。最小尺寸可配。先用一个「Demo」窗口验证交互。z-index 与阴影要让前台窗明显。移动端宽度 < 768 强制最大化、禁用拖拽。

## 6. 底部 Dock

实现 `Dock` + `DockItem` + `data/dockApps.ts`。五个固定入口：Finder、计算器、设置、终端、太空射击。底部居中玻璃槽，squircle 图标（SVG 原创），hover 放大与邻近让位（可开关，默认开），运行中小圆点指示器。点击：已开则 focus/还原，未开则 `openApp`。预留 Dock 高度给窗口最大化计算。

## 7. Finder

实现 `fsStore` + `mockFiles.ts` + `FinderApp`。侧边栏分区 + 图标/列表视图 + 工具栏前进后退与搜索过滤。支持新建文件夹、重命名、移入废纸篓（内存）。双击「太空射击.app」调用 `openApp('game')`。Quick Look 预览文本与占位图。窗口标题显示当前文件夹名。

## 8. 计算器

实现 `CalculatorApp`。基础运算与科学模式展开。大号等宽显示，玻璃按键，支持键盘输入。窗口默认较小，科学模式加宽。计算用精确字符串状态机，注意 `0.1+0.2` 展示处理（可四舍五入到合理位数）。

## 9. 设置与主题切换打通

实现 `SettingsApp`：外观（浅/深/自动）、Liquid Glass 滑杆 Clear↔Tinted、强调色圆点、图标外观、壁纸选择（`wallpapers.ts`：深空/极光/湖面/纯色）、时钟 12/24 与中英、Dock 放大开关、减少动效、关于本机。所有改动即时写入 `themeStore` 并反映到菜单栏、Dock、窗口、弹窗。桌面壁纸随选择切换。

## 10. 命令行终端

实现 `TerminalApp` + `terminalCommands.ts`。提示符 `sniper@aisniper ~ %`。白名单：help、clear、date、whoami、neofetch、ls、cat、open、theme、health、wifi、play、echo、uname。`open` / `play` 调 `openApp`。历史方向键。禁止 eval。欢迎语按 PRD。输出区可滚动，焦点自动落在输入。

## 11. 开机动画与桌面收尾

实现 `BootSplash`（星核亮起 → 桌面淡入，1.2–1.6s，点击跳过，localStorage 只自动播一次）。整理 `Desktop`：壁纸层、点击空白关闭弹窗、可选少量桌面图标（Finder / 游戏）。删除第 5 步的 Demo 窗口。核对层次：壁纸 < 桌面图标 < 窗口 < 弹窗 < Dock < 菜单栏命中。

## 12. 3D 太空射击 — 场景与玩家

安装 three、@react-three/fiber、@react-three/drei。实现 `GameApp`：仅窗口打开时挂载 Canvas。`SpaceScene` 星空、弱雾、环境光。`PlayerShip` 低面数飞船，鼠标/WASD/方向键移动，空格射击。子弹对象池。窗口绿键或 HUD 按钮全屏；全屏时 Dock 滑出隐藏，鼠标到底部再显示。页面 hidden 时暂停帧循环。

## 13. 3D 太空射击 — 敌人、碰撞、HUD、存档

加入敌机波次、陨石、击中与爆炸（短粒子即可）、生命与连击、暂停菜单、结算、localStorage Top 10。`GameHUD` 分数/生命/雷达。低性能降低像素比与粒子。移动端虚拟摇杆 + 射击键。从 Finder / Dock / 终端 `play` 进入都应工作。游戏 `playing` 时健康度模拟把 CPU/GPU 抬高。

## 14. 联调、动效与适配

全局过一遍 Framer Motion：窗口出现、弹窗、Dock、开机。补 `prefers-reduced-motion`。检查浅色主题对比度，必要时提高 Tinted 下限。响应式：手机全屏 App + 底栏。快捷键：Esc 关弹窗或暂停游戏，⌘/Ctrl+W 关前台窗（可选）。修 z-index、焦点、重复打开单例。去掉调试按钮与 console。

## 15. 部署（可选）

配置 Vite base，确保生产构建 `npm run build` 通过。部署到 Vercel 或 Netlify。在 README 写明：纯前端模拟 OS、无真实系统权限、建议桌面 Chrome / Safari 全屏（F11）体验。
