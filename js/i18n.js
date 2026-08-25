// Port-Light landing page — bilingual dictionaries (EN default, zh-CN) and helpers.

export const LANGS = ['en', 'zh-CN'];
export const DEMO_KEYS = [
  'demo.counts', 'demo.free', 'demo.search',
  'demo.toast.listener', 'demo.toast.conflict', 'demo.toast.free', 'demo.toast.copied',
];

export const dict = {
  en: {
    'nav.how': 'How it works',
    'nav.features': 'Features',
    'nav.agents': 'Agents',
    'nav.quickstart': 'Quick start',
    'hero.kicker': 'Port occupancy map for homelabs',
    'hero.title': 'Every port. One glance. Zero guesswork.',
    'hero.sub': "Port-Light turns your host's listen tables, Docker, and Compose files into one traffic-light grid — so you always know which port is taken, by what, and which are free.",
    'hero.github': 'Star on GitHub',
    'stats.pulls': 'Docker pulls',
    'demo.note': 'live demo · simulated data',
    'demo.search': 'Try 3000…',
    'demo.counts': '{u} in use · {c} configured',
    'demo.free': 'free',
    'demo.toast.listener': '{name} is now listening on {port}',
    'demo.toast.conflict': 'Conflict: two stacks claim port {port}',
    'demo.toast.free': '{port} is taken — {n} free ports nearby',
    'demo.toast.copied': 'Copied {port}',
    'how.kicker': 'How it works',
    'how.title': 'Three local sources. One honest map.',
    'how.lead': 'No agents to install, nothing leaves the machine. Port-Light reads what is already true on your host and merges it into a single grid.',
    'how.s1.t': 'Host listen tables · /proc, ss',
    'how.s1.b': 'TCP/UDP ports actually bound right now.',
    'how.s2.t': 'Docker API',
    'how.s2.b': 'Container names, status, images, published mappings.',
    'how.s3.t': 'Compose files',
    'how.s3.b': 'Ports that are declared — even when the stack is stopped.',
    'how.legend.used': 'In use — something is listening',
    'how.legend.configured': 'Configured — declared, but quiet',
    'how.legend.free': 'Free — offered when you search',
    'features.kicker': 'Features',
    'features.title': 'Built for people who run too many stacks.',
    'f1.t': 'Search that suggests',
    'f1.b': "Type a port number; if it's taken, nearby free ones light up.",
    'f2.t': 'Conflict radar',
    'f2.b': 'Two Compose projects claiming the same host port get flagged before they collide.',
    'f3.t': 'Multi-host, one screen',
    'f3.b': 'Pull occupancy maps from other Port-Light instances over LAN or Tailscale.',
    'f4.t': 'Live, not stale',
    'f4.b': 'SSE pushes a refresh the moment occupancy changes; local history records every transition.',
    'f5.t': 'Hooks & metrics',
    'f5.b': 'Optional webhooks on new listeners and conflicts; Prometheus aggregates when you want them.',
    'f6.t': 'Agent-friendly API',
    'f6.b': 'GET /api/ports/suggest hands your coding agent a genuinely free port — with leases.',
    'f7.t': 'Speaks your theme',
    'f7.b': 'Fifteen palettes from Gruvbox to Kanagawa; four UI languages.',
    'f8.t': 'Stays on your machine',
    'f8.b': 'No telemetry, no accounts, no cloud. Your port map never leaves the host.',
    'agents.kicker': 'For coding agents',
    'agents.title': 'Your agent picks ports. They stick.',
    'agents.lead': 'Coding agents guess ports and collide with your stacks. Port-Light exposes a tiny API — and an MCP stdio server — that hands out genuinely free ports, optionally reserving them with an expiring lease.',
    'agents.link': 'MCP server · agent skill · API docs →',
    'themes.kicker': 'Appearance',
    'themes.title': 'Fifteen palettes. Pick yours.',
    'themes.lead': 'Click one — the whole site re-skins, just like the app.',
    'quickstart.kicker': 'Quick start',
    'quickstart.title': 'Up in one minute.',
    'quickstart.note': 'Images for linux/amd64 and arm64, also on GHCR. Prefer version tags over latest.',
    'limits.title': 'A port occupancy map — not a container manager.',
    'limits.body': "Port-Light doesn't start or stop containers, tail logs, or replace Portainer. It's a LAN tool: set Basic Auth or keep it behind a reverse proxy, and never expose port 2100.",
    'copy': 'copy',
    'footer.telemetry': 'MIT © 2026 StepaniaH · No telemetry.',
  },
  'zh-CN': {
    'nav.how': '工作原理',
    'nav.features': '功能亮点',
    'nav.agents': '智能体',
    'nav.quickstart': '快速开始',
    'hero.kicker': '给 homelab 的端口占用图',
    'hero.title': '哪个端口被谁占了，一眼看清',
    'hero.sub': 'Port-Light 把本机监听表、Docker 与 Compose 文件合并成一张红绿灯网格——哪个端口被占用、被谁占用、哪些还空着，一目了然。',
    'hero.github': '去 GitHub 点星',
    'stats.pulls': 'Docker 拉取',
    'demo.note': '实时演示 · 模拟数据',
    'demo.search': '试试 3000…',
    'demo.counts': '{u} 个占用 · {c} 个已配置',
    'demo.free': '空闲',
    'demo.toast.listener': '{name} 开始监听 {port}',
    'demo.toast.conflict': '冲突：两个栈同时声明端口 {port}',
    'demo.toast.free': '{port} 已被占用——附近有 {n} 个空闲端口',
    'demo.toast.copied': '已复制 {port}',
    'how.kicker': '工作原理',
    'how.title': '三个本机来源，一张如实的占用图',
    'how.lead': '不需要装任何 agent，数据不出这台机器。Port-Light 只读取主机上已经存在的事实，合并成一张网格。',
    'how.s1.t': '主机监听表 · /proc, ss',
    'how.s1.b': '当前真正绑定的 TCP/UDP 端口。',
    'how.s2.t': 'Docker API',
    'how.s2.b': '容器名、状态、镜像与发布的端口映射。',
    'how.s3.t': 'Compose 文件',
    'how.s3.b': '声明了的端口——即使栈没在跑。',
    'how.legend.used': '占用——有进程在监听',
    'how.legend.configured': '已配置——声明了但没人听',
    'how.legend.free': '空闲——搜索时给出备选',
    'features.kicker': '功能亮点',
    'features.title': '为跑了一大堆栈的人而生',
    'f1.t': '搜索即建议',
    'f1.b': '输入端口号；被占用时，附近空闲端口自动亮起。',
    'f2.t': '冲突雷达',
    'f2.b': '两个 Compose 项目抢同一主机端口，撞车之前先预警。',
    'f3.t': '多机同屏',
    'f3.b': '通过局域网或 Tailscale 拉取其他 Port-Light 实例的占用图。',
    'f4.t': '实时不滞后',
    'f4.b': '占用一变，SSE 立刻推送刷新；本地历史记录每次状态变化。',
    'f5.t': '钩子与指标',
    'f5.b': '新监听与冲突可触发 Webhook；需要时暴露 Prometheus 聚合指标。',
    'f6.t': '对智能体友好的 API',
    'f6.b': 'GET /api/ports/suggest 给编码智能体一个真正空闲的端口——还支持租约。',
    'f7.t': '说你的语言',
    'f7.b': '从 Gruvbox 到 Kanagawa 共 15 种配色；4 种界面语言。',
    'f8.t': '数据不出机器',
    'f8.b': '无遥测、无账号、无云端。端口地图永远留在你的主机上。',
    'agents.kicker': '面向编码智能体',
    'agents.title': '让智能体选端口，选了就不撞车',
    'agents.lead': '编码智能体瞎猜端口，总会和你的栈撞车。Port-Light 提供一个小 API 和 MCP stdio 服务器：给出真正空闲的端口，还能用带过期时间的租约预留。',
    'agents.link': 'MCP 服务器 · 智能体 Skill · API 文档 →',
    'themes.kicker': '外观',
    'themes.title': '十五种配色，总有一款是你的',
    'themes.lead': '点一下，整站换装——和应用里一样。',
    'quickstart.kicker': '快速开始',
    'quickstart.title': '一分钟跑起来',
    'quickstart.note': '镜像覆盖 linux/amd64 与 arm64，另有 GHCR。重要机器请钉版本标签，别用 latest。',
    'limits.title': '端口占用图——不是容器管理器',
    'limits.body': 'Port-Light 不启停容器、不看日志、不替代 Portainer。它是局域网工具：请设置 Basic Auth 或放在反向代理后面，永远不要把 2100 端口暴露到公网。',
    'copy': '复制',
    'footer.telemetry': 'MIT © 2026 StepaniaH · 无遥测',
  },
};

export function getLang() {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('pl-lang') : null;
  return LANGS.includes(saved) ? saved : 'en';
}

export function t(key, params = {}, lang = getLang()) {
  let s = (dict[lang] ?? dict.en)[key] ?? dict.en[key];
  if (s == null) return undefined;
  for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function applyLang(lang) {
  if (!LANGS.includes(lang)) lang = 'en';
  if (typeof localStorage !== 'undefined') localStorage.setItem('pl-lang', lang);
  document.documentElement.lang = lang;
  const langBtn = document.getElementById('nav-lang-btn');
  if (langBtn) langBtn.textContent = lang === 'zh-CN' ? '中' : 'EN';
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const v = t(el.dataset.i18n, {}, lang);
    if (v != null) el.textContent = v;
  }
  for (const el of document.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':');
      const v = t(key, {}, lang);
      if (v != null) el.setAttribute(attr, v);
    }
  }
  document.dispatchEvent(new CustomEvent('pl:lang', { detail: { lang } }));
}
