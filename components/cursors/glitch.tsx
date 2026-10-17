"use client";

import { useId, useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Color matrices that keep one channel of the page: red, green, blue. */
const KEEP = ["1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0", "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0", "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"];
/** The bars a fit throws up: cyan, magenta, white. */
const BARS = ["#00f0ff", "#ff2bd6", "#ffffff"];

/**
 * A displacement map `h` px tall, as a data URL, that slices the page into a few bands and shoves each one sideways a
 * random amount. Two px wide: the browser stretches it across the window, and a band is the same all the way along.
 */
let slicer: HTMLCanvasElement | null = null;
function slices(h: number, bands: number) {
  slicer ??= document.createElement("canvas");
  [slicer.width, slicer.height] = [2, Math.max(1, h)];
  const ctx = slicer.getContext("2d")!;
  ctx.fillStyle = "rgb(128 128 128)";
  ctx.fillRect(0, 0, 2, h);
  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = `rgb(${Math.round(Math.random() * 255)} 128 128)`;
    ctx.fillRect(0, Math.floor(Math.random() * h), 2, Math.ceil(2 + Math.random() * h * 0.2));
  }
  return slicer.toDataURL();
}

/**
 * A small window on the pointer that splits the page beneath it into red, green and blue, and in fits slices it into
 * bands shoved sideways, like a signal breaking up. It glitches harder the faster you move; over anything clickable it
 * jumps to frame the control and breaks up more often, and a click throws a burst. Chromium browsers draw the glitch;
 * elsewhere the window shows the page in negative.
 */
export function GlitchCursor({
  className = "",
  size = 120,
}: {
  className?: string;
  /** The window's width at rest, in px; it is half as tall. */
  size?: number;
}) {
  const id = `glitch${useId().replace(/[^\w-]/g, "")}`;
  const s = useRef({ lx: 0, ly: 0, split: 1.2, fit: 0, next: 1, tick: 0, burst: 0, jx: 0, jy: 0, wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [defs, lens, lines, bars, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
    // A small window on the pointer, or one framing the hovered control.
    const box = p.hover?.getBoundingClientRect();
    const [w, h] = box ? [box.width + 8, box.height + 8] : [size, Math.round(size / 2)];
    const [x, y] = box ? [box.left - 4, box.top - 4] : [p.x - w / 2, p.y - h / 2];
    const speed = p.dt ? Math.hypot(p.x - st.lx, p.y - st.ly) / p.dt : 0;
    [st.lx, st.ly] = [p.x, p.y];
    if (p.down && !st.wasDown && !p.reduced) st.burst = 0.3;
    st.wasDown = p.down;
    st.burst = Math.max(0, st.burst - p.dt);

    // How hard it glitches: a little at rest, more the faster you move, more over a control, everything in a burst.
    const heat = Math.min(1, Math.min(1, speed / 2400) * 0.6 + (box ? 0.45 : 0) + (st.burst ? 1 : 0));
    st.split += (1.2 + heat * 5 - st.split) * p.ease(14);
    // Fits of slicing: now and then at rest, often when hot, all through a burst.
    st.next -= p.dt;
    st.fit = Math.max(0, st.fit - p.dt);
    if (!p.reduced && st.next <= 0) {
      st.fit = 0.1 + Math.random() * 0.18 + heat * 0.2;
      st.next = (0.4 + Math.random() * 2.2) * (1 - heat * 0.85);
    }
    const fitting = !p.reduced && (st.fit > 0 || st.burst > 0);
    const map = defs.querySelector("feImage")!;
    st.tick -= p.dt;
    if (fitting && st.tick <= 0) {
      // A fresh tear every few frames: new bands, a jolt to the window, a few bars of bad signal.
      st.tick = 0.05 + Math.random() * 0.04;
      map.setAttribute("href", slices(Math.round(h), 2 + Math.round(heat * 4)));
      [st.jx, st.jy] = [(Math.random() - 0.5) * 6 * heat, (Math.random() - 0.5) * 2 * heat];
      for (const bar of bars.children as HTMLCollectionOf<HTMLElement>) {
        const shown = Math.random() < 0.3 + heat * 0.5;
        Object.assign(bar.style, {
          opacity: shown ? String(0.55 + Math.random() * 0.35) : "0",
          width: `${w * (0.1 + Math.random() * 0.35)}px`,
          height: `${2 + Math.random() * 4}px`,
          transform: `translate(${Math.random() * w * 0.7}px, ${Math.random() * (h - 6)}px)`,
          background: BARS[Math.floor(Math.random() * BARS.length)],
        });
      }
    }
    if (!fitting) {
      [st.jx, st.jy] = [0, 0];
      for (const bar of bars.children as HTMLCollectionOf<HTMLElement>) bar.style.opacity = "0";
    }
    map.setAttribute("width", String(w));
    map.setAttribute("height", String(h));
    defs.querySelector("feDisplacementMap")!.setAttribute("scale", String(fitting ? 16 + heat * 40 : 0));
    const [red, blue] = defs.querySelectorAll("feOffset");
    red.setAttribute("dx", String(-st.split));
    blue.setAttribute("dx", String(st.split));
    for (const part of [lens, lines, bars]) Object.assign(part.style, { transform: `translate(${x + st.jx}px, ${y + st.jy}px)`, width: `${w}px`, height: `${h}px` });
  });

  // No blend mode or filter on the root: either would cut the window off from the page it breaks up.
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute size-0">
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage x="0" y="0" width={size} height={size / 2} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="sliced" />
          <feColorMatrix in="sliced" type="matrix" values={KEEP[0]} />
          <feOffset dx="-1.2" result="red" />
          <feColorMatrix in="sliced" type="matrix" values={KEEP[1]} result="green" />
          <feColorMatrix in="sliced" type="matrix" values={KEEP[2]} />
          <feOffset dx="1.2" result="blue" />
          <feBlend in="red" in2="green" mode="screen" result="both" />
          <feBlend in="both" in2="blue" mode="screen" />
        </filter>
      </svg>
      {/* The negative first, for browsers that cannot draw the glitch; Chromium takes the second. */}
      <div className="absolute top-0 left-0" style={{ WebkitBackdropFilter: "invert(1) hue-rotate(180deg)", backdropFilter: `url(#${id})` }} />
      <div className="absolute top-0 left-0" style={{ background: "repeating-linear-gradient(transparent 0 2px, color-mix(in srgb, currentColor 14%, transparent) 2px 3px)" }} />
      <div className="absolute top-0 left-0 overflow-hidden">
        {BARS.map((bar) => (
          <div key={bar} className="absolute top-0 left-0 opacity-0" />
        ))}
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
