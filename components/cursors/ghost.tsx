"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The ghost, drawn upright; exported so a page can draw it at rest. */
export function GhostArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 32" className={className} aria-hidden>
      <path d="M2 14a12 12 0 0 1 24 0v16l-4-3-4 3-4-3-4 3-4-3-4 3Z" fill="#f8fafc" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <g fill="#16181a">
        <ellipse cx="10" cy="13" rx="2" ry="2.6" />
        <ellipse cx="18" cy="13" rx="2" ry="2.6" />
        <ellipse cx="14" cy="19.5" rx="1.6" ry="2" />
      </g>
    </svg>
  );
}

/** A ghost that haunts the pointer: it floats a little behind, bobs, and leans into the way you move; over anything clickable it swoops in and swells. */
export function GhostCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, t: 0, size: 1 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    const near = p.hover ? 0.55 : 1;
    const lagX = p.x - 26 * near - st.x;
    st.x += lagX * p.ease(4);
    st.y += (p.y - 30 * near - st.y) * p.ease(4);
    st.size += ((p.down ? 0.85 : p.hover ? 1.35 : 1) - st.size) * p.ease(12);
    const bob = p.reduced ? 0 : Math.sin(st.t * 2.2) * 3;
    const lean = Math.max(-18, Math.min(18, lagX * 0.5));
    const [ghost, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    ghost.style.transform = `translate(${st.x}px, ${st.y + bob}px) rotate(${lean}deg) scale(${st.size})`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <GhostArt className="absolute h-10 w-9 -translate-1/2 opacity-90" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
