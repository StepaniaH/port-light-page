import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dict, t, DEMO_KEYS } from '../i18n.js';

test('en and zh-CN dictionaries have identical key sets', () => {
  const en = Object.keys(dict.en).sort();
  const zh = Object.keys(dict['zh-CN']).sort();
  assert.deepEqual(en, zh);
});

test('every key used by the page exists in both dictionaries', async () => {
  const { readFile } = await import('node:fs/promises');
  const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
  const used = new Set();
  for (const m of html.matchAll(/data-i18n(?:-attr)?="[^"]*?([a-z0-9.]+)"/g)) used.add(m[1]);
  for (const key of DEMO_KEYS) used.add(key);
  const missing = [...used].filter((k) => !(k in dict.en) || !(k in dict['zh-CN']));
  assert.deepEqual(missing, [], `missing keys: ${missing.join(', ')}`);
});

test('t() interpolates {params}', () => {
  assert.equal(t('demo.toast.listener', { name: 'jellyfin', port: 8096 }, 'en'),
    'jellyfin is now listening on 8096');
  assert.equal(t('demo.toast.listener', { name: 'jellyfin', port: 8096 }, 'zh-CN'),
    'jellyfin 开始监听 8096');
});

test('t() falls back to en for unknown locales, undefined for unknown keys', () => {
  assert.equal(t('nav.how', {}, 'fr'), 'How it works');
  assert.equal(t('no.such.key', {}, 'en'), undefined);
});
