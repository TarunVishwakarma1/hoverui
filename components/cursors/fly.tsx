"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A housefly seen from above, head up, wings marked `data-wings`; exported so a page can draw it at rest. */
export function FlyArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <g data-wings fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="0.6">
        <ellipse cx="6" cy="11" rx="3" ry="5.5" transform="rotate(-25 6 11)" />
        <ellipse cx="14" cy="11" rx="3" ry="5.5" transform="rotate(25 14 11)" />
      </g>
      <g fill="currentColor">
        <ellipse cx="10" cy="12" rx="2.8" ry="4.4" />
        <circle cx="10" cy="6.5" r="2.3" />
      </g>
    </svg>
  );
}

/** A fly buzzing around the pointer; over anything clickable it lands, and a click shoos it off for a moment. */
export function FlyCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, t: 0, rot: 0, shoo: 0, wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    if (p.down && !st.wasDown) st.shoo = 0.7;
    st.wasDown = p.down;
    st.shoo = Math.max(st.shoo - p.dt, 0);
    const land = !!p.hover && !st.shoo;
    // Buzzing: sines at unrelated rates, wider while shooed; still when it has landed.
    const r = land || p.reduced ? 0 : st.shoo ? 5 : 1;
    const wx = (Math.sin(st.t * 7.3) * 22 + Math.sin(st.t * 13.1) * 8) * r;
    const wy = (Math.cos(st.t * 6.1) * 18 + Math.sin(st.t * 11.7) * 7) * r;
    const [tx, ty] = land || p.reduced ? [p.x + 8, p.y + 8] : [p.x + wx, p.y + wy];
    const [ox, oy] = [st.x, st.y];
    st.x += (tx - st.x) * p.ease(land ? 12 : 10);
    st.y += (ty - st.y) * p.ease(land ? 12 : 10);
    // Head first, the way it flies; a landed fly settles facing up.
    const heading = land ? 0 : Math.atan2(st.y - oy, st.x - ox) * (180 / Math.PI) + 90;
    if (land || Math.hypot(st.x - ox, st.y - oy) > 0.5) st.rot += ((((heading - st.rot) % 360) + 540) % 360 - 180) * p.ease(land ? 8 : 20);
    const [fly, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    fly.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${st.rot}deg)`;
    // Wings flicker between frames while flying, so they read as a blur.
    (fly.querySelector("[data-wings]") as SVGElement).style.opacity = land || p.reduced ? "1" : Math.random() < 0.5 ? "0.35" : "0.9";
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <FlyArt className="absolute size-5 -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
