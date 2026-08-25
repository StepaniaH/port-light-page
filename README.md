# port-light-page

Product landing page for [Port-Light](https://github.com/StepaniaH/port-light) — the local port-occupancy dashboard for homelabs. This repo is the marketing homepage: intro, highlights, an interactive simulated-grid demo, and a quick-start guide.

**Plain static HTML/CSS/JS. No npm, no build step** — same philosophy as Port-Light itself.

## Preview locally

```bash
python3 -m http.server 8321
# open http://localhost:8321
```

## Deploy (Cloudflare Pages)

- Build command: **none**
- Output directory: `/` (repo root)
- Push to `main` and Pages publishes automatically.

## Features of the page

- Interactive hero demo: a simulated Port-Light grid with a lighthouse beam sweep, live "story loop" (new listeners, conflicts, search suggestions). Type a port number or click a card to copy it. `?q=3000` deep-links a search state.
- 15 theme palettes ported verbatim from the app (`css/tokens.css`); the theme picker re-skins the whole site. `?theme=gruvbox` deep-links one.
- Bilingual: English default, 简体中文 toggle. `?lang=zh-CN` deep-links a language.
- Live GitHub stars (client-side fetch; Docker Hub pulls are a baked number in `js/stats.js` because hub.docker.com sends no CORS headers — proxy it via a Pages Function if you ever want it live).
- Scroll reveals, copy buttons; everything respects `prefers-reduced-motion`, and the page is fully readable with JS disabled.

## Layout

```
index.html          all sections + copy (data-i18n hooks)
css/tokens.css      design tokens + 15 palettes (from port-light/frontend/style.css)
css/base.css        reset, type, buttons, code blocks
css/main.css        layout & sections
js/main.js          boot
js/i18n.js          EN / zh-CN dictionaries + toggle
js/demo-grid.js     simulated grid engine
js/themes.js        palette switcher + gallery
js/stats.js         live stars/pulls
js/reveal.js        scroll reveals + copy buttons
js/test/            node --test unit tests (no npm): i18n parity, demo data
```

Run tests: `node --test js/test/i18n.test.mjs js/test/demo-data.test.mjs`

## Content source

Feature copy and the quick-start Compose file mirror the Port-Light README at **v0.7.0**. When the app ships notable features, update `index.html` and both dictionaries in `js/i18n.js` together (a test enforces key parity).

## License

MIT © 2026 StepaniaH
