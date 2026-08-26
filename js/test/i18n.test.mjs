import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { DICTS, LANGS, t, DEMO_KEYS } from '../i18n.js';

const LOCALE_DIR = new URL('../locales/', import.meta.url);

async function loadLocales() {
  const files = (await readdir(LOCALE_DIR)).filter((f) => f.endsWith('.js')).sort();
  const out = {};
  for (const f of files) {
    const code = f.replace(/\.js$/, '');
    out[code] = (await import(new URL(f, LOCALE_DIR))).default;
  }
  return out;
}

test('every locale file is registered in LANGS and DICTS, and vice versa', async () => {
  const locales = await loadLocales();
  const fileCodes = Object.keys(locales).sort();
  const metaCodes = LANGS.map((l) => l.code).sort();
  const dictCodes = Object.keys(DICTS).sort();
  assert.deepEqual(metaCodes, fileCodes, 'LANGS out of sync with js/locales/');
  assert.deepEqual(dictCodes, fileCodes, 'DICTS out of sync with js/locales/');
  for (const l of LANGS) {
    assert.equal(typeof l.endonym, 'string', `LANGS entry ${l.code} lacks an endonym`);
    assert.notEqual(l.endonym.trim(), '', `LANGS entry ${l.code} has an empty endonym`);
  }
});

test('all locales have identical key sets (en is canonical)', async () => {
  const locales = await loadLocales();
  const en = Object.keys(locales.en).sort();
  assert.equal(en.length > 40, true, 'suspiciously few keys');
  for (const [code, strings] of Object.entries(locales)) {
    assert.deepEqual(Object.keys(strings).sort(), en, `${code} diverges`);
    for (const [k, v] of Object.entries(strings)) {
      assert.equal(typeof v, 'string', `${code}:${k} not a string`);
      assert.notEqual(v.trim(), '', `${code}:${k} is empty`);
    }
  }
});

test('every {param} placeholder matches the en original', async () => {
  const locales = await loadLocales();
  const params = (s) => [...String(s).matchAll(/\{([a-z]+)\}/g)].map((m) => m[1]).sort().join(',');
  for (const [code, strings] of Object.entries(locales)) {
    if (code === 'en') continue;
    for (const [k, enV] of Object.entries(locales.en)) {
      assert.equal(params(strings[k]), params(enV), `${code}:${k} placeholders differ`);
    }
  }
});

test('every key used by the page exists in all dictionaries', async () => {
  const { readFile } = await import('node:fs/promises');
  const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
  const used = new Set();
  for (const m of html.matchAll(/data-i18n(?:-attr|-html)?="([^"]+)"/g)) {
    for (const pair of m[1].split(';')) {
      used.add(pair.includes(':') ? pair.slice(pair.indexOf(':') + 1) : pair);
    }
  }
  for (const key of DEMO_KEYS) used.add(key);
  for (const [code, strings] of Object.entries(await loadLocales())) {
    const missing = [...used].filter((k) => !(k in strings));
    assert.deepEqual(missing, [], `${code} missing: ${missing.join(', ')}`);
  }
});

test('inline head script language list matches LANGS', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../boot.js', import.meta.url), 'utf8');
  const m = src.match(/var langs = \[([^\]]*)\]/);
  assert.ok(m, 'inline langs list missing from js/boot.js');
  const inline = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]).sort();
  assert.deepEqual(inline, LANGS.map((l) => l.code).sort());
});

test('every t() key referenced in JS modules exists in en', async () => {
  const { readdir, readFile } = await import('node:fs/promises');
  const jsDir = new URL('../', import.meta.url);
  const files = (await readdir(jsDir)).filter((f) => f.endsWith('.js'));
  const en = (await loadLocales()).en;
  const used = new Set();
  for (const f of files) {
    const src = await readFile(new URL(f, jsDir), 'utf8');
    for (const m of src.matchAll(/\bt\('([a-z0-9.-]+)'/g)) used.add(m[1]);
  }
  const missing = [...used].filter((k) => !(k in en));
  assert.deepEqual(missing, [], `JS references missing keys: ${missing.join(', ')}`);
});

test('every theme id has a theme.* label in all locales', async () => {
  const { THEMES } = await import('../themes.js');
  for (const [code, strings] of Object.entries(await loadLocales())) {
    for (const id of THEMES) {
      const v = strings[`theme.${id}`];
      assert.equal(typeof v, 'string', `${code} missing theme.${id}`);
      assert.notEqual(v.trim(), '', `${code}:theme.${id} is empty`);
    }
  }
});

test('t() interpolates {params} in every locale', () => {
  for (const lang of Object.keys(DICTS)) {
    assert.match(t('demo.toast.copied', { port: 8096 }, lang), /8096/);
  }
});

test('t() falls back to en for unknown locales, undefined for unknown keys', () => {
  assert.equal(t('nav.how', {}, 'xx'), 'How it works');
  assert.equal(t('no.such.key', {}, 'en'), undefined);
});
