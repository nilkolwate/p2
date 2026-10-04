const test = require('node:test');
const assert = require('node:assert');
const { sha256, parseQrPayload, toCsv, assertCertificateId, parsePaging } = require('../src/utils/helpers');

test('sha256 is deterministic and correct', () => {
  assert.strictEqual(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('parseQrPayload handles raw id, url, path url and json', () => {
  assert.strictEqual(parseQrPayload('CERT-2026-0001'), 'CERT-2026-0001');
  assert.strictEqual(parseQrPayload('https://x.com/verify?id=CERT-2026-0001'), 'CERT-2026-0001');
  assert.strictEqual(parseQrPayload('https://x.com/verify/CERT-2026-0001'), 'CERT-2026-0001');
  assert.strictEqual(parseQrPayload('{"certificateId":"CERT-2026-0001"}'), 'CERT-2026-0001');
});

test('invalid ids are rejected (injection safe)', () => {
  assert.throws(() => assertCertificateId("x'; DROP TABLE CERTIFICATES;--"));
  assert.throws(() => parseQrPayload(''));
});

test('csv escaping', () => {
  assert.strictEqual(toCsv([{ a: 'x,y', b: 'q"r' }]), 'a,b\n"x,y","q""r"');
});

test('paging is clamped', () => {
  assert.deepStrictEqual(parsePaging({ page: '0', limit: '9999' }), { page: 1, limit: 100, offset: 0 });
});
