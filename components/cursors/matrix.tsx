"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COUNT = 36;
const LIFE = 1.4;
const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789";
const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/** Green code rains off your path, every glyph flickering as it falls; over anything clickable it pours, and a click drops a burst. */
export function MatrixCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    drops: Array.from({ length: COUNT }, () => ({ x: 0, y: 0, vy: 0, age: Infinity, tick: 0 })),
    next: 0,
    travel: 0,
    lx: 0,
    ly: 0,
    head: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const els = el.children as HTMLCollectionOf<HTMLElement>;
    const drop = (x: number, y: number, vy: number) => {
      Object.assign(st.drops[st.next], { x, y, vy, age: 0, tick: -1 });
      st.next = (st.next + 1) % COUNT;
    };
    if (!p.dt) {
      [st.lx, st.ly, st.travel] = [p.x, p.y, 0];
      for (const d of st.drops) d.age = Infinity;
    }
    st.travel += Math.hypot(p.x - st.lx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    if (!p.reduced) {
      for (; st.travel > 14; st.travel -= 14) drop(p.x, p.y, 40);
      // Pouring: a column of glyphs on a 12px grid under the pointer.
      if (p.hover && Math.random() < p.dt * 18) drop(p.x + Math.round((Math.random() - 0.5) * 2) * 12, p.y + 10, 90);
      if (p.down && !st.wasDown) for (let i = 0; i < 10; i++) drop(p.x + (i - 4.5) * 12, p.y, 120 + Math.random() * 80);
    }
    st.wasDown = p.down;
    st.drops.forEach((d, i) => {
      d.age += p.dt;
      d.y += d.vy * p.dt;
      // A new glyph about twelve times a second.
      const tick = Math.floor(d.age * 12);
      if (tick !== d.tick && d.age < LIFE) [d.tick, els[i].textContent] = [tick, glyph()];
      els[i].style.transform = `translate(${d.x}px, ${d.y}px)`;
      els[i].style.opacity = String(Math.max(0, 1 - d.age / LIFE));
    });
    const head = els[COUNT];
    st.head += p.dt;
    if (!p.reduced && st.head > 0.06) [st.head, head.textContent] = [0, glyph()];
    head.style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.down ? 0.8 : p.hover ? 1.4 : 1})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} font-mono text-[13px] leading-none ${className}`}>
      {Array.from({ length: COUNT }, (_, i) => (
        <span key={i} className="absolute -translate-1/2 text-[#12b85a] opacity-0 [text-shadow:0_0_6px_rgb(18_184_90/0.6)]" />
      ))}
      <span className="absolute -translate-1/2 font-bold [text-shadow:0_0_8px_rgb(18_184_90/0.9)]">ｱ</span>
    </div>
  );
}
