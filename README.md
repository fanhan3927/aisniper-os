# AISniper OS

一套在浏览器里运行的「下一代桌面操作系统」体验 —— Liquid Glass 玻璃材质、窗口管理器、底部 Dock、内置 3D 太空射击游戏。视觉与交互对标 macOS Tahoe / Golden Gate 的 Liquid Glass 设计语言，但 Logo 与全部图标均为原创，不依赖任何 Apple 商标资源。

> **重要说明**：这是一个**纯前端模拟 OS**。所有系统数据（Wi-Fi、CPU/GPU/温度、文件系统、电池）均为**模拟**，不具备任何真实系统权限，也不会读取你的真实磁盘或真实网络。

## 功能

- 🪟 **窗口系统**：拖拽、缩放、最小化、最大化（避开菜单栏与 Dock）、聚焦置顶、交通灯、移动端强制全屏卡片
- 🧊 **Liquid Glass 主题**：浅色 / 深色 / 自动，Clear↔Tinted 通透滑杆，5 种强调色，4 种图标外观，4 张壁纸
- 📅 **菜单栏**：原创瞄准镜 Logo、前台 App 名、Wi-Fi / 系统健康 / 电池状态簇、实时时钟 + 日历 + 世界时钟
- 📶 **系统弹窗**：Wi-Fi 开关与附近网络列表（模拟）、系统健康度（CPU/内存/GPU/温度/风扇 + 总分 + 30 秒折线）、Toast 通知
- ⬇️ **Dock**：Finder / 计算器 / 设置 / 终端 / 太空射击五个固定入口，hover 放大与邻近让位，运行指示点
- 📁 **Finder**：图标/列表视图、前进后退、搜索、新建文件夹、重命名、废纸篓、Quick Look 预览、双击「太空射击.app」开游戏
- 🧮 **计算器**：四则运算 + 科学模式，键盘可用，字符串状态机规避浮点误差
- ⚙️ **设置**：外观 / 玻璃 / 强调色 / 图标 / 壁纸 / 时钟 / Dock / 减少动效 / 关于本机，改动即时全局生效
- 💻 **终端**：`sniper@aisniper ~ %`，白名单命令（help / clear / neofetch / ls / cat / open / theme / health / wifi / play …），方向键历史，**禁止 eval**
- 🚀 **3D 太空射击**：低面数飞船、子弹对象池、敌机波次、陨石、爆炸粒子、连击、暂停、结算、localStorage Top 10 排行榜、全屏模式、移动端虚拟摇杆
- 🌟 **开机动画**：星核亮起 → 桌面淡入（1.5s，点击跳过，只自动播一次）

## 技术栈

React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · Zustand · date-fns · Three.js · React Three Fiber · React Three Drei

## 开发

```bash
npm install        # 或 pnpm install
npm run dev        # 开发服务器 → http://localhost:5173
npm run build      # 类型检查 + 生产构建（产物在 dist/）
npm run preview    # 预览生产构建
```

## 建议体验方式

- 桌面 Chrome / Safari（最新版），按 **F11** 全屏浏览器获得最佳「桌面」沉浸感
- 深色宇宙壁纸为默认主题；浅色 + Tinted 玻璃同样完整可用（设置 → 外观）
- 快捷键：`Esc` 关闭弹窗 / 暂停游戏，`P` 暂停游戏，`⌘/Ctrl+W` 关闭前台窗口，`Enter`（主菜单）开始游戏
- 游戏：鼠标 / WASD / 方向键移动，空格或按住左键射击；移动端使用虚拟摇杆 + 射击键

## 部署

本项目为纯静态站点，已配置 Vite `base: './'`，可直接部署到任意静态托管：

```bash
npm run build
```

- **Vercel**：导入仓库 → Framework Preset 选 Vite，构建命令 `npm run build`，输出目录 `dist`
- **Netlify**：构建命令 `npm run build`，发布目录 `dist`

## 目录速览

```
src/
  components/os/      # 桌面、菜单栏、弹窗、窗口管理器、Dock、开机动画
  components/apps/    # Finder / 计算器 / 设置 / 终端 / 游戏
  components/game/    # 3D 太空射击（场景、引擎、HUD）
  components/ui/      # GlassPanel、SquircleIcon、Switch / Slider / Segmented、图标集
  store/              # osStore / themeStore / fsStore / gameStore / wifiStore
  hooks/              # useClock、useSimulatedHealth、useIsMobile…
  data/               # mock 数据（Wi-Fi、文件、壁纸、Dock、终端命令）
  theme/              # 设计令牌 tokens.css 与主题计算
  types/              # WindowInstance / FsNode / GameState 模型
```

## 免责声明

AISniper OS 是一个视觉与技术演示项目。它不模拟、不代表、也不连接任何真实操作系统、真实网络或真实硬件。所有出现在界面中的系统信息均为剧本化的模拟数据。
