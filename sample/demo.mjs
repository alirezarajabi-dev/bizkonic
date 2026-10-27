import { createLookup } from './lookup.mjs';
import { demoRecords } from './demo-data.mjs';

const lookup = createLookup(demoRecords);
for (const query of [
  { model: 'DEMO-A', code: 'DEMO-001', language: 'fr' },
  { model: 'DEMO-A', code: 'DEMO-001', language: 'fa' },
  { model: 'DEMO-B', code: 'DEMO-001', language: 'fa' },
  { model: 'UNKNOWN', code: 'DEMO-001' }
]) console.log(JSON.stringify(lookup(query), null, 2));
