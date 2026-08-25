# Port-Light 产品主页 · 设计文档

日期：2026-08-25
状态：已批准（方向经用户确认，细节授权作者定稿）

## 1. 目标与定位

为开源工具 [Port-Light](https://github.com/StepaniaH/port-light)（当前推广版本 **v0.7.0**）建设一个**产品宣传主页**。

**用户原话校准的定位**：这是一个「有介绍、有亮点、有展示、有动画」的产品主页——不是把应用 UI 复刻成网站。站点借用 Port-Light 的品牌基因（夜港深蓝、蓝/琥珀/绿信号三色、灯塔意象），但整体是标准的 landing page 语言：大标题排版、分区叙事、滚动动画。

**成功标准**：
- 访客 30 秒内看懂产品是什么、解决什么问题
- 一键复制 docker-compose 快速开始，点进 Docker Hub / GitHub
- 在 Product Hunt、Reddit (r/homelab, r/selfhosted)、V2EX 等渠道传播时撑得住门面

**受众**：homelab 玩家、self-hosted 社区、使用 coding agent 的开发者。

## 2. 已确认的决策

| 决策点 | 结论 |
|---|---|
| 网站类型 | 单页产品宣传落地页 |
| 语言 | 双语：英文默认 + 简体中文切换，localStorage 记忆 |
| 技术栈 | 纯静态 HTML/CSS/JS，原生 ES modules，**无构建步骤**（与产品哲学一致） |
| 托管 | Cloudflare Pages（无 build command，根目录即站点） |
| 首屏创意 | 交互式模拟端口网格 + 灯塔光束 |
| 实时数据 | 前端直接拉 GitHub API（stars）与 Docker Hub API（pulls），失败回退写死数字 |
| 视觉方向 | 「港口夜航」：品牌同源配色，但整站是产品主页而非应用皮肤 |

## 3. 信息架构（单页分区，锚点导航）

1. **导航栏**：灯塔 logo + Port-Light 字标 · 锚点链接（How it works / Features / Agents / Quick start）· GitHub stars 徽章 · 语言切换 · 主题切换器
2. **Hero**：左文案 + 右交互演示（详见 §4）+ 实时数据胶囊
3. **How it works「三源合一」**：`/proc` 监听表、Docker API、Compose 文件三张来源卡片汇聚为一张网格的图示；蓝/琥珀/绿三色图例（In use / Configured / Free）
4. **Features 精选网格**：6–8 张卖点卡（搜索+空闲备选、Compose 冲突预警、多机 LAN/Tailscale 并排、SSE 实时刷新+本地历史、Webhook+Prometheus 指标、手动登记+标签命名、4 语言、无遥测隐私承诺）
5. **Agents 智能体区**：v0.7.0 主打——`GET /api/ports/suggest` 终端示例（含 reserve/ttl/leases）、MCP stdio 服务器、agent skill；终端风代码块 + 复制按钮
6. **Themes 主题长廊**：15 套配色（dark/light/gruvbox×2/catppuccin×2/dracula/everforest/kanagawa/nord/one-dark/rose-pine/solarized×2/tokyo-night）色板卡，点击即把**整站**切成该配色——彩蛋同时是产品特色的活演示
7. **Quick start**：完整 docker-compose.yml 代码块（v0.7.0 镜像、四条 volume、COMPOSE_SCAN_DIR）+ `docker compose up -d` + 复制按钮；amd64/arm64、GHCR 镜像源说明
8. **诚实边界 + 页脚**：「这是端口占用图，不是容器管理器（不替代 Portainer）」；隐私承诺（无遥测、数据不出机器）；Product Hunt 徽章、Ko-fi、MIT、相关文档链接

## 4. Hero 首屏

**左侧**：
- 大标题（EN 默认）：*"Every port. One glance. Zero guesswork."*；中文：「哪个端口被谁占了，一眼看清」
- 副标题：一句话讲清三源合一 + 红绿灯网格
- 双 CTA：`docker pull stepaniah/port-light` 一键复制 · GitHub 按钮
- 实时数据胶囊：★ stars · Docker pulls · v0.7.0

**右侧：交互式模拟网格**（产品展示窗口，标注 "live demo · simulated data"）：
- 迷你 Port-Light 界面：搜索框、计数行、约 50 张端口卡（仿真数据：jellyfin 8096、gitea 3000、adguardhome 53、postgres 5432 等）
- **灯塔光束**：从灯塔 logo 发出的旋转光锥周期扫过网格，扫过的卡片短暂提亮；纯 CSS transform/opacity 动画
- **剧情循环**（每 6–8 秒一幕）：amber→蓝「jellyfin 开始监听 8096」toast；双卡橙色脉冲「Compose 冲突」；搜索框自动演示输入「3000」→ 周边亮起绿色空闲备选
- **可玩**：用户可随时接管——自己输入端口号、点击卡片复制端口号（toast 反馈）；用户操作时暂停自动剧情
- 移动端：文案在上、演示在下

## 5. 视觉语言

- **配色**：默认夜航深色（`--bg #0c1016` 系），信号三色 `--used #58a6ff` / `--configured #d4a017` / `--free #3fb950`；全部 15 套产品配色移植为站点主题（CSS 自定义属性，token 名与产品对齐，值从 `port-light/frontend/style.css` 抄录）
- **字体**：自托管 Space Grotesk（标题展示字体，拉丁子集 woff2）+ 系统无衬线（正文）+ 系统 monospace（端口数字/代码块）
- **动效**：滚动进入视口时分区淡入上移（IntersectionObserver）；光束扫描、卡片呼吸、状态切换闪光；全部尊重 `prefers-reduced-motion`
- **氛围**：夜港渐变背景、稀疏星点/网格纹理、信号灯辉光，克制不堆砌

## 6. 技术实现

```
port-light-page/
├── index.html
├── css/
│   ├── tokens.css      # 设计 token + 15 套配色
│   ├── base.css        # 重置、排版、通用组件（按钮/卡片/代码块）
│   └── main.css        # 各分区样式（nav/hero/sections/footer）
├── js/
│   ├── main.js         # 入口，装配各模块
│   ├── i18n.js         # data-i18n 字典 + EN/zh 切换
│   ├── demo-grid.js    # 模拟网格引擎（数据/剧情循环/搜索演示/点击复制）
│   ├── themes.js       # 主题切换器（localStorage 持久化）
│   ├── stats.js        # GitHub/Docker Hub 实时数据 + 静态回退
│   └── reveal.js       # 滚动动画
├── assets/
│   ├── icon.png        # 灯塔 logo（取自产品 docs/icon.png）
│   ├── favicon.svg
│   └── fonts/          # Space Grotesk woff2
├── docs/superpowers/   # 本设计文档与实现计划
└── README.md
```

- **i18n**：`data-i18n` 属性 + JS 字典；`<html lang>` 同步；默认 EN
- **实时数据**：`api.github.com/repos/StepaniaH/port-light`（stars）、`hub.docker.com/v2/repositories/stepaniah/port-light`（pulls）；任一失败静默回退 HTML 内写死数字；数字变化用 count-up 动画
- **无外部运行时依赖**：无 npm、无 CDN 脚本；字体自托管
- **SEO/分享**：完整 meta/OG 标签、favicon、sitemap.xml、robots.txt；OG 图后续用成品截图补

## 7. 错误处理与降级

- 任一外部 API 失败 → 静态回退数字，页面无感
- JS 失效 → 内容仍完整可读（渐进增强：动画/交互是增量）
- `prefers-reduced-motion` → 关闭光束/剧情循环/滚动动画

## 8. 验证方式

- 本地起静态服务器，桌面（1440px）与移动（390px）视口截图人工检查
- 浏览器控制台无报错
- 语言切换、主题切换、演示网格交互、复制按钮逐一手测

## 9. 范围外（Out of scope）

- 文档子站 / 博客 / changelog 页（链接到 GitHub 对应文档）
- 任何后端、真实产品数据接入
- 多页路由
