"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Darkens its area except for a pool of light at the pointer, which widens over anything clickable. */
export function FlashlightCursor({ className = "" }: { className?: string }) {
  const s = useRef({ r: 110, t: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    st.r += ((p.hover ? 150 : 110) - st.r) * p.ease(8);
    // A slow, uneven breath in the beam; still under reduced motion.
    const r = p.reduced ? st.r : st.r * (1 + Math.sin(st.t * 13) * 0.01 + Math.sin(st.t * 7.3) * 0.015);
    // The dark covers only the visible part of the area.
    const a = el.parentElement!.getBoundingClientRect();
    const left = Math.max(a.left, 0);
    const top = Math.max(a.top, 0);
    const dark = el.firstElementChild as HTMLElement;
    Object.assign(dark.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${Math.min(a.right, innerWidth) - left}px`,
      height: `${Math.min(a.bottom, innerHeight) - top}px`,
      // A faint warm light in the pool, so the beam still reads on a page that is already dark.
      background: `radial-gradient(circle ${r}px at ${p.x - left}px ${p.y - top}px, rgb(255 236 200 / 0.14), transparent 55%, rgb(8 8 12 / 0.9) 100%)`,
    });
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute" />
    </div>
  );
}
