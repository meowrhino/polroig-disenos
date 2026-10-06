/**
 * pol roig · SPA entry point
 *
 * Single data source: data/data.json.
 * Hash-based routing. Two views: home (wheel) and proyecto (full page).
 *
 * Routes
 *   #/                          → home, default lang, first ruleta project
 *   #/<lang>                    → home, lang, first ruleta project
 *   #/<slug>                    → home, default lang, slug
 *   #/<slug>/<lang>             → home, lang, slug
 *   #/proyecto/<slug>           → project, default lang
 *   #/proyecto/<slug>/<lang>    → project, lang
 */

import { renderHome } from "./home.js";
import { renderProject } from "./project.js";
import { setLang } from "./i18n.js";
import { initLangMenu, updateLangLinks } from "./lang-menu.js";

const DATA_URL = "data/data.json";

const state = {
  data: null,
  defaultSlug: null,  // first ruleta entry by numero_ruleta — computed once at boot
  currentView: null,
  currentSlug: null,
  currentLang: null,
  wheelApi: null      // kept across renders so the wheel isn't rebuilt
};

async function boot() {
  state.data = await fetch(DATA_URL).then(r => r.json());
  state.defaultSlug = [...state.data.ruleta]
    .sort((a, b) => a.numero_ruleta - b.numero_ruleta)[0]?.slug || null;
  initLangMenu();
  window.addEventListener("hashchange", route);
  route();
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "").replace(/\/$/, "");
  const parts = raw ? raw.split("/").filter(Boolean) : [];
  const langs = state.data.idiomas;
  const slugs = state.data.proyectos.map(p => p.slug);
  const isLang = s => langs.includes(s);
  const isSlug = s => slugs.includes(s);

  // proyecto page
  if (parts[0] === "proyecto" && isSlug(parts[1])) {
    return {
      view: "project",
      slug: parts[1],
      lang: isLang(parts[2]) ? parts[2] : state.data.idioma_defecto
    };
  }

  // home variants — default slug is the first ruleta entry (numero_ruleta: 1)
  if (parts.length === 0) {
    return { view: "home", slug: state.defaultSlug, lang: state.data.idioma_defecto };
  }
  if (parts.length === 1 && isLang(parts[0])) {
    return { view: "home", slug: state.defaultSlug, lang: parts[0] };
  }
  if (parts.length === 1 && isSlug(parts[0])) {
    return { view: "home", slug: parts[0], lang: state.data.idioma_defecto };
  }
  if (parts.length === 2 && isSlug(parts[0]) && isLang(parts[1])) {
    return { view: "home", slug: parts[0], lang: parts[1] };
  }

  // fallback — unknown route, treat as default home
  return { view: "home", slug: state.defaultSlug, lang: state.data.idioma_defecto };
}

function showView(name) {
  document.getElementById("view-home").hidden    = name !== "home";
  document.getElementById("view-project").hidden = name !== "project";
}

function route() {
  const r = parseHash();
  const viewChanged = state.currentView && state.currentView !== r.view;
  state.currentView = r.view;
  state.currentSlug = r.slug;
  state.currentLang = r.lang;

  // Set the page title up-front so it reflects the current route immediately,
  // even if the view transition or render is deferred.
  const proj = state.data.proyectos.find(p => p.slug === r.slug);
  if (proj) {
    const name = typeof proj.nombre === "string"
      ? proj.nombre
      : (proj.nombre[r.lang] || proj.nombre.cat);
    document.title = `${name} · pol roig`;
  }

  const apply = () => {
    setLang(r.lang, state.data);
    document.documentElement.lang = r.lang === "cat" ? "ca" : r.lang;
    showView(r.view);

    if (r.view === "home") {
      state.wheelApi = renderHome(state.data, {
        slug: r.slug,
        lang: r.lang,
        defaultSlug: state.defaultSlug,
        wheelApi: state.wheelApi
      });
    } else {
      state.wheelApi = null;
      renderProject(state.data, { slug: r.slug, lang: r.lang });
    }

    updateLangLinks(r, { defaultSlug: state.defaultSlug });
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // cross-view navigations get a native View Transition so the mirilla morphs
  // from wheel-centre to project-header and the rest cross-fades
  if (viewChanged && document.startViewTransition) {
    document.startViewTransition(apply);
  } else {
    apply();
  }
}

boot();
