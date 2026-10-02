"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A circle of radius 10 with a mouth `m` radians wide either side of the +x axis. */
const mouth = (m: number) => {
  const [x, y] = [(10 * Math.cos(m)).toFixed(2), (10 * Math.sin(m)).toFixed(2)];
  return `M0 0L${x} ${y}A10 10 0 1 1 ${x} ${-y}Z`;
};

/** The chomper facing right, mouth half open; exported so a page can draw it at rest. */
export function ChompArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-11 -11 22 22" className={className} aria-hidden>
      <path d={mouth(0.6)} fill="#ffd000" />
      <circle cx="1.5" cy="-5.5" r="1.4" fill="#111" />
    </svg>
  );
}

/** An arcade chomper that faces the way you move and chomps as it goes; over anything clickable it gobbles fast, and a press snaps it shut. */
export function ChompCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, angle: 0, phase: 0, size: 1 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const k = p.ease(16);
    const [dx, dy] = [(p.x - st.x) * k, (p.y - st.y) * k];
    st.x += dx;
    st.y += dy;
    const step = Math.hypot(dx, dy);
    if (step > 0.5) st.angle += Math.atan2(Math.sin(Math.atan2(dy, dx) - st.angle), Math.cos(Math.atan2(dy, dx) - st.angle)) * p.ease(18);
    // The jaw works with distance travelled, or on its own while it eats a control.
    if (!p.reduced) st.phase += step * 0.12 + (p.hover ? p.dt * 22 : 0);
    st.size += ((p.down ? 1.2 : p.hover ? 1.3 : 1) - st.size) * p.ease(16);
    const m = p.down ? 0.02 : p.reduced ? 0.5 : 0.05 + 0.6 * Math.abs(Math.sin(st.phase));
    const chomper = el.firstElementChild as SVGElement;
    // Facing left, it flips over rather than turning upside down, so the eye stays on top.
    const flip = Math.cos(st.angle) < 0 ? -1 : 1;
    chomper.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${st.angle}rad) scale(${st.size}, ${st.size * flip})`;
    chomper.firstElementChild!.setAttribute("d", mouth(m));
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <ChompArt className="absolute size-6 -translate-1/2" />
    </div>
  );
}
