"use client";

import { useId, useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The drop: its radius in px, and how much it enlarges what is under it. */
const R = 20;
const ZOOM = 1.5;
const RIPPLES = 3;
/** How far a ripple runs, in px, and for how long, in seconds. */
const REACH = 130;
const LIFE = 1.1;

/** A displacement map drawn once into a canvas: each pixel's pull, as a vector in red and green round 0.5. */
function map(size: number, pull: (r: number) => number, most: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const h = size / 2;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const [dx, dy] = [x + 0.5 - h, y + 0.5 - h];
      const r = Math.hypot(dx, dy) || 1;
      const d = pull(r / h) / most;
      const i = (y * size + x) * 4;
      img.data[i] = 127.5 - (dx / r) * d * 127.5;
      img.data[i + 1] = 127.5 - (dy / r) * d * 127.5;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/** A drop is a lens that enlarges its middle and eases back to nothing at its rim, so its edge never tears the page. */
const DROP_PULL = (r: number) => (r < 1 ? (1 - 1 / ZOOM) * r * R * (1 - r ** 6) : 0);
const DROP_MOST = (1 - 1 / ZOOM) * R * 0.62;
/** A ripple is one wave in a ring: the page bunches up ahead of it and stretches behind, nothing inside or out. */
const RING_PULL = (r: number) => (Math.abs(r - 0.72) < 0.22 ? Math.sin((Math.PI * (r - 0.72)) / 0.22) : 0);

/** The drop's glass, a little light caught at its crown and its rim; exported so a page can draw one at rest. */
export function DropletArt({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block rounded-full ${className}`}
      style={{
        background: "radial-gradient(circle at 34% 28%, rgb(255 255 255 / 0.85), rgb(255 255 255 / 0) 22%), radial-gradient(circle at 60% 72%, transparent 52%, rgb(120 160 200 / 0.28) 100%)",
        boxShadow: "inset 0 0 0 1px color-mix(in srgb, currentColor 32%, transparent), inset 0 -3px 6px rgb(40 70 110 / 0.18)",
      }}
    />
  );
}

/**
 * A drop of water on the page. It slides after the pointer, stretching as it goes, and refracts what is under it.
 * Over anything clickable it swells and magnifies more; hold, and it gathers. A click sends ripples through the page
 * itself, bending the words they pass. Chromium browsers draw the refraction and the bending; elsewhere the drop and
 * its rings show without them.
 */
export function DropletCursor({ className = "" }: { className?: string }) {
  const id = `droplet${useId().replace(/[^\w-]/g, "")}`;
  const s = useRef({ x: 0, y: 0, angle: 0, stretch: 1, size: 1, scale: 0, next: 0, ripples: Array.from({ length: RIPPLES }, () => ({ x: 0, y: 0, age: Infinity })), wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [defs, lens, glass, rings, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    // The maps are drawn once, on the drop's first frame.
    const images = defs.querySelectorAll("feImage");
    if (!images[0].getAttribute("href")) {
      const [drop, ring] = [map(R * 2, DROP_PULL, DROP_MOST), map(128, RING_PULL, 1)];
      images.forEach((img, i) => img.setAttribute("href", i ? ring : drop));
    }
    const [x0, y0] = [st.x, st.y];
    st.x += (p.x - st.x) * p.ease(18);
    st.y += (p.y - st.y) * p.ease(18);
    const speed = p.dt ? Math.hypot(st.x - x0, st.y - y0) / p.dt : 0;
    if (speed > 30) st.angle = Math.atan2(st.y - y0, st.x - x0);
    // A moving drop draws out along its path; it rounds again when it stops.
    st.stretch += ((p.reduced ? 1 : 1 + Math.min(speed / 1800, 0.45)) - st.stretch) * p.ease(10);
    st.size += ((p.down ? 1.3 : p.hover ? 1.15 : 1) - st.size) * p.ease(8);
    const zoom = Math.round(DROP_MOST * 2 * (p.down ? 1.5 : p.hover ? 1.35 : 1));
    if (zoom !== st.scale) defs.querySelector(`#${id}-lens feDisplacementMap`)!.setAttribute("scale", String((st.scale = zoom)));
    const shape = `translate(${st.x}px, ${st.y}px) rotate(${st.angle}rad) scale(${st.size * st.stretch}, ${st.size / st.stretch})`;
    lens.style.transform = glass.style.transform = shape;

    // A click: one wave runs out through the page from where you clicked.
    if (p.down && !st.wasDown && !p.reduced) {
      Object.assign(st.ripples[st.next], { x: p.x, y: p.y, age: 0 });
      st.next = (st.next + 1) % RIPPLES;
    }
    st.wasDown = p.down;
    st.ripples.forEach((r, i) => {
      r.age += p.dt;
      const k = Math.min(r.age / LIFE, 1);
      const size = 24 + (REACH * 2 - 24) * (1 - (1 - k) ** 2);
      const wave = rings.children[i] as HTMLElement;
      const [bend, line] = wave.children as HTMLCollectionOf<HTMLElement>;
      wave.style.display = k < 1 ? "" : "none";
      if (k >= 1) return;
      wave.style.transform = `translate(${r.x - size / 2}px, ${r.y - size / 2}px)`;
      bend.style.width = bend.style.height = line.style.width = line.style.height = `${size}px`;
      // The wave flattens as it spreads.
      const filter = defs.querySelector(`#${id}-ring${i}`)!;
      filter.querySelector("feImage")!.setAttribute("width", String(size));
      filter.querySelector("feImage")!.setAttribute("height", String(size));
      filter.querySelector("feDisplacementMap")!.setAttribute("scale", String(22 * (1 - k) ** 1.5));
      line.style.opacity = String(0.45 * (1 - k));
    });
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  // No blend mode or filter on the root: either would cut the drop and the ripples off from the page they bend.
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute size-0">
        <filter id={`${id}-lens`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage x="0" y="0" width={R * 2} height={R * 2} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={DROP_MOST * 2} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {Array.from({ length: RIPPLES }, (_, i) => (
          <filter key={i} id={`${id}-ring${i}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage x="0" y="0" width="24" height="24" preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </svg>
      <div className="absolute -translate-1/2 rounded-full" style={{ width: R * 2, height: R * 2, backdropFilter: `url(#${id}-lens)` }} />
      <DropletArt className="absolute size-10 -translate-1/2" />
      <div>
        {Array.from({ length: RIPPLES }, (_, i) => (
          <div key={i} className="absolute top-0 left-0" style={{ display: "none" }}>
            <div className="absolute top-0 left-0 rounded-full" style={{ backdropFilter: `url(#${id}-ring${i})` }} />
            <div className="absolute top-0 left-0 rounded-full border border-current" />
          </div>
        ))}
      </div>
      <div className="absolute size-1 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
