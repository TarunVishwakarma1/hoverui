"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A soft blob that stretches along your motion, wobbles back to round, swells over anything clickable and squashes on press. */
export function JellyCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, angle: 0, stretch: 1, v: 0, press: 1 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const k = p.ease(20);
    const [dx, dy] = [(p.x - st.x) * k, (p.y - st.y) * k];
    st.x += dx;
    st.y += dy;
    const speed = p.dt ? Math.hypot(dx, dy) / p.dt : 0;
    if (speed > 20) st.angle = Math.atan2(dy, dx);
    const target = p.reduced ? 1 : 1 + Math.min(speed / 1400, 0.7);
    if (p.dt && !p.reduced) {
      // An underdamped spring, so it overshoots a little on the way back to round.
      st.v += ((target - st.stretch) * 220 - st.v * 10) * p.dt;
      st.stretch += st.v * p.dt;
    } else st.stretch = target;
    st.press += ((p.down ? 0.8 : p.hover ? 1.7 : 1) - st.press) * p.ease(18);
    const blob = el.firstElementChild as HTMLElement;
    blob.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${st.angle}rad) scale(${st.stretch * st.press}, ${st.press / st.stretch})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-6 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
