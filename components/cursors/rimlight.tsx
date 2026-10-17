"use client";

import { useRef } from "react";
import { cursorRoot, INTERACTIVE, useCursor } from "@/hooks/use-cursor";

/** How many controls can be lit at once: the nearest ones. */
const LIT = 12;
/** The rim stands this far off a control's edge, so it lights the air round the control, not the control's own border. */
const GAP = 3;
/** A rim: the light painted on a box, masked to a ring as wide as its padding. */
const RING = "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)";

/** A control's corner radius, grown to round the rim that stands off it. */
const grow = (radius: string) => radius.replace(/(\d*\.?\d+)px/g, (all, px) => (Number(px) > 0 ? `${Number(px) + GAP}px` : all));

/** How far the point (`x`, `y`) is from the box `r`: 0 inside it. */
const away = (x: number, y: number, r: DOMRect) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));

/**
 * A light at the pointer that catches the edges of the controls near it, the way a rim light picks out an edge in a
 * photograph: the nearer the control, the brighter its rim where the light falls, so buttons and cards light up as
 * you come close. The control under the pointer lights all the way round, with a highlight circling its edge; a click
 * sends a ring of light out across the controls nearby.
 */
export function RimlightCursor({
  className = "",
  radius = 160,
}: {
  className?: string;
  /** How far the light reaches, in px. */
  radius?: number;
}) {
  const s = useRef({ near: [] as { el: Element; round: string }[], scan: 0, spin: 0, pulse: Infinity, px: 0, py: 0, wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [rims, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
    // The controls within reach of the light or a click's ring, found again a few times a second: the nearest few.
    st.scan -= p.dt;
    if (st.scan <= 0) {
      st.scan = 0.2;
      st.near = [...el.parentElement!.querySelectorAll(INTERACTIVE)]
        .map((control) => ({ control, d: away(p.x, p.y, control.getBoundingClientRect()) }))
        .filter(({ d }) => d < radius * 2.5)
        .sort((a, b) => a.d - b.d)
        .slice(0, LIT)
        .map(({ control }) => ({ el: control, round: grow(getComputedStyle(control).borderRadius) }));
    }
    if (p.down && !st.wasDown && !p.reduced) [st.pulse, st.px, st.py] = [0, p.x, p.y];
    st.wasDown = p.down;
    st.pulse += p.dt;
    if (!p.reduced) st.spin = (st.spin + p.dt * 140) % 360;

    for (let i = 0; i < LIT; i++) {
      const rim = rims.children[i] as HTMLElement;
      const near = st.near[i];
      const box = near?.el.isConnected ? near.el.getBoundingClientRect() : null;
      const hovered = !!box && near.el === p.hover;
      // The light falls off with distance; a click's ring of light flares each rim as it passes over.
      const light = box ? Math.max(0, 1 - away(p.x, p.y, box) / radius) ** 1.2 : 0;
      const ring = box && st.pulse < 0.7 ? Math.exp(-(((away(st.px, st.py, box) - st.pulse * radius * 3.5) / 36) ** 2)) * (1 - st.pulse / 0.7) : 0;
      const shown = hovered ? 1 : Math.min(1, light + ring);
      rim.style.opacity = String(shown);
      if (!box || shown < 0.01) continue;
      const layers = [`radial-gradient(${radius}px circle at ${p.x - box.left + GAP}px ${p.y - box.top + GAP}px, currentColor, transparent)`];
      if (hovered) layers.push(`conic-gradient(from ${st.spin}deg, transparent, currentColor 12%, transparent 26%)`);
      const flat = (hovered ? 0.35 : 0) + ring;
      if (flat > 0.01) layers.push(`linear-gradient(color-mix(in srgb, currentColor ${Math.round(Math.min(flat, 1) * 100)}%, transparent) 0 0)`);
      Object.assign(rim.style, {
        transform: `translate(${box.left - GAP}px, ${box.top - GAP}px)`,
        width: `${box.width + GAP * 2}px`,
        height: `${box.height + GAP * 2}px`,
        borderRadius: near.round,
        padding: hovered ? "2px" : "1.5px",
        background: layers.join(", "),
      });
    }
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div>
        {Array.from({ length: LIT }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 opacity-0" style={{ mask: RING }} />
        ))}
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
