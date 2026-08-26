# AISniper OS 开发指令

## 项目概述

使用 React + TypeScript + Vite + Tailwind + Framer Motion + Zustand + React Three Fiber，在浏览器中实现名为 **AISniper OS** 的桌面操作系统壳。视觉对标 macOS Tahoe 26 / Golden Gate 27 的 Liquid Glass：透明菜单栏、玻璃 Dock、多层 squircle 图标、通透滑杆、浅色/深色与强调色。内置 Finder、计算器、设置、终端、3D 太空射击。

先做出「能用的漂亮桌面」，再深化游戏。不要做成普通后台管理页。

## 开发规范

- 函数式组件 + Hooks，禁止 class 组件
- 样式以 Tailwind + CSS 变量为主，玻璃材质抽到 `GlassPanel`
- OS 级状态进 Zustand，不要把窗口列表散落在多个 useState
- 组件可复用：窗口壳与 App 内容分离，App 不知道拖拽实现
- 关键逻辑写简短中文或英文注释（窗口约束、命令白名单、对象池）
- TypeScript 严格，为 WindowInstance、DockApp、FsNode、GameState 建模
- 禁止 `eval`、禁止把终端输入当 JS 执行
- 游戏与桌面不要共享同一个 WebGL 上下文做壁纸

## 设计要求

- 默认深色宇宙桌面，但浅色主题必须完整可用
- Liquid Glass：`backdrop-filter` + 半透明填充 + 1px 边 + 顶部内高光。参考色（深色起点）：
  - 桌面底 `#07080c`
  - 玻璃 `--glass-bg: rgba(32,36,48,0.42)`
  - 文字 `#f5f5f7` / 次级 `#a1a1aa`
  - 默认强调色 `#0a84ff`（可切换紫 `#bf5af2`、青 `#64d2ff`、橙 `#ff9f0a`、玫瑰 `#ff375f`）
- Dock 底部居中，图标 hover 放大，开口 App 有指示点
- 窗口交通灯：红 `#ff5f57` 黄 `#febc2e` 绿 `#28c840`
- 动效用 spring（stiffness 380–500，damping 30–36），`prefers-reduced-motion` 时改 fade
- 菜单栏视觉透明，桌面壁纸要能透上来
- 字体：`ui-sans-serif, "SF Pro Display", Inter, system-ui`；时钟与计算器数字用 `ui-monospace, "SF Mono", "JetBrains Mono"`
- 移动端可用，不要求与桌面像素级一致

## 功能约束（必须遵守）

- Dock **默认五个图标且全部可打开**：Finder、计算器、设置、终端、太空射击
- 系统状态弹窗至少包含 **Wi-Fi** 与 **系统健康度**；时钟可点出日历
- 主题切换必须包含：浅色 / 深色 / 自动，以及 Liquid Glass Clear↔Tinted 滑杆、强调色
- 游戏必须可交互：移动、射击、敌人、分数、生命、暂停、结束、本地排行榜
- 所有「系统数据」均为模拟，UI 上不要假装读取了用户真实磁盘或真实 Wi-Fi

## 注意事项

- 保持克制的奢华，不要把页面堆满霓虹和粒子。玻璃、留白、层次比特效重要
- 性能：关闭的游戏必须卸载 Canvas；不可见标签页停止 rAF
- 状态弹窗互斥，点桌面空白关闭
- 窗口不得拖出视口过半导致无法抓回
- 对比度：Clear 玻璃上的小字在浅色壁纸会翻车，需要文字阴影或自动把玻璃 tint 提高
- 图标用 SVG 或 CSS 绘制，不要依赖版权 Apple 图标资源；Logo 用原创「瞄准镜 + 星」符号
- 不要引入大型 UI 库（Antd / MUI）。自己做 Switch / Slider / Segmented
- 提交前自查：五个 App、三个菜单弹窗、主题切换、游戏一局

## 验收清单

- [ ] 开机动画可跳过且只自动播一次
- [ ] 菜单栏时钟每分钟更新，点击出日历
- [ ] Wi-Fi 开关与网络列表可点
- [ ] 健康度有总分、四项指标、迷你趋势
- [ ] Dock 放大与指示点
- [ ] Finder 可浏览虚拟文件
- [ ] 计算器键盘可用
- [ ] 设置改主题立刻反映到全局
- [ ] 终端白名单命令可用，`open game` 能开游戏
- [ ] 游戏可完成一局并写入高分
- [ ] 浅色 + 深色 + Tinted + Clear 都可读
