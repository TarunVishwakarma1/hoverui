"use client";

import { useRef } from "react";
import { INTERACTIVE, cursorRoot, useCursor } from "./use-cursor";

/** Exact dot + lagging ring that swells over interactive elements and squeezes on press. */
export function RingCursor({ className = "" }: { className?: string }) {
  const ring = useRef({ x: 0, y: 0, scale: 1 });
  const ref = useCursor((p, el) => {
    const r = ring.current;
    const [circle, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    r.x += (p.x - r.x) * p.ease(12);
    r.y += (p.y - r.y) * p.ease(12);
    r.scale += ((p.down ? 0.7 : p.target?.closest(INTERACTIVE) ? 1.8 : 1) - r.scale) * p.ease(16);
    circle.style.transform = `translate(${r.x}px, ${r.y}px) scale(${r.scale})`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-8 -translate-1/2 rounded-full border border-current" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
