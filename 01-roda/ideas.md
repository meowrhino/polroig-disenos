# Ideas UX/UI · polroig

Propuestas alineadas con la línea rotary-phone / minimalista del proyecto.
Marcar con [x] cuando se implemente.

## Fixes aplicados en esta sesión

- [x] **Mirilla clickable**: tap en la mirilla central abre el proyecto
  activo (detectado en `pointerup` vía `elementFromPoint`).
- [x] **Title sincronizado**: `document.title` se actualiza al entrar en
  `route()` (antes podía quedar desfasado entre navegaciones).
- [x] **Flecha en "veure el projecte sencer"** con animación al hover.
- [x] **Landscape móvil**: `--wheel-size` ahora también limitada por
  `62dvh` para que no se salga en pantallas cortas.

## Transiciones

- [x] **Morph de la mirilla** entre home (centro de la ruleta) y proyecto (header).
  View Transitions API con `view-transition-name: mirilla` en ambos elementos.
- [x] **Cross-fade** del resto del contenido entre vistas (420ms, mismo easing
  que la ruleta).
- [x] **Respeto a `prefers-reduced-motion`** (duración 1ms cuando está activo).
- [x] **Stagger-in de la página de proyecto**: título → subtítulo → mirilla →
  texto → créditos → galería aparecen escalonados (~120ms entre elementos)
  tras la transición. Da sensación de "lectura que se compone".
- [x] **Scroll-reveal de la galería**: cada imagen entra con `opacity 0→1` y
  `translateY 16px→0` cuando aparece en el viewport (IntersectionObserver).
- [ ] **Fade suave al cambiar de idioma**: los nodos con `data-i18n` y los
  textos dependientes (sinopsis, bio, etc.) hacen un fade out/in al
  intercambiarse, en vez del swap abrupto.

## Interacción con la ruleta

- [ ] **Dial-tick**: mini flash blanco o un pulso de `box-shadow` en la
  mirilla cuando la ruleta encaja en un slot (remite al clic del dial
  rotativo antiguo).
- [x] **Bounce de snap**: el `transition` final con un pequeño overshoot
  (cubic-bezier `(0.34, 1.22, 0.64, 1)`) para sensación más táctil.
- [ ] **Idle drift**: rotación ambiental muy sutil (±1-2°) cuando nadie toca
  la ruleta durante >8s. Pausa en cuanto hay interacción. Como un dial que
  "respira".
- [ ] **Hover peek**: al pasar por encima de un `.wheel__item`, ese nombre
  crece 2-3% y sube opacidad (solo desktop).
- [ ] **Color-wash al seleccionar**: flash mínimo en el `color_rueda` del
  item cuando se activa (hoy todos son blancos menos bio, así que notaría
  solo en bio — o añadir colores por proyecto).

## Rendimiento / Contenido

- [ ] **Preload de mirillas vecinas**: al activarse un item, precargar las
  mirillas de los slots vecinos (índice ±1) para que el swap sea instantáneo
  al arrastrar la ruleta.
- [ ] **Manifest de galería en data.json**: en vez de probar URLs 1-a-1 con
  HEAD requests, listar las imágenes por proyecto. Menos round-trips y más
  predecible.

## Navegación

- [ ] **Botones prev/next en la página de proyecto** (en desktop, discretos
  en los laterales; en móvil, al final del contenido).
- [ ] **Memoria de scroll**: al volver de proyecto → home, la ruleta queda
  donde estaba (ya funciona gracias a `wheelApi`), pero podría añadirse un
  sutil highlight del item activo los primeros 800ms para reorientar al
  usuario.
- [ ] **Share link**: botón discreto que copia la URL del proyecto al
  clipboard (útil sobre todo en móvil). Icono simple, sin texto.

## Accesibilidad

- [x] **Focus-visible** en `.wheel__item`, `.view-project`, `.lang__toggle`,
  `.logo` — anillo rojo global (2px, offset 3px) solo para teclado.
- [ ] **`aria-live="polite"`** en `.synopsis` / `.bio-frag` para que el
  lector de pantalla anuncie el cambio al girar la ruleta.
- [ ] **Skip link** "ir al contenido" al principio del `<body>` (visible al
  recibir foco) para saltarse la ruleta con teclado.

## Responsive

- [ ] **Tablet intermedio** (600-899px): hoy salta de móvil a desktop en
  900px sin escala intermedia. En tablet la ruleta podría ser ~50vmin y
  mantener layout móvil (textos debajo).
- [ ] **Landscape móvil** (alto < 500px): la ruleta fija en 50dvh puede
  quedarse muy pequeña o superponer el header. Considerar un layout
  horizontal donde la ruleta va a la izquierda y el texto a la derecha.
- [ ] **Pantallas ultra-anchas** (> 1600px): la ruleta a `min(60vmin, 620px)`
  queda pequeña. Elevar a `min(60vmin, 720px)` o similar.

## Micro-detalles

- [x] **Cursor**: en `.wheel-stage` `cursor: grab` en reposo y
  `grabbing` durante el arrastre (vía `:has(.wheel.is-dragging)`).
- [ ] **Touch feedback**: mini scale-down (98%) en el `.wheel__item` al
  tocar (antes de que se complete el giro).
- [ ] **Loading state de la mirilla**: placeholder con un shimmer sutil
  mientras la imagen carga (actualmente pasa `is-swapping` que hace fade
  pero no cubre la primera carga).
- [ ] **Favicon animado**: ya se actualiza al activar cada item (✔), pero
  al cargar mostrar un default primero para evitar el parpadeo.
