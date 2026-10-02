"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The rocket, nose up, with its flame marked `data-flame`; exported so a page can draw it at rest. */
export function RocketArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 36" className={className} aria-hidden>
      <path data-flame d="M9 21h6l-3 10z" fill="#ffb400" style={{ transformOrigin: "12px 21px" }} />
      <path d="M7 15l-4 6v3l4-2M17 15l4 6v3l-4-2" fill="#ff5a5f" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M12 1c5 5 6 12 5 20H7C6 13 7 6 12 1Z" fill="#f4f4f5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.6" fill="#3d7bff" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** A rocket whose nose is the pointer: it turns to face where you move, its flame grows with speed and roars over anything clickable. */
export function RocketCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, rot: 0, flame: 0.4, t: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const vx = p.dt ? (p.x - st.x) / p.dt : 0;
    const vy = p.dt ? (p.y - st.y) / p.dt : 0;
    [st.x, st.y] = [p.x, p.y];
    const speed = Math.hypot(vx, vy);
    if (speed > 40) {
      const target = Math.atan2(vy, vx) + Math.PI / 2;
      st.rot += Math.atan2(Math.sin(target - st.rot), Math.cos(target - st.rot)) * p.ease(10);
    }
    st.t += p.dt;
    const thrust = p.down ? 0.1 : p.hover ? 2 : p.reduced ? 0.4 : Math.min(0.4 + speed / 900, 1.6);
    st.flame += (thrust - st.flame) * p.ease(12);
    const flicker = p.reduced ? 1 : 1 + Math.sin(st.t * (p.hover ? 70 : 40)) * 0.08;
    // Full throttle shakes the hull a little.
    const shake = p.hover && !p.reduced ? Math.sin(st.t * 90) * 0.04 : 0;
    const rocket = el.firstElementChild as HTMLElement;
    rocket.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${st.rot + shake}rad)`;
    (rocket.querySelector("[data-flame]") as SVGElement).style.scale = `1 ${st.flame * flicker}`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {/* Zero-size wrapper at the pointer: it rotates around the nose. */}
      <div className="absolute top-0 left-0">
        <RocketArt className="absolute top-[-1px] left-[-12px] h-9 w-6" />
      </div>
    </div>
  );
}
