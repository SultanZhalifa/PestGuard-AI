import { describe, it, expect } from 'vitest';
import { en } from './en';
import { id } from './id';

/** Flatten nested translation objects into dot-path keys. */
function flatKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' && !Array.isArray(v)
      ? flatKeys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );
}

describe('i18n — EN/ID parity', () => {
  const enKeys = flatKeys(en);
  const idKeys = flatKeys(id);

  it('every English key has an Indonesian translation', () => {
    const idSet = new Set(idKeys);
    const missing = enKeys.filter((k) => !idSet.has(k));
    expect(missing).toEqual([]);
  });

  it('every Indonesian key has an English counterpart', () => {
    const enSet = new Set(enKeys);
    const missing = idKeys.filter((k) => !enSet.has(k));
    expect(missing).toEqual([]);
  });

  it('no translation value is empty', () => {
    const empty = (keys, dict, lang) =>
      keys.filter((k) => {
        const val = k.split('.').reduce((o, part) => o?.[part], dict);
        return typeof val === 'string' && val.trim() === '';
      }).map((k) => `${lang}:${k}`);
    expect([...empty(enKeys, en, 'en'), ...empty(idKeys, id, 'id')]).toEqual([]);
  });
});
