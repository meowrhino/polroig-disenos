/**
 * Language menu in the top bar.
 *
 * Two responsibilities:
 *   - open/close behaviour and outside-click dismissal
 *   - keep each link's `data-href` in sync with the current route, so changing
 *     language preserves the view (home or project, with the same slug)
 */

import { getLang, homeHash, projectHash } from "./i18n.js";

export function initLangMenu() {
  const toggle = document.querySelector(".lang__toggle");
  const menu   = document.querySelector(".lang__menu");
  const lang   = document.querySelector(".lang");
  if (!toggle || !menu || !lang) return;

  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    setOpen(menu.hidden);
  });

  // close on outside click (clicks inside .lang are ignored)
  document.addEventListener("click", (e) => {
    if (menu.hidden) return;
    if (lang.contains(e.target)) return;
    setOpen(false);
  });

  // close on Escape when the menu is open
  document.addEventListener("keydown", (e) => {
    if (menu.hidden) return;
    if (e.key === "Escape") {
      setOpen(false);
      toggle.focus();
    }
  });

  // event delegation on the menu — survives any future re-render and doesn't
  // depend on listeners attached at init time
  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-lang]");
    if (!a) return;
    e.preventDefault();
    const h = a.dataset.href;
    if (h) location.hash = h;
    setOpen(false);
  });
}

/**
 * Called after each route change so the lang menu points to the same view in
 * each lang. `defaultSlug` (optional) lets `homeHash` omit it when redundant.
 */
export function updateLangLinks(route, { defaultSlug = null } = {}) {
  const currentLang = getLang();
  const menu = document.querySelector(".lang__menu");
  if (menu) {
    menu.querySelectorAll("a[data-lang]").forEach(a => {
      const lang = a.dataset.lang;
      const hash = route.view === "project"
        ? projectHash(lang, route.slug)
        : homeHash(lang, route.slug, { defaultSlug });
      a.dataset.href = hash;
      a.setAttribute("aria-current", lang === currentLang ? "true" : "false");
    });
  }
  // logo always rotates the wheel to the bio slot (in current lang)
  const logo = document.querySelector(".logo");
  if (logo) logo.href = homeHash(currentLang, "bio", { defaultSlug });
}
