"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A moon circles the pointer; its orbit widens over anything clickable. */
export function OrbitCursor({ className = "" }: { className?: string }) {
  const s = useRef({ a: 0, r: 16 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    if (!p.reduced) st.a += p.dt * 3.2;
    st.r += ((p.hover ? 28 : 16) - st.r) * p.ease(10);
    const [ring, moon, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    ring.style.transform = `translate(${p.x}px, ${p.y}px) scale(${st.r / 16})`;
    moon.style.transform = `translate(${p.x + Math.cos(st.a) * st.r}px, ${p.y + Math.sin(st.a) * st.r}px)`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-8 -translate-1/2 rounded-full border border-current opacity-30" />
      <div className="absolute size-2 -translate-1/2 rounded-full bg-current" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
