import test from 'node:test';
import assert from 'node:assert/strict';
import { createLookup } from '../sample/lookup.mjs';
import { demoRecords } from '../sample/demo-data.mjs';

const lookup = createLookup(demoRecords);
const query = { model: 'DEMO-A', code: 'DEMO-001' };

test('finds model A with source and English default', () => {
  const result = lookup(query);
  assert.equal(result.status, 'found');
  assert.equal(result.reference.id, 'example-a-1');
  assert.match(result.reference.source, /Fictional reference A/);
  assert.equal(result.languageUsed, 'en');
  assert.equal(result.fallback, false);
});
for (const language of ['fr', 'fa']) {
  test(`returns the exact ${language} translation`, () => {
    const result = lookup({ ...query, language });
    assert.equal(result.reference.title, demoRecords[0].translations[language].title);
    assert.equal(result.languageUsed, language);
    assert.equal(result.fallback, false);
  });
}
test('same code on another model returns its own reference', () => {
  assert.equal(lookup({ ...query, model: 'DEMO-B' }).reference.id, 'example-b-1');
});
test('missing translation is an explicit English fallback', () => {
  const result = lookup({ ...query, model: 'DEMO-B', language: 'fa' });
  assert.equal(result.requestedLanguage, 'fa');
  assert.equal(result.languageUsed, 'en');
  assert.equal(result.fallback, true);
});
test('normalizes surrounding whitespace and ASCII case', () => {
  assert.deepEqual(lookup({ model: ' demo-a ', code: 'demo-001 ' }), lookup(query));
});
test('does not borrow references from a similar or unknown model', () => {
  assert.equal(lookup({ ...query, model: 'DEMO-AB' }).status, 'not_found');
});
test('an unknown code has no fabricated reference', () => {
  const result = lookup({ ...query, code: 'DEMO-999' });
  assert.equal(result.status, 'not_found');
  assert.equal(Object.hasOwn(result, 'reference'), false);
});
test('empty dataset returns not_found', () => {
  assert.equal(createLookup([])(query).status, 'not_found');
});
test('duplicate applicability stays ambiguous, without an explanation', () => {
  const other = { ...demoRecords[0], id: 'revision-2', source: 'Fictional reference A, revision 2' };
  const result = createLookup([...demoRecords, other])(query);
  assert.equal(result.status, 'ambiguous');
  assert.deepEqual(result.candidates.map(x => x.id), ['example-a-1', 'revision-2']);
  assert.equal(Object.hasOwn(result, 'reference'), false);
});
test('input data is snapshotted', () => {
  const records = structuredClone(demoRecords);
  const isolated = createLookup(records);
  records[0].translations.en.title = 'changed';
  records[0].model = 'OTHER';
  assert.equal(isolated(query).reference.title, demoRecords[0].translations.en.title);
});
test('result objects cannot mutate future lookup results', () => {
  const result = lookup(query);
  result.reference.title = 'changed';
  assert.equal(lookup(query).reference.title, demoRecords[0].translations.en.title);
});
test('ambiguity candidate results cannot mutate the index', () => {
  const ambiguous = createLookup([...demoRecords, { ...demoRecords[0], id: 'second' }]);
  ambiguous(query).candidates[0].source = 'changed';
  assert.equal(ambiguous(query).candidates[0].source, demoRecords[0].source);
});
for (const [label, patch] of [
  ['blank model', { model: ' ' }],
  ['numeric code', { code: 1 }],
  ['embedded spaces', { model: 'DEMO A' }],
  ['Unicode lookalike', { model: 'DEMО-A' }],
  ['oversized code', { code: 'A'.repeat(65) }],
  ['unsupported language', { language: 'de' }]
]) test(`rejects ${label}`, () => assert.throws(() => lookup({ ...query, ...patch }), TypeError));

test('rejects missing query and missing identifiers', () => {
  for (const value of [null, undefined, {}, { model: 'DEMO-A' }]) {
    assert.throws(() => lookup(value), TypeError);
  }
});
test('rejects non-array or malformed datasets', () => {
  for (const value of [null, {}, [null], [{}]]) assert.throws(() => createLookup(value), TypeError);
});
test('rejects duplicated record IDs', () => {
  assert.throws(() => createLookup([demoRecords[0], demoRecords[0]]), /Duplicate record id/);
});
test('rejects missing source, English fallback or translation content', () => {
  for (const patch of [
    { source: '' },
    { translations: { fr: demoRecords[0].translations.fr } },
    { translations: { en: { title: '', explanation: 'Example' } } },
    { translations: { en: demoRecords[0].translations.en, de: {} } }
  ]) assert.throws(() => createLookup([{ ...demoRecords[0], ...patch }]), TypeError);
});
