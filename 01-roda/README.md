# pol roig valldosera · portfolio

Minimal portfolio for Pol Roig Valldosera. Mobile-first, with a rotary-dial
project selector inspired by old telephones. Vanilla HTML/CSS/JS · single-page
app with hash routing · zero build step.

## Run locally

Any static server works. Easiest option:

- **VS Code Live Server** — right-click `index.html` → "Open with Live Server".
- **Node** — `node scripts/serve.mjs` serves the root at http://localhost:8080.
- **Python** — `python3 -m http.server 8080`.

## Deploy

Just push to `main`. `.github/workflows/deploy.yml` uploads the repo root to
GitHub Pages — no build. In **Settings → Pages**, set *Source* to *GitHub
Actions*.

Works both at a root domain (`polroigvalldosera.com`) and at a project subpath
(`username.github.io/polroig/`) — all asset URLs are relative.

## Routes

Hash-based. Language falls back to the default (`cat`) when omitted.

| Hash                             | View                               |
| -------------------------------- | ---------------------------------- |
| `#/`                             | home, default lang, first project  |
| `#/<lang>`                       | home, lang (`cat` / `es` / `en`)   |
| `#/<slug>`                       | home with the wheel on `<slug>`    |
| `#/<slug>/<lang>`                | same, in `<lang>`                  |
| `#/proyecto/<slug>`              | full project page                  |
| `#/proyecto/<slug>/<lang>`       | project page in `<lang>`           |

## Adding or editing a project

Everything lives in `data/data.json`. Each project has a `slug` (used in URLs
and i18n) and optionally a `carpeta` (the folder under `data/` that holds its
assets). If `carpeta` is omitted, it defaults to the slug.

To add a project:

1. Drop its images as `data/<carpeta>/img/1.webp`, `2.webp`, `3.webp`…
   (numbered sequentially — discovery stops at the first gap).
2. Generate a mirilla (the fisheye peephole that appears at the centre of the
   wheel): open `tools/mirillaGen.html`, drop the first image, download the
   `.webp`, save it as `data/<carpeta>/mirilla.webp`.
3. In `data/data.json`, add an entry to `proyectos[]`. Required keys:
   - `slug`, `año`
   - `nombre`, `sinopsis`, `texto`, `bio_fragmento`, `ubicacion` — each either
     as `{ cat, es, en }` or as a plain string when the three languages match
   - optional `carpeta` — only when it differs from `slug`
   - optional `creditos[]` — role can also be a string when same in all langs
4. If the project should appear on the wheel, add an entry to `ruleta[]`
   (max 8) with a `numero_ruleta` slot, and an optional `color_rueda` (defaults
   to white).

When the user visits `#/` (no slug), the wheel lands on the `ruleta` entry
with the lowest `numero_ruleta`. Projects not listed in `ruleta` (e.g.
`euroscoria`, `varios`) are still reachable at `#/<slug>/` and
`#/proyecto/<slug>/`.

## Project layout

```
index.html                single SPA entry point
css/style.css             site styles
js/
  app.js                  router, loads data/data.json
  wheel.js                rotary-dial component
  home.js                 home view renderer
  project.js              project page renderer
  i18n.js                 translations + language menu
data/
  data.json               i18n, ruleta, proyectos[]
  <carpeta>/              one folder per project (defaults to slug)
    mirilla.webp          fisheye peephole for the wheel centre
    img/                  numbered project images (1.webp, 2.webp, …)
tools/
  mirillaGen.html         standalone mirilla generator (open in browser)
scripts/
  serve.mjs               optional tiny dev server (Node, zero deps)
```
