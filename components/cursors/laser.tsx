"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const FUR = "#ff9f43";
const LEGS = [11, 15, 27, 31];

/** A cat side on, facing right, paws on the bottom edge: legs in `data-leg`, tail in `data-tail`, eyes in `data-open` and `data-shut`; exported so a page can draw it at rest. */
export function CatArt({ className = "" }: { className?: string }) {
  const limb = (d: string) => (
    <>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" />
      <path d={d} fill="none" stroke={FUR} strokeWidth="2.8" strokeLinecap="round" />
    </>
  );
  return (
    <svg viewBox="0 0 48 32" className={`overflow-visible ${className}`} aria-hidden>
      <g data-tail style={{ transformOrigin: "8px 18px" }}>
        {limb("M8 18C3 17 1 12 3.5 8")}
      </g>
      {LEGS.map((x) => (
        <g key={x} data-leg style={{ transformOrigin: `${x}px 22px` }}>
          {limb(`M${x} 22v8`)}
        </g>
      ))}
      <ellipse cx="20" cy="19" rx="13" ry="6.5" fill={FUR} stroke="currentColor" strokeWidth="1" />
      <path d="M16 13.2v4M20 12.6v4.4M24 13.2v4" stroke="#d9771c" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M29.4 8.6 30.2 2.4l3.8 4M35 6.4l3.8-4 .8 6.2" fill={FUR} stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="34.5" cy="12" r="6.4" fill={FUR} stroke="currentColor" strokeWidth="1" />
      <g data-open>
        <circle cx="33" cy="11" r="1.1" fill="#111" />
        <circle cx="37.2" cy="11" r="1.1" fill="#111" />
      </g>
      <path data-shut d="M31.8 11.4h2.4M36 11.4h2.4" stroke="#111" strokeWidth="0.9" strokeLinecap="round" style={{ display: "none" }} />
      <path d="M39.6 13.2l1.1.6-1.1.6Z" fill="#ff7a9a" />
    </svg>
  );
}

/**
 * The pointer is a laser dot, and a cat chases it. It runs after the dot, creeps up and wiggles when the dot holds
 * still, then pounces; over anything clickable it sits and bats at it. A click makes it pounce at once. Leave the dot
 * still and the cat sits, then curls up and naps until the dot moves again.
 */
export function LaserCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    lx: 0,
    ly: 0,
    face: 1,
    t: 0,
    mode: "chase" as "chase" | "crouch" | "pounce" | "rest",
    timer: 0,
    still: 0,
    stride: 0,
    hop: 0,
    from: [0, 0],
    to: [0, 0],
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    if (!p.dt) [st.x, st.y, st.vx, st.vy, st.lx, st.ly, st.mode] = [p.x - 90, p.y + 6, 0, 0, p.x, p.y, "chase"];
    const dotSpeed = p.dt ? Math.hypot(p.x - st.lx, p.y - st.ly) / p.dt : 0;
    [st.lx, st.ly] = [p.x, p.y];
    st.still = dotSpeed < 30 ? st.still + p.dt : 0;
    // It means to stand just short of the dot, paws under it.
    const [tx, ty] = [p.x - st.face * 14, p.y + 6];
    const dist = Math.hypot(tx - st.x, ty - st.y);
    const pounce = () => {
      [st.mode, st.timer, st.from, st.to] = ["pounce", 0, [st.x, st.y], [tx, ty]];
    };
    const click = p.down && !st.wasDown;
    st.wasDown = p.down;

    if (p.reduced) [st.x, st.y, st.mode] = [tx, ty, "rest"];
    else if (st.mode === "pounce") {
      st.timer += p.dt / 0.38;
      const k = Math.min(st.timer, 1);
      const e = 1 - (1 - k) ** 2;
      st.x = st.from[0] + (st.to[0] - st.from[0]) * e;
      st.y = st.from[1] + (st.to[1] - st.from[1]) * e;
      st.hop = -Math.sin(Math.PI * k) * 26;
      if (k === 1) [st.mode, st.hop, st.vx, st.vy] = ["rest", 0, 0, 0];
    } else if (click && dist < 260) pounce();
    else if (st.mode === "crouch") {
      // Creeping: still, butt wiggling, until it springs or the dot gets away.
      st.timer -= p.dt;
      if (dist > 110) st.mode = "chase";
      else if (st.timer <= 0) pounce();
    } else if (st.mode === "rest") {
      if (dist > 60 || dotSpeed > 400) st.mode = "chase";
    } else {
      const [dx, dy] = [tx - st.x, ty - st.y];
      const want = Math.min(dist * 5, 560);
      st.vx += ((dx / (dist || 1)) * want - st.vx) * p.ease(6);
      st.vy += ((dy / (dist || 1)) * want - st.vy) * p.ease(6);
      st.x += st.vx * p.dt;
      st.y += st.vy * p.dt;
      if (dist < 70 && dotSpeed < 60) [st.mode, st.timer] = ["crouch", 0.5 + Math.random() * 0.5];
    }
    if (st.mode === "chase" && Math.abs(st.vx) > 30) st.face = Math.sign(st.vx);

    const [cat, zzz, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    const speed = st.mode === "chase" ? Math.hypot(st.vx, st.vy) : 0;
    const asleep = st.mode === "rest" && st.still > 5 && !p.hover;
    const crouch = st.mode === "crouch";
    st.stride += p.dt * speed * 0.08;
    const wiggle = crouch && !p.reduced ? Math.sin(st.t * 28) * 1.5 : 0;
    cat.style.transform = `translate(${st.x + wiggle}px, ${st.y + st.hop}px) scale(${st.face}, ${asleep ? 0.82 : crouch ? 0.88 : 1})`;
    const art = cat.firstElementChild as SVGSVGElement;
    // Running, the legs swing in pairs; over a control, sitting by the dot, a front paw bats at it.
    const bat = st.mode === "rest" && p.hover && !p.reduced ? Math.max(0, Math.sin(st.t * 7)) * -70 : 0;
    art.querySelectorAll<SVGElement>("[data-leg]").forEach((leg, i) => {
      leg.style.rotate = `${i === 3 ? bat : speed > 20 ? Math.sin(st.stride + (i % 2) * Math.PI) * 28 : 0}deg`;
      leg.style.display = asleep ? "none" : "";
    });
    (art.querySelector("[data-tail]") as SVGElement).style.rotate = p.reduced ? "" : `${Math.sin(st.t * (crouch ? 9 : 3)) * (crouch ? 18 : 10)}deg`;
    (art.querySelector("[data-open]") as SVGElement).style.display = asleep ? "none" : "";
    (art.querySelector("[data-shut]") as SVGElement).style.display = asleep ? "" : "none";
    // Asleep: a slow Zz drifting up off its head.
    const drift = (st.t * 0.6) % 1;
    zzz.style.transform = `translate(${st.x + st.face * 10}px, ${st.y - 24 - drift * 14}px)`;
    zzz.style.opacity = asleep ? String(p.reduced ? 1 : 1 - drift) : "0";
    // Over a control the hand holding the laser trembles.
    const shake = p.hover && !p.reduced ? [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2] : [0, 0];
    dot.style.transform = `translate(${p.x + shake[0]}px, ${p.y + shake[1]}px) scale(${p.down ? 0.8 : p.hover ? 1.3 : 1})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute top-0 left-0">
        <CatArt className="absolute h-[30px] w-[45px] -translate-x-1/2 -translate-y-full" />
      </div>
      <div className="mono-label absolute top-0 left-0 opacity-0">Zz</div>
      <div className="absolute size-2 -translate-1/2 rounded-full bg-[#ff2d2d] shadow-[0_0_6px_#ff2d2d,0_0_14px_#ff2d2d]" />
    </div>
  );
}
