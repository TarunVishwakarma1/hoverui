"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const SPARKS = 160;
const SHELLS = 3;
const COLORS = ["#ff4d6d", "#ffd23f", "#3dd6ff", "#9b5cff", "#4dff9a", "#ff8a1f"];
/** The shells, in turn: a full peony, one clean ring, a drooping gold willow, and a peony whose sparks crackle. */
const KINDS = ["peony", "ring", "willow", "crackle"] as const;

type Spark = { x: number; y: number; vx: number; vy: number; age: number; life: number; color: string; fall: number; drag: number; crackle: boolean };

/**
 * Fireworks on click. Press to light the fuse, hold to pack a bigger shell, and let go: it climbs from the bottom of
 * the area to the pointer and bursts there, each shell a different kind in turn: a peony, a clean ring, a drooping
 * gold willow, a crackling one. Entering anything clickable pops a little ring of sparks; over it, a sparkler fizzes.
 */
export function FireworksCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    charge: 0,
    next: 0,
    nextShell: 0,
    kind: 0,
    hover: null as Element | null,
    shells: Array.from({ length: SHELLS }, () => ({ x: 0, from: 0, to: 0, age: Infinity, size: 1, color: COLORS[0], kind: KINDS[0] as (typeof KINDS)[number] })),
    sparks: Array.from({ length: SPARKS }, (): Spark => ({ x: 0, y: 0, vx: 0, vy: 0, age: Infinity, life: 1, color: COLORS[0], fall: 160, drag: 1.4, crackle: false })),
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const spark = (x: number, y: number, vx: number, vy: number, life: number, color: string, more: Partial<Spark> = {}) => {
      Object.assign(st.sparks[st.next], { x, y, vx, vy, age: 0, life, color, fall: 160, drag: 1.4, crackle: false, ...more });
      st.next = (st.next + 1) % SPARKS;
    };
    const ring = (x: number, y: number, count: number, speed: number, life: number, color?: string) => {
      for (let j = 0; j < count; j++) {
        const a = (j / count) * Math.PI * 2;
        spark(x, y, Math.cos(a) * speed, Math.sin(a) * speed, life, color ?? COLORS[j % COLORS.length]);
      }
    };
    // Holding packs the shell; letting go launches it from the bottom of the visible area.
    if (p.down) st.charge = Math.min(st.charge + p.dt, 1.2);
    if (st.wasDown && !p.down && !p.reduced) {
      const area = el.parentElement!.getBoundingClientRect();
      Object.assign(st.shells[st.nextShell], {
        x: p.x,
        from: Math.max(Math.min(area.bottom, innerHeight), p.y + 40),
        to: p.y,
        age: 0,
        size: 1 + st.charge * 1.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        kind: KINDS[st.kind],
      });
      st.kind = (st.kind + 1) % KINDS.length;
      st.nextShell = (st.nextShell + 1) % SHELLS;
    }
    if (!p.down) st.charge = 0;
    st.wasDown = p.down;
    // Each control you enter pops a small ring; while you stay, a sparkler fizzes.
    if (p.hover !== st.hover) {
      if (p.hover && !p.reduced) ring(p.x, p.y, 10, 70, 0.45);
      st.hover = p.hover;
    }
    if (p.hover && !p.reduced && Math.random() < p.dt * 30) {
      const a = Math.random() * Math.PI * 2;
      const v = 50 + Math.random() * 60;
      spark(p.x, p.y, Math.cos(a) * v, Math.sin(a) * v, 0.28, "#ffd23f");
    }

    const [shells, sparks, fuse, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    st.shells.forEach((shell, i) => {
      const before = shell.age;
      shell.age += p.dt;
      const k = Math.min(shell.age / 0.45, 1);
      const node = shells.children[i] as HTMLElement;
      node.style.transform = `translate(${shell.x}px, ${shell.from + (shell.to - shell.from) * (1 - (1 - k) ** 2)}px)`;
      node.style.opacity = k < 1 ? "1" : "0";
      if (!(before < 0.45 && shell.age >= 0.45)) return;
      // The burst, by kind; a bigger shell throws more, and further.
      const big = Math.sqrt(shell.size);
      if (shell.kind === "ring") ring(shell.x, shell.to, Math.round(22 * shell.size), 130 * big, 1.1, shell.color);
      else
        for (let j = 0, count = Math.round(24 * shell.size); j < count; j++) {
          const a = (j / count) * Math.PI * 2 + Math.random() * 0.2;
          const willow = shell.kind === "willow";
          const v = (willow ? 80 + Math.random() * 50 : 110 + Math.random() * 70) * big;
          spark(shell.x, shell.to, Math.cos(a) * v, Math.sin(a) * v, willow ? 2 + Math.random() * 0.6 : 1.1 + Math.random() * 0.5, willow ? "#ffc94d" : Math.random() < 0.2 ? "#fff6d6" : shell.color, {
            fall: willow ? 120 : 160,
            drag: willow ? 2.2 : 1.4,
            crackle: shell.kind === "crackle",
          });
        }
    });
    st.sparks.forEach((sp, i) => {
      const before = sp.age;
      sp.age += p.dt;
      sp.vx *= 1 - Math.min(p.dt * sp.drag, 1);
      sp.vy = sp.vy * (1 - Math.min(p.dt * sp.drag, 1)) + sp.fall * p.dt;
      sp.x += sp.vx * p.dt;
      sp.y += sp.vy * p.dt;
      // A crackling spark splits into white pops halfway through.
      if (sp.crackle && before < 0.55 && sp.age >= 0.55) {
        sp.life = 0;
        for (let j = 0; j < 2; j++) spark(sp.x, sp.y, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120, 0.25, "#fff6d6");
      }
      const life = Math.max(0, 1 - sp.age / sp.life);
      // The last third twinkles out.
      const twinkle = life < 0.33 && Math.random() < 0.4 ? 0.2 : 1;
      const node = sparks.children[i] as HTMLElement;
      node.style.transform = `translate(${sp.x}px, ${sp.y}px)`;
      node.style.opacity = String(life * twinkle);
      node.style.background = sp.color;
      node.style.boxShadow = `0 0 5px ${sp.color}`;
    });
    // While held, a ring at the pointer shows how big the shell is getting.
    fuse.style.transform = `translate(${p.x}px, ${p.y}px) scale(${0.4 + st.charge})`;
    fuse.style.opacity = p.down ? "0.8" : "0";
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div>
        {Array.from({ length: SHELLS }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 opacity-0">
            <div className="absolute top-0 left-0 h-6 w-0.5 -translate-x-1/2 rounded-full bg-linear-to-b from-[#ffe7a8] to-transparent" />
            <div className="absolute size-1.5 -translate-1/2 rounded-full bg-[#fff6d6] shadow-[0_0_6px_#ffd23f]" />
          </div>
        ))}
      </div>
      <div>
        {Array.from({ length: SPARKS }, (_, i) => (
          <div key={i} className="absolute size-[3px] -translate-1/2 rounded-full opacity-0" />
        ))}
      </div>
      <div className="absolute size-8 -translate-1/2 rounded-full border border-dashed border-current opacity-0" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
