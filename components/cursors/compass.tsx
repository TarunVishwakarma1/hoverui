"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The compass, needle marked `data-needle` and pointing north; exported so a page can draw it at rest. */
export function CompassArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M16 2v3M16 27v3M2 16h3M27 16h3" stroke="currentColor" strokeWidth="1.2" />
      <g data-needle style={{ transformOrigin: "16px 16px" }}>
        <path d="M16 5l3 11h-6z" fill="#e5484d" />
        <path d="M16 27l3-11h-6z" fill="currentColor" />
      </g>
      <circle cx="16" cy="16" r="1.4" fill="#f4f4f5" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** A compass whose needle swings to the way you are heading, overshoots, and settles back to north; over anything clickable it spins as if near a magnet. */
export function CompassCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const vx = p.dt ? (p.x - st.x) / p.dt : 0;
    const vy = p.dt ? (p.y - st.y) / p.dt : 0;
    [st.x, st.y] = [p.x, p.y];
    st.vx += (vx - st.vx) * p.ease(10);
    st.vy += (vy - st.vy) * p.ease(10);
    // Heading while moving, north when still or held.
    const target = !p.down && Math.hypot(st.vx, st.vy) > 80 ? Math.atan2(st.vy, st.vx) + Math.PI / 2 : 0;
    if (p.reduced) [st.a, st.va] = [target, 0];
    else if (p.hover && !p.down) {
      st.va += (14 - st.va) * p.ease(3);
      st.a += st.va * p.dt;
    } else {
      // A lightly damped spring: it overshoots and swings back, like a real needle.
      st.va += (wrap(target - st.a) * 90 - st.va * 6) * p.dt;
      st.a += st.va * p.dt;
    }
    const compass = el.firstElementChild as HTMLElement;
    compass.style.transform = `translate(${p.x}px, ${p.y}px)`;
    (compass.querySelector("[data-needle]") as SVGElement).style.transform = `rotate(${st.a}rad)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <CompassArt className="absolute size-9 -translate-1/2" />
    </div>
  );
}
