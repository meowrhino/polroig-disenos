/**
 * Rotary wheel — 8 positions at 45°.
 *
 * Metaphor: old rotary telephone dial. User drags the wheel in a circular
 * motion (touch or mouse); on release, the wheel snaps to the nearest 45°
 * slot. The item that ends up at the top (under the triangle) is active.
 */

const SLOTS = 8;
const STEP  = 360 / SLOTS;

export function createWheel({ container, stage, items, initialIndex = 0, onChange, onMirillaTap }) {
  // `container` is the rotating ring (holds the items, gets the `--rot` var).
  // `stage` is its parent wrapper that also holds the static mirilla — we
  // listen on the stage so taps on the mirilla are captured too (the mirilla
  // is a sibling of the ring, not a descendant, so listeners on `container`
  // would miss it).
  stage = stage || container;
  container.style.setProperty("--count", String(SLOTS));
  renderItems(container, items);

  const state = {
    rotation: -initialIndex * STEP,
    startPointerAngle: 0,
    startRotation: 0,
    startClientX: 0,
    startClientY: 0,
    pointerId: null,
    dragMoved: false,
    activeIndex: initialIndex,
    items,
    onChange,
    onMirillaTap
  };

  const DRAG_THRESHOLD_PX = 6;

  applyRotation(false);
  updateActive(initialIndex);

  function renderItems(container, items) {
    container.innerHTML = "";
    items.forEach((item, i) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "wheel__item";
      el.style.setProperty("--i", String(i));
      el.dataset.index = String(i);
      el.dataset.slug = item.slug;
      el.textContent = item.label;
      if (item.color) el.style.setProperty("--item-color", item.color);
      el.setAttribute("role", "option");
      el.addEventListener("click", (e) => {
        if (state.dragMoved) { e.preventDefault(); return; }
        selectIndex(Number(el.dataset.index));
      });
      container.appendChild(el);
    });
  }

  function applyRotation(animated) {
    container.classList.toggle("is-dragging", !animated);
    container.style.setProperty("--rot", state.rotation + "deg");
  }

  function updateActive(i) {
    state.activeIndex = i;
    container.querySelectorAll(".wheel__item").forEach(el => {
      el.dataset.active = String(Number(el.dataset.index) === i);
    });
  }

  function indexFromRotation(rot) {
    const raw = -rot / STEP;
    return ((Math.round(raw) % SLOTS) + SLOTS) % SLOTS;
  }

  function selectIndex(i) {
    const base = -i * STEP;
    const currentTurns = Math.round((state.rotation - base) / 360);
    state.rotation = base + currentTurns * 360;
    applyRotation(true);
    updateActive(i);
    state.onChange?.(i, state.items[i]);
  }

  function pointerAngle(e) {
    const r = stage.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
  }

  function onPointerDown(e) {
    if (state.pointerId !== null) return;
    state.pointerId = e.pointerId;
    state.startPointerAngle = pointerAngle(e);
    state.startRotation = state.rotation;
    state.startClientX = e.clientX;
    state.startClientY = e.clientY;
    state.dragMoved = false;
    stage.setPointerCapture(e.pointerId);
    applyRotation(false);
  }

  function onPointerMove(e) {
    if (e.pointerId !== state.pointerId) return;

    // threshold by pixel distance — avoids marking a shaky tap as a drag
    if (!state.dragMoved) {
      const dx = e.clientX - state.startClientX;
      const dy = e.clientY - state.startClientY;
      if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return;
      state.dragMoved = true;
    }

    const a = pointerAngle(e);
    let delta = a - state.startPointerAngle;
    if (delta > 180)  delta -= 360;
    if (delta < -180) delta += 360;
    state.rotation = state.startRotation + delta;
    applyRotation(false);

    const live = indexFromRotation(state.rotation);
    if (live !== state.activeIndex) {
      updateActive(live);
      state.onChange?.(live, state.items[live], { live: true });
    }
  }

  function onPointerUp(e) {
    if (e.pointerId !== state.pointerId) return;
    stage.releasePointerCapture?.(e.pointerId);
    state.pointerId = null;

    if (state.dragMoved) {
      // drag — snap to nearest slot
      const i = indexFromRotation(state.rotation);
      selectIndex(i);
      return;
    }

    // tap — resolve to the item under the pointer (robust against pointer-capture
    // swallowing the subsequent click event on child buttons)
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const item = hit?.closest?.(".wheel__item");
    if (item) {
      selectIndex(Number(item.dataset.index));
      return;
    }
    // tap on the mirilla → open the active project
    if (hit?.closest?.(".mirilla")) {
      state.onMirillaTap?.(state.activeIndex, state.items[state.activeIndex]);
    }
  }

  stage.addEventListener("pointerdown", onPointerDown);
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerup", onPointerUp);
  stage.addEventListener("pointercancel", onPointerUp);

  document.addEventListener("keydown", e => {
    if (document.getElementById("view-home")?.hidden) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      selectIndex((state.activeIndex + 1) % SLOTS);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      selectIndex((state.activeIndex - 1 + SLOTS) % SLOTS);
    }
  });

  return {
    getIndex: () => state.activeIndex,
    setIndex: selectIndex,
    setOnChange: (fn) => { state.onChange = fn; },
    setMirillaTap: (fn) => { state.onMirillaTap = fn; },
    updateItems: (items) => {
      state.items = items;
      // update text labels + colours in-place so the rotation state is kept
      container.querySelectorAll(".wheel__item").forEach(el => {
        const i = Number(el.dataset.index);
        const item = items[i];
        if (!item) return;
        el.textContent = item.label;
        el.dataset.slug = item.slug;
        if (item.color) el.style.setProperty("--item-color", item.color);
      });
    }
  };
}
