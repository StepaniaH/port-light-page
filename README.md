# port-light-page

Landing page for [Port-Light](https://github.com/StepaniaH/port-light), a local port-occupancy dashboard for homelab. Static HTML/CSS/JS — no build step, matching the app itself.

**Live:** https://port-light-page.pages.dev

## Run locally

```bash
python3 -m http.server 8321
```

Then open `http://localhost:8321`. Static serving only — `/api/stats` 404s and the pull count and version fall back to baked values. To exercise the Pages Function too:

```bash
npx wrangler pages dev . --port 8788
```

## Deploy

Hosted on Cloudflare Pages at https://port-light-page.pages.dev. Deployments are direct uploads:

```bash
npx wrangler pages deploy . --project-name=port-light-page --branch=main
```

Wrangler picks up `functions/` automatically; `/api/stats` is a Pages Function that proxies the Docker Hub pull count (Docker Hub sends no CORS headers, so the browser cannot query it directly).

To auto-deploy on push instead, connect the GitHub repo to the Pages project in the Cloudflare dashboard (Build command: none, output directory: `/`).

## Page features

- Simulated Port-Light grid in the hero: a beam sweep, a rotating demo loop (new listener, Compose conflict, search suggestions). Visitors can type a port number or click a card to copy it.
- The "how it works" source cards toggle which cells the merge grid highlights; the features section opens an inline detail view with a micro-demo per feature and an icon rail for switching.
- 15 theme palettes, ported from the app's `frontend/style.css`. The picker re-skins the whole site.
- Seven UI languages (English, 简体中文, 繁體中文, 日本語, Français, Deutsch, Español) via a custom dropdown in the nav. Strings live in `js/locales/<code>.js` — one file per language; adding one means a new file plus a `LANGS` entry in `js/i18n.js`.
- GitHub stars fetched live from the GitHub API; Docker pulls and the latest release version fetched live through `/api/stats` (a Pages Function proxying Docker Hub and the GitHub releases endpoint).
- Scroll reveals and copy buttons; all motion respects `prefers-reduced-motion`, and the content stays readable with JavaScript disabled.

URL parameters for sharing a state: `?lang=zh-CN`, `?theme=gruvbox`, `?q=3000` (prefills the demo search).

## Development

```
index.html        all sections and copy, with data-i18n hooks
css/tokens.css    design tokens and the 15 palettes
css/base.css      reset, typography, buttons, code blocks
css/main.css      layout and section styles
js/main.js        boot
js/i18n.js        i18n engine: language metadata, t(), applyLang()
js/locales/       one dictionary file per language
js/lang.js        custom language dropdown
js/demo-grid.js   simulated grid engine
js/themes.js      palette switcher and gallery
js/stats.js       live stars, pulls and version (via /api/stats)
js/reveal.js      scroll reveals and copy buttons
functions/        Pages Function proxying Docker Hub pulls + latest release
js/test/          unit tests (node --test, no npm)
```

Tests:

```bash
node --test js/test/i18n.test.mjs js/test/demo-data.test.mjs
```

Copy and the Compose file mirror the Port-Light README. When updating content, edit `index.html` and all locale files in `js/locales/` together — tests enforce key parity, non-empty strings and placeholder consistency across locales.

## License

MIT © 2026 StepaniaH
