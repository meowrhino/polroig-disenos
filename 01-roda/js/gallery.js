/**
 * Project gallery loader.
 *
 * Images are auto-discovered: we probe data/<carpeta>/img/<n>.webp for
 * n = 1, 2, 3…, in batches of 10 in parallel, and stop at the first gap.
 * No `imagenes` field needed in data.json.
 *
 * A scroll-reveal IntersectionObserver adds `.is-visible` when each image
 * enters the viewport, so the CSS fade/slide-in animation runs once per image.
 *
 * Cancellation: each load tags the gallery element with a unique token. If
 * `loadGallery` is called again (e.g. user navigates) before the previous run
 * finishes, the old run sees the token has changed and bails.
 */

const BATCH = 10;
const MAX   = 5000; // safety cap so a missing 404 doesn't loop forever

export async function loadGallery(gallery, carpeta, name) {
  gallery.innerHTML = "";
  let start = 1;
  const seen = new Set();

  const token = (gallery.__token = Symbol("gallery"));

  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }
  }, { rootMargin: "0px 0px -10% 0px" });

  while (gallery.__token === token) {
    const probes = [];
    for (let k = 0; k < BATCH; k++) {
      const n = start + k;
      const url = `data/${carpeta}/img/${n}.webp`;
      probes.push(probe(url).then(ok => ({ n, url, ok })));
    }
    const results = await Promise.all(probes);
    if (gallery.__token !== token) { io.disconnect(); return; }

    const firstMiss = results.findIndex(r => !r.ok);
    const keep = firstMiss === -1 ? results : results.slice(0, firstMiss);
    for (const r of keep) {
      if (seen.has(r.n)) continue;
      seen.add(r.n);
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = r.url;
      img.alt = `${name} — ${r.n}`;
      gallery.appendChild(img);
      io.observe(img);
    }
    if (firstMiss !== -1) return;
    start += BATCH;
    if (start > MAX) return;
  }
}

function probe(url) {
  return fetch(url, { method: "HEAD" }).then(r => r.ok).catch(() => false);
}
