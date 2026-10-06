// header.js — capçalera amb el switch d'idioma a l'esquerra i el
// títol braille a la dreta. El switch mostra l'idioma actiu (no el
// "següent"), però en clicar cicla al següent — comportament tipus etiqueta
// clicable.

import { getData } from './data.js';
import { toBrailleHTML } from './braille.js';

export function createHeader({ lang, onChangeLang }) {
  const data = getData();
  const langs = data.config.idiomas;
  const labels = data.i18n[lang]?.idiomas || {};

  // L'idioma "següent" és al que canviarem en clicar. Amb 2 idiomes
  // és un toggle; amb 3+ cicla.
  const idx = langs.indexOf(lang);
  const nextLang = langs[(idx + 1) % langs.length];

  const header = document.createElement('header');
  header.className = 'header';

  // ---- Switch d'idioma (esquerra) ----
  const btn = document.createElement('button');
  btn.className = 'lang__switch';
  btn.type = 'button';
  btn.dataset.lang = lang;
  btn.textContent = labels[lang] || lang;
  btn.setAttribute('aria-label', `idioma actiu: ${labels[lang] || lang}. clica per canviar a ${labels[nextLang] || nextLang}`);
  btn.addEventListener('click', () => onChangeLang(nextLang));
  header.appendChild(btn);

  // ---- Braille (dreta) ----
  const braille = document.createElement('h1');
  braille.className = 'braille';
  braille.setAttribute('aria-label', data.config.titulo_braille);
  braille.innerHTML = toBrailleHTML(data.config.titulo_braille);
  header.appendChild(braille);

  return header;
}
