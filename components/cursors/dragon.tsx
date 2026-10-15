"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const FLAMES = 34;
const SCORCH = 4;
/** The art's size in px, and where its mouth is in the art's own units (44 by 30). */
const [W, H] = [48, 32];
const MOUTH = [42.4, 11.2];
const RED = "#e2452f";

/** A little dragon facing right, its wings in `data-wing` (back, then front); exported so a page can draw it at rest. */
export function DragonArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 30" className={`overflow-visible ${className}`} aria-hidden>
      <path data-wing d="M20 13C17 7 18 2 23 .5c.5 2.5 2 4.5 4 5.5-1.5 1-2 2.5-1.4 4-2.1 0-3.8 1.2-5.6 3Z" fill="#a9301f" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" style={{ transformOrigin: "20px 13px" }} />
      <path d="M12 17c-4 0-6 2-7.5 4-1 1.4-2.3 1.6-3.1.6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M12 17c-4 0-6 2-7.5 4-1 1.4-2.3 1.6-3.1.6" fill="none" stroke={RED} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M.2 21.2 2.6 19.6l-.4 3.2Z" fill="#f6c341" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" />
      <path d="M24.5 20.5l1 3.2 1.6.4M15.5 21l-.5 3.2 1.6.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 17.5c1-4.5 7-6.5 13-5.9 4 .4 6.5 2.9 5.6 6-1 3.2-7.6 4.8-13.6 4.2-3-.3-5.2-1.8-5-4.3Z" fill={RED} stroke="currentColor" strokeWidth="0.9" />
      <path d="M14 20.6c4 1 10 .6 14-1.8" fill="none" stroke="#ffc75a" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 11.8l1.2-2 1 2.2ZM21 11.3l1.2-2 1 2.2ZM25 11.6l1.1-1.8.9 2Z" fill="#f6c341" />
      <path d="M27.4 14.2c1.2-3.8 3.6-6.2 7-6.8 3.2-.6 6.6.4 8.2 2.2.8 1 0 2.2-1.4 2.4l-3.6.4c-2.6.4-6 2-8 3.8Z" fill={RED} stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M33.6 7.6 31.6 4 35 6.6ZM36 7.1l-.6-3.5 2.2 3Z" fill="#f6d27a" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
      <circle cx="37.2" cy="9.4" r="1.15" fill="#fff" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="37.6" cy="9.4" r="0.55" fill="#111" />
      <circle cx="41.6" cy="9.7" r="0.35" fill="#111" />
      <path d="M38.6 11.6 42 11.2" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
      <path data-wing d="M21 13c-2.5-6.5-.5-11.5 5.5-12.4-.1 2.8 1.3 5 3.5 6-1.8 1.2-2.2 2.8-1.6 4.4-2.6-.2-5.4.6-7.4 2Z" fill="#ff6b45" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" style={{ transformOrigin: "21px 13px" }} />
      <path d="M21.5 12 24.5 3M23 12l4.6-5.6" fill="none" stroke="rgb(0 0 0 / 0.2)" strokeWidth="0.5" />
    </svg>
  );
}

/**
 * A little dragon flying at the pointer's shoulder, wings beating faster the faster it flies, turning about when you
 * cross in front of it. Over anything clickable it breathes embers at it and the control glows hot; a click and it
 * breathes fire at the pointer, leaving a scorch mark that slowly fades.
 */
export function DragonCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    x: 0,
    y: 0,
    face: 1,
    t: 0,
    flap: 0,
    tilt: 0,
    heat: 0,
    ember: 0,
    flames: Array.from({ length: FLAMES }, () => ({ x: 0, y: 0, vx: 0, vy: 0, age: Infinity, life: 0.5 })),
    scorch: Array.from({ length: SCORCH }, () => ({ x: 0, y: 0, age: Infinity })),
    next: 0,
    nextScorch: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    if (!p.dt) {
      [st.x, st.y] = [p.x - 30, p.y - 26];
      for (const f of [...st.flames, ...st.scorch]) f.age = Infinity;
    }
    // It flies off the pointer's shoulder, and comes about when the pointer crosses in front of it.
    if ((p.x - st.x) * st.face < -18) st.face = -st.face;
    const [x0, y0] = [st.x, st.y];
    st.x += (p.x - 30 * st.face - st.x) * p.ease(3.2);
    st.y += (p.y - 26 - st.y) * p.ease(3.2);
    const [vx, vy] = p.dt ? [(st.x - x0) / p.dt, (st.y - y0) / p.dt] : [0, 0];
    st.tilt += (Math.max(-16, Math.min(16, vy * 0.05)) - st.tilt) * p.ease(8);
    if (!p.reduced) st.flap += p.dt * (10 + Math.min(Math.hypot(vx, vy) * 0.03, 12));
    const bob = p.reduced ? 0 : Math.sin(st.t * 2.2) * 2.5;

    // Its mouth, in page coordinates: the art's own point, flipped with the dragon and turned with its tilt.
    const a = (st.tilt * Math.PI) / 180;
    const [lx, ly] = [(MOUTH[0] - 22) * (W / 44) * st.face, (MOUTH[1] - 15) * (H / 30)];
    const mouth = { x: st.x + lx * Math.cos(a) - ly * Math.sin(a), y: st.y + bob + lx * Math.sin(a) + ly * Math.cos(a) };
    const breathe = (tx: number, ty: number, count: number, speed: number, spread: number) => {
      const aim = Math.atan2(ty - mouth.y, tx - mouth.x);
      for (let i = 0; i < count; i++) {
        const dir = aim + (Math.random() - 0.5) * spread;
        const v = speed * (0.7 + Math.random() * 0.5);
        Object.assign(st.flames[st.next], { x: mouth.x, y: mouth.y, vx: Math.cos(dir) * v, vy: Math.sin(dir) * v, age: 0, life: 0.38 + Math.random() * 0.25 });
        st.next = (st.next + 1) % FLAMES;
      }
    };
    if (!p.reduced) {
      // A click: fire at the pointer, and a scorch where it lands.
      if (p.down && !st.wasDown) {
        breathe(p.x, p.y, 26, 320, 0.5);
        Object.assign(st.scorch[st.nextScorch], { x: p.x, y: p.y, age: -0.12 });
        st.nextScorch = (st.nextScorch + 1) % SCORCH;
      }
      // Over a control, a steady breath of embers at it.
      st.ember -= p.dt;
      if (p.hover && st.ember <= 0) {
        breathe(p.x, p.y, 2, 140, 0.4);
        st.ember = 0.12;
      }
    }
    st.wasDown = p.down;
    st.heat += ((p.hover ? 1 : 0) - st.heat) * p.ease(4);

    const [glow, scorch, flames, dragon, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    // The hovered control glows hot, pulsing, drawn over it and never touching it.
    const box = p.hover?.getBoundingClientRect();
    glow.style.opacity = String(st.heat);
    if (box) {
      const pulse = p.reduced ? 1 : 0.8 + Math.sin(st.t * 9) * 0.2;
      Object.assign(glow.style, {
        transform: `translate(${box.left}px, ${box.top}px)`,
        width: `${box.width}px`,
        height: `${box.height}px`,
        boxShadow: `0 0 0 1px rgb(255 120 40 / 0.7), 0 0 ${14 * pulse}px ${3 * pulse}px rgb(255 100 30 / 0.5), inset 0 0 10px rgb(255 140 40 / 0.35)`,
      });
    }
    st.scorch.forEach((mark, i) => {
      mark.age += p.dt;
      const node = scorch.children[i] as HTMLElement;
      node.style.transform = `translate(${mark.x}px, ${mark.y}px)`;
      node.style.opacity = String(mark.age < 0 || mark.age > 2.5 ? 0 : 1 - mark.age / 2.5);
    });
    st.flames.forEach((f, i) => {
      const node = flames.children[i] as HTMLElement;
      if (f.age >= f.life) {
        node.style.opacity = "0";
        return;
      }
      f.age += p.dt;
      // Flame slows in the air and rises as it burns out.
      f.vx *= 1 - Math.min(p.dt * 2.5, 1);
      f.vy = f.vy * (1 - Math.min(p.dt * 2.5, 1)) - 90 * p.dt;
      f.x += f.vx * p.dt;
      f.y += f.vy * p.dt;
      const k = f.age / f.life;
      node.style.transform = `translate(${f.x}px, ${f.y}px) scale(${0.6 + k * 1.8})`;
      node.style.opacity = String(Math.max(0, 1 - k));
    });
    dragon.style.transform = `translate(${st.x}px, ${st.y + bob}px) rotate(${st.tilt}deg) scale(${st.face}, 1)`;
    dragon.querySelectorAll<SVGElement>("[data-wing]").forEach((wing, i) => (wing.style.rotate = `${p.reduced ? 10 : 10 + Math.sin(st.flap - i * 0.4) * 30 * (i ? 1 : 0.85)}deg`));
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute top-0 left-0 rounded-md opacity-0" />
      <div>
        {Array.from({ length: SCORCH }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 size-9 -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(50_30_20/0.5),rgb(50_30_20/0.22)_40%,transparent_70%)] opacity-0" />
        ))}
      </div>
      <div>
        {Array.from({ length: FLAMES }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 size-2.5 -translate-1/2 rounded-full bg-[radial-gradient(circle,#fff6c8,#ffb02e_40%,rgb(255_80_20/0)_72%)] opacity-0" />
        ))}
      </div>
      <div className="absolute top-0 left-0">
        <DragonArt className="absolute h-8 w-12 -translate-1/2" />
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
