"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The sun, rays in a `data-rays` group; exported so a page can draw it at rest. */
export function SunArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-16 -16 32 32" className={`overflow-visible ${className}`} aria-hidden>
      <g data-rays stroke="#ffb000" strokeWidth="2" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d="M0-10.5v-3.5" transform={`rotate(${i * 45})`} />
        ))}
      </g>
      <circle r="7" fill="#ffc83d" stroke="#f59e0b" strokeWidth="1" />
    </svg>
  );
}

/** A sun whose rays turn slowly; over anything clickable they stretch and spin, and a press brings an eclipse. */
export function SunCursor({ className = "" }: { className?: string }) {
  const s = useRef({ a: 0, rays: 1, size: 1, moon: 1 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    if (!p.reduced) st.a += p.dt * (p.hover ? 2.4 : 0.5);
    st.rays += ((p.hover ? 1.6 : 1) - st.rays) * p.ease(10);
    st.size += ((p.hover ? 1.15 : 1) - st.size) * p.ease(10);
    // The moon slides in while you press and drifts off when you let go.
    st.moon += ((p.down ? 0 : 1) - st.moon) * p.ease(p.down ? 8 : 5);
    const [sun, moon] = el.children as HTMLCollectionOf<HTMLElement>;
    sun.style.transform = `translate(${p.x}px, ${p.y}px) scale(${st.size})`;
    (sun.querySelector("[data-rays]") as SVGElement).style.transform = `rotate(${st.a}rad) scale(${st.rays})`;
    moon.style.transform = `translate(${p.x + st.moon * 26}px, ${p.y - st.moon * 12}px) scale(${st.size})`;
    moon.style.opacity = String(1 - st.moon);
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <SunArt className="absolute size-8 -translate-1/2" />
      <div className="absolute size-[15px] -translate-1/2 rounded-full bg-[#1c1c22] opacity-0" />
    </div>
  );
}
