"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const SKY = 14;
/** Paper colors: saffron, coral, marigold, rose. */
const PAPER = ["#ff8a3d", "#ff5f6d", "#ffb347", "#f7598f"];
const LIFE = 7;

/** A paper sky lantern, its flame in `data-flame`; exported so a page can draw one at rest. */
export function LanternArt({ color = PAPER[0], className = "" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 16 20" className={`overflow-visible ${className}`} aria-hidden>
      <path d="M1.8 3.2Q8 .2 14.2 3.2L12.6 17Q8 18.6 3.4 17Z" fill={color} stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M5.7 2.2 6.4 17.6M10.3 2.2 9.6 17.6" fill="none" stroke="rgb(110 30 0 / 0.3)" strokeWidth="0.6" />
      <ellipse cx="8" cy="12" rx="4.6" ry="5.4" fill="rgb(255 236 160 / 0.5)" />
      <ellipse data-flame cx="8" cy="15.2" rx="1.4" ry="2.2" fill="#fff6c2" style={{ transformOrigin: "8px 17px" }} />
      <ellipse cx="8" cy="17.3" rx="4.4" ry="0.9" fill="none" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}

/**
 * A paper sky lantern held just above the pointer, its flame flickering. Click to let it go: it rises, sways and
 * drifts off, shrinking into the distance, while a new one lights in your hand; hold to send them up one after
 * another. Over anything clickable the lantern in hand glows brighter and tugs upward.
 */
export function LanternCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    x: 0,
    y: 0,
    vx: 0,
    t: 0,
    lit: 1,
    hand: 0,
    due: 0,
    sky: Array.from({ length: SKY }, () => ({ x: 0, y: 0, vy: 0, age: Infinity, sway: 0, color: 0 })),
    next: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    const [sky, hand, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    const release = () => {
      Object.assign(st.sky[st.next], { x: st.x, y: st.y, vy: -(26 + Math.random() * 14), age: 0, sway: Math.random() * 6, color: st.hand });
      const lantern = sky.children[st.next] as HTMLElement;
      (lantern.querySelector("path") as SVGPathElement).setAttribute("fill", PAPER[st.hand]);
      st.next = (st.next + 1) % SKY;
      // The next one lights in your hand, in the next color.
      [st.hand, st.lit] = [(st.hand + 1) % PAPER.length, 0];
      (hand.querySelector("path") as SVGPathElement).setAttribute("fill", PAPER[st.hand]);
    };
    if (!p.reduced && p.down) {
      st.due -= p.dt;
      if (!st.wasDown || st.due <= 0) {
        release();
        st.due = 0.32;
      }
    }
    st.wasDown = p.down;
    st.lit = Math.min(st.lit + p.dt * 3, 1);

    // The lantern in hand hangs from the pointer on a loose spring, tugging up harder over a control.
    const [tx, ty] = [p.x, p.y - (p.hover ? 24 : 18)];
    if (p.reduced || !p.dt) [st.x, st.y, st.vx] = [tx, ty, 0];
    else {
      st.vx += ((tx - st.x) * 90 - st.vx * 9) * p.dt;
      st.x += st.vx * p.dt;
      st.y += (ty - st.y) * p.ease(14);
    }
    const flicker = (k: number) => (p.reduced ? 1 : 0.85 + Math.sin(st.t * 17 + k) * 0.08 + Math.sin(st.t * 7.3 + k * 2) * 0.07);
    const glow = p.hover ? 9 : 5;
    hand.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${Math.max(-18, Math.min(18, -st.vx * 0.04))}deg) scale(${st.lit})`;
    hand.style.filter = `drop-shadow(0 0 ${glow * flicker(0)}px rgb(255 150 50 / 0.85))`;
    (hand.querySelector("[data-flame]") as SVGElement).style.scale = `${flicker(0)}`;

    st.sky.forEach((l, i) => {
      const lantern = sky.children[i] as HTMLElement;
      if (l.age >= LIFE) {
        lantern.style.opacity = "0";
        return;
      }
      l.age += p.dt;
      // Rising a little faster as the warm air lifts it, swaying, smaller with distance, fading at the end.
      l.vy -= 4 * p.dt;
      l.y += l.vy * p.dt;
      l.x += Math.sin(l.age * 1.3 + l.sway) * 12 * p.dt;
      const far = 1 - Math.min(l.age / LIFE, 1) * 0.45;
      lantern.style.transform = `translate(${l.x}px, ${l.y}px) rotate(${Math.sin(l.age * 1.3 + l.sway) * 7}deg) scale(${far})`;
      lantern.style.opacity = String(Math.min(1, (LIFE - l.age) / 2));
      lantern.style.filter = `drop-shadow(0 0 ${6 * flicker(i)}px rgb(255 150 50 / 0.75))`;
    });
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div>
        {Array.from({ length: SKY }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 opacity-0">
            <LanternArt className="absolute h-5 w-4 -translate-1/2" />
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-0">
        <LanternArt className="absolute h-5 w-4 -translate-1/2" />
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
