/**
 * Full project page.
 *
 * Renders the static fields from data.json and kicks off the auto-discovered
 * gallery (which fills in progressively without blocking the view).
 */

import { applyTranslations, pickLang } from "./i18n.js";
import { loadGallery } from "./gallery.js";

const carpetaOf = (p) => p.carpeta || p.slug;

export async function renderProject(data, { slug, lang }) {
  const proj = data.proyectos.find(p => p.slug === slug);
  if (!proj) {
    // slug not found — bounce to home
    location.hash = "#/";
    return;
  }

  applyTranslations();

  const root     = document.getElementById("view-project");
  const title    = root.querySelector(".proyecto__title");
  const sub      = root.querySelector(".proyecto__sub");
  const synopsis = root.querySelector(".proyecto__synopsis");
  const text     = root.querySelector(".proyecto__text");
  const credits  = root.querySelector(".proyecto__creditos");
  const gallery  = root.querySelector(".proyecto__gallery");
  const mirilla  = root.querySelector(".proyecto__mirilla .mirilla__img");
  const favicon  = document.getElementById("favicon");

  const name = pickLang(proj.nombre, lang);
  const carpeta = carpetaOf(proj);
  title.textContent = name;
  sub.textContent   = [pickLang(proj.ubicacion, lang), proj.año]
    .filter(Boolean).join(" · ");
  synopsis.textContent = pickLang(proj.sinopsis, lang);
  text.textContent     = pickLang(proj.texto, lang);

  mirilla.src = `data/${carpeta}/mirilla.webp`;
  mirilla.alt = name;
  if (favicon) favicon.href = mirilla.src;

  renderCredits(credits, proj.creditos || [], lang);

  document.title = `${name} · pol roig`;

  // auto-discover and render the gallery (don't await — let it fill in progressively)
  loadGallery(gallery, carpeta, name).catch(err => console.warn("gallery:", err));
}

function renderCredits(container, creditos, lang) {
  container.replaceChildren();
  const frag = document.createDocumentFragment();
  for (const c of creditos) {
    const li   = document.createElement("li");
    const rol  = document.createElement("span");
    const name = document.createElement("span");
    rol.textContent  = pickLang(c.rol, lang);
    name.textContent = c.nombre;
    li.append(rol, " ", name);
    frag.appendChild(li);
  }
  container.appendChild(frag);
}
