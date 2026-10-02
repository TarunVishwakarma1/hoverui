"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Pip spots: top left, top right, middle left, centre, middle right, bottom left, bottom right. */
const SPOTS = [
  [7, 7],
  [17, 7],
  [7, 12],
  [12, 12],
  [17, 12],
  [7, 17],
  [17, 17],
];
/** Which spots each face lights, from 1 to 6. */
const FACES = [[], [3], [0, 6], [0, 3, 6], [0, 1, 5, 6], [0, 1, 3, 5, 6], [0, 1, 2, 4, 5, 6]];
const roll = (face: number) => {
  let next = face;
  while (next === face) next = 1 + Math.floor(Math.random() * 6);
  return next;
};

/** A die showing `face`; exported so a page can draw it at rest. */
export function DiceArt({ face = 5, className = "" }: { face?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {SPOTS.map(([cx, cy], i) => (
        <circle key={i} data-pip cx={cx} cy={cy} r="1.9" fill="currentColor" opacity={FACES[face].includes(i) ? 1 : 0} />
      ))}
    </svg>
  );
}

/** A die that tumbles as you move and settles when you stop; it lands on six over anything clickable and rolls while you press. */
export function DiceCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, lx: 0, ly: 0, travel: 0, face: 5, shown: 5, rot: 0, spin: 0, rolling: 0, bounce: 1, wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const tumble = () => {
      st.face = roll(st.face);
      st.spin += Math.random() < 0.5 ? 90 : -90;
    };
    if (!p.dt) [st.lx, st.ly, st.travel] = [p.x, p.y, 0];
    st.travel += Math.hypot(p.x - st.lx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    if (p.down) {
      // Shaken in the hand: a new face every 70ms.
      st.rolling += p.dt;
      if (st.rolling > 0.07 && !p.reduced) {
        st.rolling = 0;
        tumble();
      }
    } else if (p.hover) {
      if (st.face !== 6) [st.face, st.spin] = [6, st.spin + 90];
    } else if (st.travel > 28 && !p.reduced) tumble();
    if (st.travel > 28) st.travel = 0;
    if (st.wasDown && !p.down) st.bounce = 1.3;
    st.wasDown = p.down;
    st.bounce += (1 - st.bounce) * p.ease(10);
    st.rot += (st.spin - st.rot) * p.ease(14);
    st.x += (p.x + 16 - st.x) * p.ease(14);
    st.y += (p.y + 16 - st.y) * p.ease(14);
    const [die, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    die.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${st.rot}deg) scale(${st.bounce})`;
    if (st.face !== st.shown) {
      st.shown = st.face;
      die.querySelectorAll("[data-pip]").forEach((pip, i) => pip.setAttribute("opacity", FACES[st.face].includes(i) ? "1" : "0"));
    }
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <DiceArt className="absolute size-6 -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
