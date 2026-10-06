/**
 * Home view — the rotary-dial project selector.
 */

import { createWheel } from "./wheel.js";
import { applyTranslations, projectHash, homeHash, pickLang, getLang } from "./i18n.js";
import { updateLangLinks } from "./lang-menu.js";

function carpetaOf(p) {
  return p.carpeta || p.slug;
}

/**
 * Mirilla cross-fade duration. Read from the CSS custom property so JS and CSS
 * stay in sync — change `--mirilla-fade` in style.css and the swap timing
 * follows automatically.
 */
function mirillaFadeMs() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--mirilla-fade").trim();
  if (v.endsWith("ms")) return parseFloat(v);
  if (v.endsWith("s"))  return parseFloat(v) * 1000;
  return 350; // sensible default if the var is missing
}

/**
 * @param {object} data            full data.json
 * @param {object} opts
 * @param {string|null} opts.slug         current slug in the URL (or null)
 * @param {string} opts.lang              current lang
 * @param {string|null} [opts.defaultSlug]  slug used when the URL omits one
 * @param {object|null} opts.wheelApi     previously-built wheel (kept between
 *                                        renders so rotation state is preserved)
 */
export function renderHome(data, { slug, lang, defaultSlug = null, wheelApi }) {
  applyTranslations();

  const sorted = [...data.ruleta].sort((a, b) => a.numero_ruleta - b.numero_ruleta);
  const items = sorted.map(r => {
    const p = data.proyectos.find(x => x.slug === r.slug);
    return {
      slug: r.slug,
      label: pickLang(p.nombre, lang),
      color: r.color_rueda,
      mirilla: `data/${carpetaOf(p)}/mirilla.webp`,
      sinopsis: pickLang(p.sinopsis, lang),
      bio_fragmento: pickLang(p.bio_fragmento, lang),
      data: p
    };
  });

  let initialIndex = items.findIndex(i => i.slug === slug);
  if (initialIndex < 0) initialIndex = 0;

  const wheelEl     = document.getElementById("wheel");
  const stageEl     = document.querySelector("#view-home .wheel-stage");
  const mirillaBtn  = document.querySelector("#view-home .mirilla");
  const mirillaImg  = document.querySelector("#view-home .mirilla__img");
  const synopsisEl  = document.querySelector("#view-home .synopsis");
  const bioFragEl   = document.querySelector("#view-home .bio-frag");
  const viewLink    = document.querySelector("#view-home .view-project");
  const favicon     = document.getElementById("favicon");

  function render(i, { live } = {}) {
    const p = items[i];
    if (!p) return;

    // mirillaImg.src returns the absolute URL, so we compare the attribute
    // (which keeps the original relative form we wrote)
    if (mirillaImg.getAttribute("src") !== p.mirilla) {
      if (live) {
        mirillaImg.src = p.mirilla;
      } else {
        const halfFade = mirillaFadeMs() / 2;
        mirillaImg.classList.add("is-swapping");
        setTimeout(() => {
          mirillaImg.src = p.mirilla;
          requestAnimationFrame(() => mirillaImg.classList.remove("is-swapping"));
        }, halfFade);
      }
    }

    if (mirillaBtn) mirillaBtn.setAttribute("aria-label", `${p.label} — veure el projecte`);
    synopsisEl.textContent = p.sinopsis;
    bioFragEl.textContent  = p.bio_fragmento;
    viewLink.href = projectHash(lang, p.slug);
    if (favicon) favicon.href = p.mirilla;

    if (!live) {
      const target = homeHash(lang, p.slug, { defaultSlug });
      if (location.hash !== target) {
        // update hash without re-routing
        history.replaceState(null, "", target);
      }
      // keep the language menu pointing at the currently-visible slug, so
      // switching language from a rotated wheel stays on the same project
      updateLangLinks({ view: "home", slug: p.slug, lang }, { defaultSlug });
    }

    document.title = `${p.label} · pol roig`;
  }

  function openActive(_i, item) {
    if (!item) return;
    location.hash = projectHash(lang, item.slug);
  }

  // first time: build the wheel. Later renders: reuse it so drag state persists.
  if (!wheelApi) {
    wheelApi = createWheel({
      container: wheelEl,
      stage: stageEl,
      items,
      initialIndex,
      onChange: render,
      onMirillaTap: openActive
    });
    // Keyboard activation of the mirilla button (Enter/Space). Reads the
    // active slug from the DOM so it stays correct across language changes.
    // Pointer taps are already handled by the wheel's onMirillaTap path; if
    // the browser also fires a click after that tap, the second hash assign
    // is a no-op (same target).
    mirillaBtn?.addEventListener("click", () => {
      const active = wheelEl.querySelector('.wheel__item[data-active="true"]');
      const slug = active?.dataset.slug;
      if (slug) location.hash = projectHash(getLang(), slug);
    });
  } else {
    wheelApi.updateItems?.(items);
    wheelApi.setOnChange?.(render);
    wheelApi.setMirillaTap?.(openActive);
    wheelApi.setIndex(initialIndex);
  }

  render(initialIndex);
  return wheelApi;
}
