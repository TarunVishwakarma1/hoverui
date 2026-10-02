import { useEffect, useEffectEvent, useRef } from "react";

export type Pointer = {
  x: number;
  y: number;
  /** Mouse button held. */
  down: boolean;
  /** Element under the pointer, for hover effects: `p.target?.closest("a")`. */
  target: Element | null;
  /** Per-frame smoothing: `pos += (p.x - pos) * p.ease(speed)`. Frame-rate independent; 1 (snap) on enter and under reduced motion. */
  ease: (speed: number) => number;
};

/** Root classes every cursor shares: fixed overlay, hidden until the pointer is inside its area. */
export const cursorRoot =
  "pointer-events-none fixed left-0 top-0 z-9999 opacity-0 transition-opacity duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] data-active:opacity-100";

/** Things a cursor should react to on hover. */
export const INTERACTIVE = "a,button,input,select,textarea,label,[role=button],[data-cursor-label]";

/**
 * Turns the parent of the returned ref's element into a cursor area: hides the native cursor
 * there and calls `frame` every animation frame while a mouse is inside.
 * Put a cursor in <body> for a global one; nested areas take over from outer ones.
 * Note: position:fixed breaks under a transformed/filtered ancestor; portal to body if that bites.
 */
export function useCursor<T extends HTMLElement = HTMLDivElement>(frame: (p: Pointer, el: T) => void) {
  const ref = useRef<T>(null);
  const onFrame = useEffectEvent(frame);

  useEffect(() => {
    const el = ref.current;
    const area = el?.parentElement;
    if (!el || !area || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    if (!document.getElementById("hover-ui-cursor")) {
      const style = document.createElement("style");
      style.id = "hover-ui-cursor";
      style.textContent = "[data-cursor-area],[data-cursor-area] *{cursor:none!important}";
      document.head.append(style);
    }
    area.setAttribute("data-cursor-area", "");

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let dt = 0;
    let snap = true;
    const p: Pointer = {
      x: 0,
      y: 0,
      down: false,
      target: null,
      ease: (speed) => (snap || reduced ? 1 : 1 - Math.exp(-speed * dt)),
    };

    const tick = (t: number) => {
      dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      onFrame(p, el);
      snap = false;
      raf = requestAnimationFrame(tick);
    };
    const setActive = (on: boolean) => {
      if (on === !!raf) return;
      el.toggleAttribute("data-active", on);
      cancelAnimationFrame(raf);
      raf = on ? requestAnimationFrame(tick) : 0;
      snap = true;
    };

    const ac = new AbortController();
    const opts = { signal: ac.signal };
    const track = (e: PointerEvent) => {
      p.x = e.clientX;
      p.y = e.clientY;
      p.target = e.target as Element;
      setActive(p.target.closest("[data-cursor-area]") === area);
    };
    area.addEventListener("pointermove", track, opts);
    // Scrolling under a still pointer fires no pointermove, only boundary events: without this the
    // old area deactivates on pointerleave and nothing takes over, leaving no cursor at all.
    area.addEventListener("pointerover", track, opts);
    area.addEventListener("pointerleave", () => setActive(false), opts);
    area.addEventListener("pointerdown", () => (p.down = true), opts);
    window.addEventListener("pointerup", () => (p.down = false), opts);

    return () => {
      ac.abort();
      setActive(false);
      area.removeAttribute("data-cursor-area");
    };
  }, []);

  return ref;
}
