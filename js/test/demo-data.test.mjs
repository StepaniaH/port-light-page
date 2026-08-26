import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PORTS } from '../demo-grid.js';

test('demo data: unique ports, valid statuses, enough cards', () => {
  assert.ok(PORTS.length >= 40, `expected >=40 cards, got ${PORTS.length}`);
  const ports = PORTS.map((p) => p.port);
  assert.equal(new Set(ports).size, ports.length, 'ports must be unique');
  for (const p of PORTS) {
    assert.ok(Number.isInteger(p.port) && p.port > 0 && p.port < 65536, `bad port ${p.port}`);
    assert.ok(['used', 'configured'].includes(p.status), `bad status ${p.status}`);
    assert.equal(typeof p.name, 'string');
    assert.ok(p.name.length > 0, 'name required');
  }
  assert.ok(PORTS.some((p) => p.status === 'configured'), 'need amber cards for the story loop');
});

const CELL = /<span class="cell (used|configured)" data-port="(\d+)"><span class="num">\d+<\/span><span class="lbl">([^<]*)<\/span><\/span>/g;

test('no-JS fallback: baked demo grid mirrors PORTS exactly', async () => {
  const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
  const block = html.match(/<div id="demo-grid"[^>]*>([\s\S]*?)<\/div>/);
  assert.ok(block, '#demo-grid block missing from index.html');
  const cells = [...block[1].matchAll(CELL)];
  assert.equal(cells.length, PORTS.length, `expected ${PORTS.length} baked cells, found ${cells.length}`);
  cells.forEach((m, i) => {
    const p = PORTS[i];
    assert.equal(Number(m[2]), p.port, `cell #${i}: port drift`);
    assert.equal(m[3], p.name, `cell #${i} (${p.port}): name drift`);
    assert.equal(m[1], p.status, `cell #${i} (${p.port}): status drift`);
  });
});

test('no-JS fallback: baked counts line matches PORTS totals', async () => {
  const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
  const m = html.match(/<p id="demo-counts" class="demo-counts">([^<]*)<\/p>/);
  assert.ok(m, '#demo-counts line missing');
  const used = PORTS.filter((p) => p.status === 'used').length;
  const configured = PORTS.filter((p) => p.status === 'configured').length;
  assert.equal(m[1], `${used} in use · ${configured} configured`, 'counts line drifted from PORTS');
});
