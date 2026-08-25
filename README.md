# port-light-page

Landing page for [Port-Light](https://github.com/StepaniaH/port-light), a local port-occupancy dashboard for homelab. Static HTML/CSS/JS — no npm, no build step, matching the app itself.

## Run locally

```bash
python3 -m http.server 8321
```

Then open `http://localhost:8321`.

## Deploy

Hosted on Cloudflare Pages, deployed from `main`:

- Build command: none
- Output directory: `/` (repo root)

## Page features

- Simulated Port-Light grid in the hero: a beam sweep, a rotating demo loop (new listener, Compose conflict, search suggestions). Visitors can type a port number or click a card to copy it.
- 15 theme palettes, ported from the app's `frontend/style.css`. The picker re-skins the whole site.
- English and 简体中文, toggle in the nav.
- GitHub stars fetched live from the GitHub API. Docker pulls are a baked number in `js/stats.js` (Docker Hub sends no CORS headers).
- Scroll reveals and copy buttons; all motion respects `prefers-reduced-motion`, and the content stays readable with JavaScript disabled.

URL parameters for sharing a state: `?lang=zh-CN`, `?theme=gruvbox`, `?q=3000` (prefills the demo search).

## Development

```
index.html        all sections and copy, with data-i18n hooks
css/tokens.css    design tokens and the 15 palettes
css/base.css      reset, typography, buttons, code blocks
css/main.css      layout and section styles
js/main.js        boot
js/i18n.js        en / zh-CN dictionaries and toggle
js/demo-grid.js   simulated grid engine
js/themes.js      palette switcher and gallery
js/stats.js       live stars, baked pulls
js/reveal.js      scroll reveals and copy buttons
js/test/          unit tests (node --test, no npm)
```

Tests:

```bash
node --test js/test/i18n.test.mjs js/test/demo-data.test.mjs
```

Copy and the Compose file mirror the Port-Light README at v0.7.0. When updating content, edit `index.html` and both dictionaries in `js/i18n.js` together — a test enforces key parity between the two languages.

## License

MIT © 2026 StepaniaH
