"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const BLUE = "#3d7bff";
const jitter = (r: number) => (Math.random() - 0.5) * 2 * r;

/** A jagged bolt from (x0, y0) down to (x1, y1), with one short fork. */
function bolt(x0: number, y0: number, x1: number, y1: number) {
  const n = 9;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const wiggle = i && i < n ? jitter(14) * (1 - t * 0.5) : 0;
    return [x0 + (x1 - x0) * t + wiggle, y0 + (y1 - y0) * t];
  });
  const [fx, fy] = pts[4];
  const side = Math.sign(jitter(1)) || 1;
  return `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}M${fx} ${fy}L${fx + side * 14} ${fy + 16}L${fx + side * 12} ${fy + 30}`;
}

/** An electric spark at the pointer that crackles over anything clickable; a click calls down lightning from the top of its area. */
export function ZapCursor({ className = "" }: { className?: string }) {
  const s = useRef({ age: Infinity, crackle: 0, size: 1, wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [svg, spark] = el.children as HTMLCollectionOf<HTMLElement>;
    const [strike, flash, arcs] = svg.children as HTMLCollectionOf<SVGElement>;
    if (!p.dt) st.age = Infinity;
    if (p.down && !st.wasDown) {
      const top = Math.max(el.parentElement!.getBoundingClientRect().top, 0);
      strike.setAttribute("d", bolt(p.x + jitter(40), top, p.x, p.y));
      flash.setAttribute("cx", String(p.x));
      flash.setAttribute("cy", String(p.y));
      st.age = 0;
    }
    st.wasDown = p.down;
    st.age += p.dt;
    // The strike lights, flickers once and fades within about a third of a second.
    const lit = Math.max(0, 1 - st.age / 0.35);
    strike.style.opacity = String(!p.reduced && st.age > 0.06 && st.age < 0.1 ? lit * 0.3 : lit);
    flash.style.opacity = String(lit);
    flash.setAttribute("r", String(4 + (1 - lit) * 22));
    // Over a control: little arcs jump around the spark, redrawn every 70ms.
    st.crackle -= p.dt;
    if (p.hover && !p.reduced && st.crackle <= 0) {
      st.crackle = 0.07;
      let d = "";
      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2;
        const [cx, cy] = [p.x + Math.cos(a) * 7, p.y + Math.sin(a) * 7];
        d += `M${cx} ${cy}L${cx + Math.cos(a) * 5 + jitter(3)} ${cy + Math.sin(a) * 5 + jitter(3)}L${cx + Math.cos(a) * 10} ${cy + Math.sin(a) * 10}`;
      }
      arcs.setAttribute("d", d);
    }
    arcs.style.opacity = p.hover ? "1" : "0";
    st.size += ((p.down ? 0.7 : p.hover ? 1.6 : 1) - st.size) * p.ease(16);
    spark.style.transform = `translate(${p.x}px, ${p.y}px) scale(${st.size})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute top-0 left-0 size-px overflow-visible" fill="none" stroke={BLUE} strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="2.2" opacity="0" className="drop-shadow-[0_0_4px_rgb(61_123_255/0.8)]" />
        <circle strokeWidth="1.5" opacity="0" />
        <path strokeWidth="1.2" opacity="0" />
      </svg>
      <div className="absolute size-2 -translate-1/2 rounded-full shadow-[0_0_8px_2px_rgb(61_123_255/0.6)]" style={{ background: BLUE }} />
    </div>
  );
}
