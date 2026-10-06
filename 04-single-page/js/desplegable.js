// desplegable.js — bloc "llegir més / tancar" amb transició suau d'altura.
// Rep un array de paràgrafs ja en l'idioma actiu i els textos i18n del
// botó. El cos arrenca tancat.

export function createDesplegable(parrafos, txtMas, txtMenos) {
  const root = document.createElement('div');
  root.className = 'desplegable';
  root.dataset.state = 'closed';

  const body = document.createElement('div');
  body.className = 'desplegable__body';
  for (const p of parrafos) {
    const el = document.createElement('p');
    el.textContent = p;
    body.appendChild(el);
  }

  const toggle = document.createElement('button');
  toggle.className = 'desplegable__toggle';
  toggle.textContent = txtMas;

  toggle.addEventListener('click', () => {
    const isOpen = root.dataset.state === 'open';
    if (isOpen) {
      body.style.maxHeight = body.scrollHeight + 'px';
      requestAnimationFrame(() => { body.style.maxHeight = '0px'; });
      root.dataset.state = 'closed';
      toggle.textContent = txtMas;
    } else {
      body.style.maxHeight = body.scrollHeight + 'px';
      root.dataset.state = 'open';
      toggle.textContent = txtMenos;
      body.addEventListener('transitionend', function once() {
        if (root.dataset.state === 'open') body.style.maxHeight = 'none';
        body.removeEventListener('transitionend', once);
      });
    }
  });

  root.appendChild(toggle);
  root.appendChild(body);
  return root;
}
