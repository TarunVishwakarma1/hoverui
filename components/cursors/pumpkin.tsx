"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A jack-o'-lantern; give the svg `data-lit` to light its face. Exported so a page can draw it at rest. */
export function PumpkinArt({ className = "", lit = false }: { className?: string; lit?: boolean }) {
  return (
    <svg viewBox="0 0 32 30" data-lit={lit || undefined} className={`group ${className}`} aria-hidden>
      <path d="M15 6c0-3 1-4 3-5l1 1.5c-1.5 1-2 2.5-2 4z" fill="#4d7c2a" />
      <g fill="#ff8a1d" stroke="currentColor" strokeWidth="1.2">
        <ellipse cx="10" cy="17.5" rx="8" ry="10.5" />
        <ellipse cx="22" cy="17.5" rx="8" ry="10.5" />
        <ellipse cx="16" cy="17.5" rx="7.5" ry="11" />
      </g>
      <g className="fill-[#3a1d00] transition-[fill] duration-200 group-data-lit:fill-[#ffd84d]">
        <path d="M9 15l3.5-3 .5 4zM23 15l-3.5-3-.5 4zM15 18.5h2l-1-2z" />
        <path d="M8.5 20.5q7.5 7 15 0l-2.7 1.4-1.4-1-1.8 1.4-1.6-1.1-1.6 1.1-1.8-1.4-1.4 1z" />
      </g>
    </svg>
  );
}

/** A jack-o'-lantern bobbing at the pointer's side; over anything clickable it creeps closer and its face lights up. */
export function PumpkinCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, size: 1, lit: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const near = p.hover ? 0.6 : 1;
    st.x += (p.x + 22 * near - st.x) * p.ease(10);
    st.y += (p.y + 20 * near - st.y) * p.ease(10);
    st.size += ((p.hover ? 1.2 : 1) - st.size) * p.ease(12);
    const wobble = Math.max(-14, Math.min(14, (p.x + 22 * near - st.x) * 0.5));
    const [pumpkin, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    // A press squashes it into the ground.
    pumpkin.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${wobble}deg) scale(${st.size * (p.down ? 1.1 : 1)}, ${st.size * (p.down ? 0.85 : 1)})`;
    if (st.lit !== !!p.hover) pumpkin.toggleAttribute("data-lit", (st.lit = !!p.hover));
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <PumpkinArt className="absolute h-[30px] w-8 -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
