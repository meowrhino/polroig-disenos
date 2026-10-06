/**
 * Minimal i18n helpers + hash URL builders.
 * Reads translations from data.json (already loaded in memory).
 *
 * The default language is whatever `setLang` last received from data.json. We
 * keep a module-level copy so URL builders (homeHash, projectHash) can omit it
 * from the hash without every caller having to pass `data.idioma_defecto`.
 */

let currentLang = "cat";
let defaultLang = "cat";
let currentI18n = {};

/**
 * Pick the right localisation for a value. Accepts either:
 *   - a string: returned as-is (same text in every language)
 *   - an object { cat, es, en, … }: the entry for `lang`, falling back to the
 *     project's default language, then to any first available value
 *   - null/undefined: empty string
 */
export function pickLang(val, lang = currentLang) {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (val[lang] != null) return val[lang];
  if (val[defaultLang] != null) return val[defaultLang];
  // last-resort fallback so we never render `undefined`
  for (const k in val) if (val[k] != null) return val[k];
  return "";
}

export function setLang(lang, data) {
  currentLang = lang;
  defaultLang = data.idioma_defecto || defaultLang;
  currentI18n = data.i18n || {};
  applyTranslations();
  const label = document.querySelector(".lang__current");
  if (label) label.textContent = lang;
}

export function getLang() {
  return currentLang;
}

export function t(key) {
  return currentI18n[currentLang]?.[key] ?? currentI18n[defaultLang]?.[key] ?? key;
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(el => {
    const v = t(el.dataset.i18n);
    if (v) el.textContent = v;
  });
}

/* ---------- hash URL helpers ---------- */

/**
 * Build a hash for the home view. Both the language and the slug are omitted
 * when they match the defaults, so the canonical URL stays as short as
 * possible (#/, #/<lang>/, #/<slug>/, or #/<slug>/<lang>/).
 *
 * @param {string} lang
 * @param {string|null} slug
 * @param {object} [opts]
 * @param {string|null} [opts.defaultSlug]  slug to omit when it matches
 */
export function homeHash(lang, slug, { defaultSlug = null } = {}) {
  let h = "#/";
  if (slug && slug !== defaultSlug) h += slug + "/";
  if (lang && lang !== defaultLang) h += lang + "/";
  return h;
}

export function projectHash(lang, slug) {
  let h = "#/proyecto/" + slug + "/";
  if (lang && lang !== defaultLang) h += lang + "/";
  return h;
}
