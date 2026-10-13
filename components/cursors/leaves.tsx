"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const LEAVES = 30;
/** October: maple red, rust, pumpkin, gold. */
const COLORS = ["#d9482b", "#b5462a", "#ec7a22", "#f2a93b", "#e3c04a"];
const LIFE = 4.5;

/** One leaf, stem down, in `currentColor`; exported so a page can draw it at rest. */
export function LeafArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-6 -9 12 21" className={`overflow-visible ${className}`} aria-hidden>
      <path d="M0-8.5C3.8-5.5 5.2-1 3.2 3.4 2 5.8.8 7 0 8.5-.8 7-2 5.8-3.2 3.4-5.2-1-3.8-5.5 0-8.5Z" fill="currentColor" />
      <path d="M0-7.5v18M0-3l2.4-2M0 0l2.9-2.2M0 3l2.4-1.6M0-3l-2.4-2M0 0l-2.9-2.2M0 3l-2.4-1.6" fill="none" stroke="rgb(60 20 0 / 0.35)" strokeWidth="0.55" strokeLinecap="round" />
    </svg>
  );
}

type Leaf = { x: number; y: number; vx: number; vy: number; turn: [number, number, number]; spin: [number, number, number]; age: number; sway: number; landed: boolean };

/**
 * Autumn leaves shake loose as you move and tumble down, turning over in the air. Over anything clickable they drift
 * down onto it and settle in a little pile along its top; leave it and they slide off. A click is a gust of wind that
 * blows every leaf away, the settled ones too.
 */
export function LeavesCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    leaves: Array.from({ length: LEAVES }, (): Leaf => ({ x: 0, y: 0, vx: 0, vy: 0, turn: [0, 0, 0], spin: [0, 0, 0], age: Infinity, sway: 0, landed: false })),
    next: 0,
    travel: 0,
    lx: 0,
    ly: 0,
    wind: 1,
    drift: 0,
    hover: null as Element | null,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const items = el.firstElementChild!.children as HTMLCollectionOf<HTMLElement>;
    if (!p.dt) {
      [st.lx, st.ly, st.travel] = [p.x, p.y, 0];
      for (const leaf of st.leaves) leaf.age = Infinity;
    }
    const drop = (x: number, y: number, vx: number) => {
      Object.assign(st.leaves[st.next], {
        x,
        y,
        vx,
        vy: 10 + Math.random() * 20,
        turn: [Math.random() * 360, Math.random() * 360, Math.random() * 360],
        spin: [(Math.random() - 0.5) * 520, (Math.random() - 0.5) * 420, (Math.random() - 0.5) * 260],
        age: 0,
        sway: Math.random() * 6,
        landed: false,
      });
      // Each leaf takes its own color, set once, so it never changes in the air.
      items[st.next].style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      st.next = (st.next + 1) % LEAVES;
    };
    const dx = p.x - st.lx;
    st.travel += Math.hypot(dx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    if (Math.abs(dx) > 1) st.wind = Math.sign(dx);
    const box = p.hover?.getBoundingClientRect();
    // Leaving a control, the pile slides off it.
    if (p.hover !== st.hover) {
      for (const leaf of st.leaves) if (leaf.landed) Object.assign(leaf, { landed: false, vy: 20, vx: (Math.random() - 0.5) * 40, age: Math.min(leaf.age, LIFE - 1.2) });
      st.hover = p.hover;
    }
    if (!p.reduced) {
      for (; st.travel > 26; st.travel -= 26) drop(p.x + (Math.random() - 0.5) * 12, p.y, dx * 2 + (Math.random() - 0.5) * 30);
      // Over a control, leaves drift down onto it from just above.
      st.drift -= p.dt;
      if (box && st.drift <= 0) {
        drop(box.left + 6 + Math.random() * Math.max(box.width - 12, 1), box.top - 46, (Math.random() - 0.5) * 20);
        st.drift = 0.35;
      }
      // A click is a gust: everything blows downwind and up, settled leaves included.
      if (p.down && !st.wasDown)
        for (const leaf of st.leaves)
          if (leaf.age < LIFE) {
            Object.assign(leaf, { landed: false, vx: leaf.vx + st.wind * (240 + Math.random() * 160), vy: leaf.vy - (90 + Math.random() * 80), age: Math.min(leaf.age, LIFE - 1.4) });
            leaf.spin = leaf.spin.map((v) => v * 2.2) as Leaf["spin"];
          }
    }
    st.wasDown = p.down;

    st.leaves.forEach((leaf, i) => {
      const item = items[i];
      if (leaf.age >= LIFE) {
        item.style.opacity = "0";
        return;
      }
      if (!leaf.landed) {
        leaf.age += p.dt;
        // Light, so it falls slowly, rocks side to side, and the air soon slows a gust.
        leaf.vy = Math.min(leaf.vy + 90 * p.dt, 85);
        leaf.vx *= 1 - Math.min(p.dt * 1.6, 1);
        const before = leaf.y;
        leaf.x += (leaf.vx + Math.sin(leaf.age * 2.6 + leaf.sway) * 34) * p.dt;
        leaf.y += leaf.vy * p.dt;
        leaf.turn = leaf.turn.map((a, k) => a + leaf.spin[k] * p.dt) as Leaf["turn"];
        // Falling past a hovered control's top edge, it lands there and lies flat.
        if (box && before < box.top - 3 && leaf.y >= box.top - 3 && leaf.x > box.left + 2 && leaf.x < box.right - 2) {
          Object.assign(leaf, { landed: true, y: box.top - 2 - Math.random() * 2, vx: 0, vy: 0 });
          leaf.turn = [74, 0, (Math.random() - 0.5) * 70];
        }
      }
      const fade = Math.min(leaf.age / 0.2, 1, (LIFE - leaf.age) / 0.6);
      item.style.opacity = String(Math.max(fade, 0));
      item.style.transform = `translate(${leaf.x}px, ${leaf.y}px) perspective(240px) rotateX(${leaf.turn[0]}deg) rotateY(${leaf.turn[1]}deg) rotateZ(${leaf.turn[2]}deg)`;
    });
    (el.lastElementChild as HTMLElement).style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div>
        {Array.from({ length: LEAVES }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 opacity-0">
            <LeafArt className="absolute h-[17px] w-2.5 -translate-1/2" />
          </div>
        ))}
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
