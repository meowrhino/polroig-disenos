// home.js — única vista de polroig4. Renderitza:
//   1) Capçalera (switch idioma + braille)
//   2) Llista vertical de projectes (links que fan scroll a la secció)
//   3) Totes les seccions de projecte renderitzades en seqüència, cada
//      una amb una eyebrow (nom del projecte) i els seus grups
//      (slideshow, títol, text, desplegable), seguint la mateixa lògica
//      que data.json descriu.

import { getData, pickLang, imgPath, t, setFavicon } from './data.js';
import { createHeader } from './header.js';
import { createSlideshow } from './slideshow.js';
import { createDesplegable } from './desplegable.js';

// Observer que actualitza el favicon segons quin projecte està en
// pantalla. Cada rerender (canvi d'idioma) crea un nou observer; el
// previ es desconnecta per no tenir referències a DOM antic.
let _favObserver = null;

export function renderHome({ root, lang, onChangeLang, onScrollTo }) {
  const data = getData();
  const projects = data.proyectos;

  root.innerHTML = '';
  const home = document.createElement('div');
  home.className = 'home';

  // 1) Capçalera
  home.appendChild(createHeader({ lang, onChangeLang }));

  // 2) Llista vertical + 3) seccions
  const main = document.createElement('main');
  main.className = 'home__main';

  // ---- Llista vertical de projectes ----
  const nav = document.createElement('nav');
  nav.className = 'proyectos-nav';
  nav.setAttribute('aria-label', 'projectes');

  const navList = document.createElement('ul');
  navList.className = 'proyectos-nav__list';

  projects.forEach((p) => {
    const li = document.createElement('li');

    const a = document.createElement('a');
    a.className = 'proyectos-nav__link';
    a.href = `#/${p.slug}/${lang}`;
    a.textContent = pickLang(p.nombre, lang);
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      onScrollTo(p.slug);
    });

    li.appendChild(a);
    navList.appendChild(li);
  });

  nav.appendChild(navList);
  main.appendChild(nav);

  // ---- Seccions de projecte ----
  // Cada projecte arrenca amb una "eyebrow" amb el seu nom (muted, petit):
  // serveix de marcador visual de canvi de projecte i és especialment útil
  // en projectes amb múltiples grups (escenografies → 5 grups), on els
  // títols dels grups no coincideixen amb el nom del projecte.
  for (const p of projects) {
    const section = document.createElement('section');
    section.className = 'proyecto';
    section.id = `proyecto-${p.slug}`;

    const eyebrow = document.createElement('p');
    eyebrow.className = 'proyecto__eyebrow';
    eyebrow.textContent = pickLang(p.nombre, lang);
    section.appendChild(eyebrow);

    for (const grupo of (p.grupos || [])) {
      const groupEl = renderGrupo(grupo, p.slug, lang);
      if (groupEl) section.appendChild(groupEl);
    }

    main.appendChild(section);
  }

  home.appendChild(main);
  root.appendChild(home);

  // ---- Favicon dinàmic ----
  // Inicial: primer projecte. Després, observem cada secció i canviem
  // el favicon quan una entra a la "zona activa" (terç central del
  // viewport). Així el tab reflecteix el projecte que l'usuari està
  // mirant a mesura que fa scroll.
  setFavicon(projects[0].slug);
  if (_favObserver) _favObserver.disconnect();
  _favObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const slug = entry.target.id.replace(/^proyecto-/, '');
        if (slug) setFavicon(slug);
      }
    }
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  for (const p of projects) {
    const el = document.getElementById(`proyecto-${p.slug}`);
    if (el) _favObserver.observe(el);
  }
}

function renderGrupo(grupo, slug, lang) {
  const hasSlideshow   = Array.isArray(grupo.slideshow) && grupo.slideshow.length > 0;
  const hasTitulo      = !!grupo.titulo;
  const hasTexto       = Array.isArray(grupo.texto) && grupo.texto.length > 0;
  const hasDesplegable = Array.isArray(grupo.texto_desplegable) && grupo.texto_desplegable.length > 0;
  if (!hasSlideshow && !hasTitulo && !hasTexto && !hasDesplegable) return null;

  const section = document.createElement('section');
  section.className = 'grupo';

  if (hasSlideshow) {
    const urls = grupo.slideshow.map(name => imgPath(slug, name));
    section.appendChild(createSlideshow(urls));
  }

  if (hasTitulo) {
    const h2 = document.createElement('h2');
    h2.className = 'grupo__titulo';
    h2.textContent = pickLang(grupo.titulo, lang);
    section.appendChild(h2);
  }

  if (hasTexto) {
    for (const para of grupo.texto) {
      const p = document.createElement('p');
      p.className = 'grupo__parrafo';
      p.textContent = pickLang(para, lang);
      section.appendChild(p);
    }
  }

  if (hasDesplegable) {
    const parrafos = grupo.texto_desplegable.map(p => pickLang(p, lang));
    const txtMas   = t('leer_mas',   lang) || 'llegir més';
    const txtMenos = t('leer_menos', lang) || 'tancar';
    section.appendChild(createDesplegable(parrafos, txtMas, txtMenos));
  }

  return section;
}
