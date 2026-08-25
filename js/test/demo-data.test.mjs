import { test } from 'node:test';
import assert from 'node:assert/strict';
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
