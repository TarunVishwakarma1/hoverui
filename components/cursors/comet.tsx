"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const TAIL = 180;

/** A bright head with a tail that stretches out behind you as you speed up; over a control the head swells inside a faint coma. */
export function CometCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, len: 0, angle: 0, size: 1, coma: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const vx = p.dt ? (p.x - st.x) / p.dt : 0;
    const vy = p.dt ? (p.y - st.y) / p.dt : 0;
    [st.x, st.y] = [p.x, p.y];
    const speed = Math.hypot(vx, vy);
    if (speed > 30) st.angle = Math.atan2(vy, vx);
    st.len += ((p.reduced ? 0 : Math.min(speed * 0.12, TAIL)) - st.len) * p.ease(10);
    st.size += ((p.down ? 0.7 : p.hover ? 1.6 : 1) - st.size) * p.ease(16);
    st.coma += ((p.hover ? 1 : 0) - st.coma) * p.ease(10);
    const [tail, coma, head] = el.children as HTMLCollectionOf<HTMLElement>;
    tail.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${st.angle + Math.PI}rad) scaleX(${st.len / TAIL})`;
    coma.style.transform = `translate(${p.x}px, ${p.y}px) scale(${st.coma})`;
    head.style.transform = `translate(${p.x}px, ${p.y}px) scale(${st.size})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute top-[-3px] left-0 h-1.5 origin-left rounded-full bg-linear-to-r from-current to-transparent" style={{ width: TAIL }} />
      <div className="absolute size-9 -translate-1/2 rounded-full bg-current opacity-20" />
      <div className="absolute size-2.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
