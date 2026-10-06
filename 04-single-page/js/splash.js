// splash.js — overlay de benvinguda. Cada vegada que arribes a la home
// sense un slug a la URL, es mostra una mirilla random centrada sobre un
// fons negre. Click → fade out i revela la pàgina ja muntada al darrere.
//
// Convenció: les mirilles viuen a data/<slug>/mirilla.webp (heretat de
// polroig3, copiat al moment de bootstrap).

import { getData, mirillaPath } from './data.js';

const FADE_OUT = 600; // ha de coincidir amb la transition de .splash a CSS

export function showSplash({ onEnter }) {
  const projects = getData().proyectos;
  const project = projects[Math.floor(Math.random() * projects.length)];

  const splash = document.createElement('div');
  splash.className = 'splash';

  const mirilla = document.createElement('button');
  mirilla.type = 'button';
  mirilla.className = 'splash__mirilla';
  mirilla.style.backgroundImage = `url(${mirillaPath(project.slug)})`;
  mirilla.setAttribute('aria-label', `entra al portfoli`);

  splash.appendChild(mirilla);
  document.body.appendChild(splash);
  document.body.classList.add('has-splash');

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    splash.classList.add('is-leaving');
    setTimeout(() => {
      splash.remove();
      document.body.classList.remove('has-splash');
      if (typeof onEnter === 'function') onEnter(project.slug);
    }, FADE_OUT);
  }

  mirilla.addEventListener('click', dismiss);
  // Click al fons (fora de la mirilla) també tanca
  splash.addEventListener('click', (ev) => {
    if (ev.target === splash) dismiss();
  });
  // Esc com a alternativa accessible
  splash.tabIndex = -1;
  document.addEventListener('keydown', function onKey(ev) {
    if (ev.key === 'Escape' || ev.key === 'Enter') {
      dismiss();
      document.removeEventListener('keydown', onKey);
    }
  });

  // Auto-focus a la mirilla per accessibilitat (Enter dispara el click)
  requestAnimationFrame(() => mirilla.focus());
}
