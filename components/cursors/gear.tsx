"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A ten-tooth gear with a hole; exported so a page can draw it at rest. */
export function GearArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" className={className} aria-hidden>
      <g fill="currentColor">
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x="-1.6" y="-11.5" width="3.2" height="4.5" rx="0.6" transform={`rotate(${i * 36})`} />
        ))}
        <path fillRule="evenodd" d="M8 0a8 8 0 1 1-16 0 8 8 0 1 1 16 0ZM3 0a3 3 0 1 1-6 0 3 3 0 1 1 6 0Z" />
      </g>
    </svg>
  );
}

/** A gear that rolls as the pointer travels; over anything clickable a second gear meshes in and turns against it. */
export function GearCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, rot: 0, mesh: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    if (p.dt && !p.reduced) st.rot += Math.hypot(p.x - st.x, p.y - st.y) * 1.2;
    [st.x, st.y] = [p.x, p.y];
    st.mesh += ((p.hover ? 1 : 0) - st.mesh) * p.ease(14);
    const [big, small] = el.children as HTMLCollectionOf<HTMLElement>;
    big.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${st.rot}deg)`;
    // Rolling against a gear 0.6 its size, the small one turns 1/0.6 as fast, the other way.
    small.style.transform = `translate(${p.x + 15}px, ${p.y - 11}px) rotate(${-st.rot / 0.6 + 18}deg) scale(${0.6 * st.mesh})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <GearArt className="absolute size-7 -translate-1/2" />
      <GearArt className="absolute size-7 -translate-1/2" />
    </div>
  );
}
