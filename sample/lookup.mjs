// Standalone showcase code. No production Bizkonic data or implementation.
const languages = new Set(['en', 'fr', 'fa']);
const identifier = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

function normalize(value, field) {
  if (typeof value !== 'string') throw new TypeError(`${field} must be a string`);
  const normalized = value.trim().toUpperCase();
  if (normalized.length > 64 || !identifier.test(normalized)) {
    throw new TypeError(`${field} must be a nonempty ASCII identifier, up to 64 characters`);
  }
  return normalized;
}

function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${field} must be a nonempty string`);
  }
  return value;
}

/** Build a snapshot index. Multiple references for a model/code stay ambiguous. */
export function createLookup(records) {
  if (!Array.isArray(records)) throw new TypeError('records must be an array');
  const index = new Map();
  const ids = new Set();
  for (const record of records) {
    if (!record || typeof record !== 'object') throw new TypeError('Invalid record');
    const id = requireText(record.id, 'id');
    if (ids.has(id)) throw new TypeError(`Duplicate record id: ${id}`);
    ids.add(id);
    const model = normalize(record.model, 'model');
    const code = normalize(record.code, 'code');
    const source = requireText(record.source, 'source');
    if (!record.translations || typeof record.translations !== 'object' ||
        !Object.hasOwn(record.translations, 'en')) {
      throw new TypeError('An English fallback translation is required');
    }
    const translations = {};
    for (const [language, text] of Object.entries(record.translations)) {
      if (!languages.has(language)) throw new TypeError(`Unsupported translation: ${language}`);
      if (!text || typeof text !== 'object') throw new TypeError('Invalid translation');
      translations[language] = {
        title: requireText(text.title, 'title'),
        explanation: requireText(text.explanation, 'explanation')
      };
    }
    const key = `${model}:${code}`;
    const matches = index.get(key) ?? [];
    matches.push({ id, model, code, source, translations });
    index.set(key, matches);
  }

  return function lookup(query) {
    if (!query || typeof query !== 'object') throw new TypeError('A query is required');
    const model = normalize(query.model, 'model');
    const code = normalize(query.code, 'code');
    const language = query.language ?? 'en';
    if (!languages.has(language)) throw new TypeError('language must be en, fr or fa');
    const matches = index.get(`${model}:${code}`) ?? [];
    const context = { model, code, requestedLanguage: language };
    if (!matches.length) return { status: 'not_found', ...context };
    if (matches.length > 1) {
      return {
        status: 'ambiguous', ...context,
        candidates: matches.map(({ id, source }) => ({ id, source }))
      };
    }
    const record = matches[0];
    const languageUsed = Object.hasOwn(record.translations, language) ? language : 'en';
    return {
      status: 'found', ...context, languageUsed,
      fallback: languageUsed !== language,
      reference: {
        id: record.id, source: record.source,
        ...record.translations[languageUsed]
      }
    };
  };
}
