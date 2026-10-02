"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COUNT = 24;

/** Bubbles rise off your path, wobbling and growing until they pop; over anything clickable they stream out bigger, and a click pops them all. */
export function BubblesCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    bubbles: Array.from({ length: COUNT }, () => ({ x: 0, y: 0, vy: 0, size: 1, wobble: 0, age: Infinity, life: 1 })),
    next: 0,
    travel: 0,
    lx: 0,
    ly: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const els = el.children as HTMLCollectionOf<HTMLElement>;
    const blow = (size: number) => {
      Object.assign(st.bubbles[st.next], {
        x: p.x + (Math.random() - 0.5) * 10,
        y: p.y,
        vy: -(40 + Math.random() * 40),
        size,
        wobble: Math.random() * 6,
        age: 0,
        life: 1.2 + Math.random(),
      });
      st.next = (st.next + 1) % COUNT;
    };
    if (!p.dt) {
      [st.lx, st.ly, st.travel] = [p.x, p.y, 0];
      for (const b of st.bubbles) b.age = Infinity;
    }
    st.travel += Math.hypot(p.x - st.lx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    if (!p.reduced) {
      for (; st.travel > 20; st.travel -= 20) blow(0.6 + Math.random() * 0.8);
      if (p.hover && Math.random() < p.dt * 10) blow(1.2 + Math.random() * 0.8);
    }
    // A click pops every bubble still rising.
    if (p.down && !st.wasDown) for (const b of st.bubbles) b.life = Math.min(b.life, b.age + 0.12);
    st.wasDown = p.down;
    st.bubbles.forEach((b, i) => {
      b.age += p.dt;
      b.y += b.vy * p.dt;
      // The last 0.12s is the pop: a quick swell as it vanishes.
      const pop = Math.max(0, (b.age - (b.life - 0.12)) / 0.12);
      const x = b.x + Math.sin(b.age * 5 + b.wobble) * 4;
      els[i].style.transform = `translate(${x}px, ${b.y}px) scale(${b.size * (1 + b.age * 0.3) * (1 + pop * 0.4)})`;
      els[i].style.opacity = String(b.age < b.life ? 1 - pop : 0);
    });
    els[COUNT].style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.down ? 0.7 : p.hover ? 1.5 : 1})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: COUNT + 1 }, (_, i) => (
        <div key={i} className={`absolute size-3 -translate-1/2 rounded-full border border-current ${i < COUNT ? "opacity-0" : ""}`}>
          <div className="absolute top-0.5 left-0.5 size-1 rounded-full bg-current opacity-60" />
        </div>
      ))}
    </div>
  );
}
