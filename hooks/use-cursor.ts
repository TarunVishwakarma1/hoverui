import { useEffect, useEffectEvent, useRef } from "react";

export type Pointer = {
  x: number;
  y: number;
  /** Mouse button held. */
  down: boolean;
  /** Element under the pointer. */
  target: Element | null;
  /** The clickable element under the pointer (anything matching `INTERACTIVE`) inside this cursor's area, for hover effects. */
  hover: Element | null;
  /** Per-frame smoothing: `pos += (p.x - pos) * p.ease(speed)`. Frame-rate independent; 1 (snap) on enter and under reduced motion. */
  ease: (speed: number) => number;
  /** Seconds since the last frame (0 on the frame the pointer enters), for time-based motion. */
  dt: number;
  /** The visitor prefers reduced motion: skip anything that moves on its own. */
  reduced: boolean;
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
      hover: null,
      ease: (speed) => (snap || reduced ? 1 : 1 - Math.exp(-speed * dt)),
      dt: 0,
      reduced,
    };

    const tick = (t: number) => {
      dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      p.dt = snap ? 0 : dt;
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
      // A touch on a laptop's screen is not the mouse: leave the cursor where the mouse left it.
      if (e.pointerType === "touch") return;
      p.x = e.clientX;
      p.y = e.clientY;
      p.target = e.target as Element;
      // A link wrapping the whole area (a card, say) is not something to hover inside it.
      const hit = p.target.closest(INTERACTIVE);
      p.hover = hit && hit !== area && area.contains(hit) ? hit : null;
      setActive(p.target.closest("[data-cursor-area]") === area);
    };
    area.addEventListener("pointermove", track, opts);
    // Scrolling under a still pointer fires no pointermove, only boundary events: without this the
    // old area deactivates on pointerleave and nothing takes over, leaving no cursor at all.
    area.addEventListener("pointerover", track, opts);
    area.addEventListener("pointerleave", () => setActive(false), opts);
    // The main button only: a right-click opens a menu that swallows its pointerup.
    area.addEventListener("pointerdown", (e) => (p.down = e.button === 0), opts);
    window.addEventListener("pointerup", () => (p.down = false), opts);
    window.addEventListener("blur", () => (p.down = false), opts);

    return () => {
      ac.abort();
      setActive(false);
      area.removeAttribute("data-cursor-area");
    };
  }, []);

  return ref;
}
