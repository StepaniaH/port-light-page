import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
const css = (p) => readFile(new URL(p, import.meta.url), 'utf8');

test('a11y: every feature card points at #feature-detail via aria-controls', () => {
  const cards = [...html.matchAll(/class="feature-card[ "]/g)].length;
  const refs = (html.match(/aria-controls="feature-detail"/g) ?? []).length;
  assert.equal(cards, 9, `expected 9 feature cards, found ${cards}`);
  assert.equal(refs, cards, 'each feature card needs aria-controls="feature-detail"');
});

test('a11y: demo panel is a labelled group with an sr-only hint', () => {
  assert.match(html, /<div class="demo-panel" role="group"/);
  assert.match(html, /class="sr-only" data-i18n="demo.panel.hint"/);
});

test('icons: feature cards use SVG sprite icons, no emoji text', () => {
  const icos = [...html.matchAll(/<span class="ico" aria-hidden="true">([\s\S]*?)<\/span>/g)];
  assert.equal(icos.length, 9, 'expected 9 feature icons');
  for (const [, inner] of icos) assert.match(inner, /^<svg[\s\S]*#i-[a-z-]+/, 'icon must reference the sprite');
});

test('copy affordance: both CTAs carry a label span + copy icon', () => {
  const btns = [...html.matchAll(/<button class="btn primary" data-copy[\s\S]*?<\/button>/g)];
  assert.equal(btns.length, 2, 'hero + bottom CTA');
  for (const [b] of btns) {
    assert.match(b, /<span class="btn-label">docker pull stepaniah\/port-light<\/span>/);
    assert.match(b, /#i-copy/);
  }
});

test('nav: mobile menu button and panel exist', () => {
  assert.match(html, /id="nav-menu-btn"[^>]*aria-controls="nav-mobile"/);
  assert.match(html, /<nav id="nav-mobile" class="nav-mobile"[^>]*hidden>/);
});

test('agents echo: result caption + reserved-cell highlight present', () => {
  assert.match(html, /data-i18n="agents.echo.result"/);
  assert.match(html, /<span class="ecell c fresh" data-port="8081"><b>8081<\/b>/);
  assert.match(html, /<span class="ecell c fresh" data-port="8082"><b>8082<\/b>/);
});

test('faq: section renders 4 details items with i18n hooks', () => {
  const faq = html.match(/<section id="faq">[\s\S]*?<\/section>/);
  assert.ok(faq, 'faq section missing');
  assert.equal([...faq[0].matchAll(/<details class="faq-item">/g)].length, 4);
  assert.equal([...faq[0].matchAll(/data-i18n="faq\./g)].length, 10);
});

test('css: anchors clear the sticky nav; scroll-lock and theme-anim exist', async () => {
  const base = await css('../../css/base.css');
  assert.match(base, /scroll-margin-top/);
  assert.match(base, /html\.scroll-lock/);
  assert.match(base, /html\.theme-anim/);
  assert.match(base, /\.sr-only/);
});

test('nav: language trigger is an icon; active dropdown option is boxed', async () => {
  assert.match(html, /id="nav-lang-btn"[^>]*>\s*<svg[^>]*><use href="#i-lang"\/><\/svg>/);
  assert.doesNotMatch(html, /id="nav-lang-btn"[^>]*>[^<]*[A-Za-z\u4e00-\u9fff]/, 'trigger must not show a language name');
  const main = await css('../../css/main.css');
  assert.match(main, /\.theme-menu button\.active \{[^}]*box-shadow/);
});

test('agents: reservation lines are wired to the echo grid', () => {
  assert.match(html, /<span class="agents-res" data-port="8081">/);
  assert.match(html, /<span class="agents-res" data-port="8082">/);
  assert.match(html, /class="ecell c fresh" data-port="8081"/);
  assert.match(html, /class="ecell c fresh" data-port="8082"/);
});

test('system theme default derives from the same media query in boot.js and themes.js', async () => {
  const boot = await readFile(new URL('../../js/boot.js', import.meta.url), 'utf8');
  const themes = await readFile(new URL('../../js/themes.js', import.meta.url), 'utf8');
  const guard = /\(prefers-color-scheme: light\)/;
  assert.match(boot, guard, 'boot.js pre-paint guard missing');
  assert.match(themes, guard, 'themes.js init default missing');
});
