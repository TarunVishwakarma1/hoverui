"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The astronaut, drawn upright; exported so a page can draw it at rest. */
export function AstronautArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        <rect x="4" y="18" width="6" height="12" rx="3" fill="#d4d4d8" />
        <rect x="10" y="30" width="5" height="8" rx="2.5" fill="#f4f4f5" />
        <rect x="17" y="30" width="5" height="8" rx="2.5" fill="#f4f4f5" />
        <rect x="8" y="17" width="16" height="15" rx="5" fill="#f4f4f5" />
        <circle cx="16" cy="11" r="9" fill="#f4f4f5" />
      </g>
      <rect x="10" y="7" width="12" height="8" rx="4" fill="#1e293b" />
      <path d="M13 9.5h3" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** An astronaut drifting behind the pointer on a slack tether, bobbing in zero gravity; over anything clickable it reels itself in for a closer look. */
export function AstronautCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, t: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    const reach = p.hover ? 0.5 : 1;
    st.x += (p.x + 36 * reach - st.x) * p.ease(2.5);
    st.y += (p.y + 30 * reach - st.y) * p.ease(2.5);
    const ay = st.y + (p.reduced ? 0 : Math.sin(st.t * 1.6) * 4);
    const tilt = p.reduced ? 0 : Math.sin(st.t * 0.9) * 10;
    const sag = Math.min(Math.hypot(st.x - p.x, ay - p.y) * 0.3, 40);
    const [tether, astronaut, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    tether.firstElementChild!.setAttribute("d", `M${p.x} ${p.y}Q${(p.x + st.x) / 2} ${(p.y + ay) / 2 + sag} ${st.x} ${ay}`);
    astronaut.style.transform = `translate(${st.x}px, ${ay}px) rotate(${tilt}deg)`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute top-0 left-0 h-screen w-screen overflow-visible">
        <path fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <AstronautArt className="absolute h-10 w-8 -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
