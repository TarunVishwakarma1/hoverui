"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COUNT = 40;
const COLORS = ["#ff5a5f", "#ffb400", "#00c2a8", "#3d7bff", "#b45cff"];

type Bit = { x: number; y: number; vx: number; vy: number; r: number; vr: number; life: number };

/** Sheds confetti as you move, pops a little over each control you reach, and throws a handful on click. */
export function ConfettiCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    bits: Array.from({ length: COUNT }, (): Bit => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, life: 0 })),
    next: 0,
    lastX: 0,
    lastY: 0,
    travel: 0,
    wasDown: false,
    hover: null as Element | null,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const toss = (speed: number) => {
      const b = st.bits[st.next];
      st.next = (st.next + 1) % COUNT;
      const a = Math.random() * Math.PI * 2;
      Object.assign(b, { x: p.x, y: p.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 120, r: Math.random() * 360, vr: (Math.random() - 0.5) * 720, life: 1 });
    };
    // Entering: bits frozen from the last visit would hang where the pointer left.
    if (!p.dt) {
      [st.lastX, st.lastY] = [p.x, p.y];
      for (const b of st.bits) b.life = 0;
    }
    st.travel += Math.hypot(p.x - st.lastX, p.y - st.lastY);
    [st.lastX, st.lastY] = [p.x, p.y];
    if (!p.reduced) {
      for (; st.travel > 14; st.travel -= 14) toss(60);
      if (p.down && !st.wasDown) for (let i = 0; i < 14; i++) toss(260);
      if (p.hover && p.hover !== st.hover) for (let i = 0; i < 6; i++) toss(160);
    }
    st.hover = p.hover;
    st.wasDown = p.down;

    const els = el.children as HTMLCollectionOf<HTMLElement>;
    st.bits.forEach((b, i) => {
      if (b.life > 0) {
        b.vy += 900 * p.dt;
        b.x += b.vx * p.dt;
        b.y += b.vy * p.dt;
        b.r += b.vr * p.dt;
        b.life -= p.dt * 1.1;
      }
      els[i].style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.r}deg)`;
      els[i].style.opacity = String(Math.max(b.life, 0));
    });
    els[COUNT].style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: COUNT }, (_, i) => (
        <div key={i} className="absolute h-1.5 w-2.5 -translate-1/2 opacity-0" style={{ background: COLORS[i % COLORS.length] }} />
      ))}
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
