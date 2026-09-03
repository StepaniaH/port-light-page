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

Wrangler picks up `functions/` automatically; `/api/stats` is a Pages Function that proxies the Docker Hub pull count, GitHub stars and the latest release (Docker Hub sends no CORS headers, and keeping GitHub off the client avoids its per-IP rate limit). Each metric is cached for an hour at the edge and served stale when its upstream fails.

Docker Hub and GitHub both rate-limit Cloudflare's shared egress IPs hard (429/403), so the function optionally authenticates — set these fine-grained read-only secrets and the quotas move to the accounts:

```bash
npx wrangler pages secret put GITHUB_TOKEN --project-name=port-light-page
npx wrangler pages secret put DOCKER_HUB_USERNAME --project-name=port-light-page
npx wrangler pages secret put DOCKER_HUB_TOKEN --project-name=port-light-page
```

To auto-deploy on push instead, connect the GitHub repo to the Pages project in the Cloudflare dashboard (Build command: none, output directory: `/`).

## Page features

- Simulated Port-Light grid in the hero: a beam sweep, a rotating demo loop (new listener, Compose conflict, search suggestions). Visitors can type a port number or click a card to copy it.
- The "how it works" source cards toggle which cells the merge grid highlights; the features section opens an inline detail view with a micro-demo per feature and an icon rail for switching.
- 22 themes: the defaults plus ten palette families in light and dark, ported from the app's `frontend/style.css`. The picker re-skins the whole site.
- Seven UI languages (English, 简体中文, 繁體中文, 日本語, Français, Deutsch, Español) via a custom dropdown in the nav — see "Localization" below.
- GitHub stars, Docker pulls and the latest release version all fetched live through `/api/stats` (a Pages Function proxying Docker Hub — which sends no CORS headers — and the GitHub API, edge-cached with `s-maxage=3600` so visitors never hit upstream rate limits). Set an optional `GITHUB_TOKEN` secret on the Pages project to raise the GitHub rate limit. Baked values in `index.html` are the offline fallbacks.
- Social share card: `assets/og.png` (1200×630), generated from `assets/og-card.html`:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --hide-scrollbars --window-size=1200,630 \
  --screenshot=assets/og.png "file://$PWD/assets/og-card.html"
```
- Favicon fallbacks: `assets/favicon-32.png` and `assets/apple-touch-icon.png` (180×180, opaque) are screenshots of `assets/favicon.svg` over a `#0c1016` background:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --window-size=180,180 --screenshot=assets/apple-touch-icon.png "file://$PWD/assets/favicon.svg"
```
- Scroll reveals and copy buttons; all motion respects `prefers-reduced-motion`, and the page stays readable with JavaScript disabled: the hero grid is baked into `index.html` (46 static cells + counts line) and replaced by the live engine on boot. A test keeps the baked markup in sync with `PORTS`.
- Demo cells are removed from the tab order (`tabindex="-1"`) so keyboard users aren't forced through ~46 stops; the language/theme menus support arrow-key navigation, and a minimal `404.html` keeps unknown URLs from soft-404ing into the homepage.
- First visit follows the system light/dark preference (no saved pick, no `?theme=`); theme switches cross-fade via a temporary `.theme-anim` class.
- Feature icons are theme-aware inline SVG; the docker pull CTA shows a copy icon and ✓ feedback; a bottom CTA repeats the quick start after the limits section.
- FAQ section covers docker.sock permissions, COMPOSE_SCAN_DIR, exposure and agent port reservation; the agents echo grid is captioned as the result of the sample call.
- Mobile nav is a single 60px row with a hamburger section menu; anchors carry `scroll-margin-top` so the sticky nav never covers targets.

URL parameters for sharing a state: `?lang=zh-CN`, `?theme=gruvbox`, `?q=3000` (prefills the demo search).

## Localization

- `js/locales/<code>.js` — one ES module per language, flat dotted keys. `en.js` is canonical: every other locale must have the exact same key set (tests enforce this, plus non-empty strings and `{param}` placeholder parity).
- `js/i18n.js` — `LANGS` (code + endonym), `DICTS`, the `t(key, params)` lookup with en fallback, and `applyLang()`. First visit picks the browser language (`navigator.languages`, `zh*` → `zh-CN`); the choice persists in `localStorage` (`pl-lang`). `?lang=` overrides.
- Markup hooks: `data-i18n="key"` (textContent), `data-i18n-html="key"` (innerHTML, only for the limits body link), `data-i18n-attr="attr:key;attr2:key2"` (attributes — placeholders, `title`, `aria-label`, meta content). `<title>` and the meta description localize client-side; og:/twitter: tags stay English because social scrapers don't run JS, and the og card image is English for the same reason.
- JS-side strings go through the `t` passed to `initDemoGrid`; theme display names live under `theme.*` keys; the pre-paint language list in `js/boot.js` (first-paint flash guard) is kept in sync with `LANGS` by a test.
- `applyLang()` dispatches `pl:lang` after re-translating; modules that render their own text (demo grid, theme labels, feature rail aria-labels) listen for it.

**Add a language** (e.g. `pt-BR`):

1. Create `js/locales/pt-BR.js` — copy `en.js`, translate the values, keep keys identical.
2. Register it in `js/i18n.js`: one import, one `LANGS` entry `{ code: 'pt-BR', endonym: 'Português (Brasil)' }`, one `DICTS` entry.
3. Add `'pt-BR'` to the `var langs = [...]` array in the inline head script in `index.html`.
4. Run the tests — key parity, placeholders, page-key coverage, the inline list and theme labels are all enforced for you.

**Add a string**: add the key to `en.js` and all locale files, then reference it via a `data-i18n*` attribute in `index.html` or `t('key')` in JS. Tests fail if any locale (or the page) is missed.

## Development

```
index.html        all sections and copy, with data-i18n hooks
404.html          minimal standalone 404 page (keeps unknown URLs from serving the homepage with 200)
sitemap.xml       single-URL sitemap
css/tokens.css    design tokens and the 22 themes
css/base.css      reset, typography, buttons, code blocks
css/main.css      layout and section styles
js/boot.js        pre-paint guards (js class + non-English flash guard), classic script so CSP needs no 'unsafe-inline'
js/main.js        boot
js/i18n.js        i18n engine: language metadata, t(), applyLang()
js/menu-nav.js    shared arrow-key navigation for the language/theme menus
js/locales/       one dictionary file per language
js/lang.js        custom language dropdown
js/nav-mobile.js   mobile section menu (hamburger)
js/demo-grid.js   simulated grid engine
js/sources.js     source cards expand + merge-grid focus
js/features.js    feature detail view with micro-demos
js/themes.js      palette switcher and gallery
js/stats.js       live stars, pulls and version (via /api/stats)
js/reveal.js      scroll reveals and copy buttons
functions/        Pages Function proxying Docker Hub pulls, GitHub stars and the latest release
_headers          security response headers (CSP, nosniff, frame/referrer policies) plus cache rules: HTML leads, css/js/assets cached a day — Cloudflare Pages purges its edge cache on every deploy
js/test/          unit tests (node --test, no npm)
```

Tests:

```bash
node --test js/test/i18n.test.mjs js/test/demo-data.test.mjs js/test/page-markup.test.mjs
```

CI runs the same tests on every push and PR (`.github/workflows/test.yml`).

## Release checklist

The app version is baked in three visible spots in `index.html` — the hero pill, the Compose image tag (both `data-app-version` / plain text), and the JSON-LD `softwareVersion` — and as offline fallbacks in `js/main.js` (`starsFallback`, `pullsFallback`) and `functions/api/stats.js` (`FALLBACK`). When Port-Light ships a new release, bump `vX.Y.Z` in `index.html` and `functions/api/stats.js`; `/api/stats` overwrites the hero pill live once the release is out.

Copy and the Compose file mirror the Port-Light README. When updating content, edit `index.html` and all locale files in `js/locales/` together — tests enforce key parity, non-empty strings and placeholder consistency across locales.

## License

MIT © 2026 StepaniaH
