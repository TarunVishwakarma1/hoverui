"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COINS = 8;
const POPS = 6;

/** A gold arcade coin, face on, its edge marked `data-face`; exported so a page can draw one at rest. */
export function CoinArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <circle cx="10" cy="10" r="9" fill="#f6c63f" stroke="currentColor" strokeWidth="1" />
      <circle cx="10" cy="10" r="6.4" fill="none" stroke="#c88a10" strokeWidth="1.2" />
      <rect x="8.9" y="6" width="2.2" height="8" rx="1" fill="#c88a10" />
      <path d="M4.8 7.2a5.8 5.8 0 0 1 2.9-2.6" fill="none" stroke="#fff4c0" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** The "?" block that hangs over a control you could bump, as in an arcade platformer; exported so a page can draw one at rest. */
export function BlockArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2" fill="#f6b73c" stroke="currentColor" />
      <path d="M5.6 5.8a2.4 2.4 0 1 1 3.3 2.2c-.7.3-.9.7-.9 1.4v.4" fill="none" stroke="#7a4a08" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="12" r="1" fill="#7a4a08" />
      {[3, 13].flatMap((x) => [3, 13].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="0.7" fill="#7a4a08" />))}
    </svg>
  );
}

/**
 * An arcade coin on the pointer, turning slowly. Click anywhere and a coin pops out, spinning, with a "+1"; the score
 * keeps count beside the pointer, and every tenth coin is a "1-UP". Over anything clickable a "?" block hangs above
 * it, and a click bumps the control from below, coin first, the way a block gets bumped.
 */
export function CoinCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    t: 0,
    score: 0,
    bump: 0,
    coins: Array.from({ length: COINS }, () => ({ x: 0, y: 0, vy: 0, age: Infinity })),
    pops: Array.from({ length: POPS }, () => ({ x: 0, y: 0, age: Infinity })),
    next: 0,
    nextPop: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    const box = p.hover?.getBoundingClientRect();
    const [coins, pops, block, held, count] = el.children as HTMLCollectionOf<HTMLElement>;
    if (p.down && !st.wasDown) {
      // Out of the top of the block over the control you bumped, or out of the pointer.
      const [x, y] = box ? [box.left + box.width / 2, box.top - 22] : [p.x, p.y - 8];
      Object.assign(st.coins[st.next], { x, y, vy: p.reduced ? 0 : -430, age: 0 });
      st.next = (st.next + 1) % COINS;
      st.score += 1;
      Object.assign(st.pops[st.nextPop], { x, y: y - 18, age: 0 });
      const pop = pops.children[st.nextPop] as HTMLElement;
      pop.textContent = st.score % 10 === 0 ? "1-UP" : "+1";
      pop.style.color = st.score % 10 === 0 ? "#2fa84f" : "";
      st.nextPop = (st.nextPop + 1) % POPS;
      st.bump = 1;
      // The bump: the control jumps a few px and drops back, the block's job in every platformer.
      if (box && !p.reduced) p.hover?.animate([{ translate: "0 0" }, { translate: "0 -5px" }, { translate: "0 0" }], { duration: 200, easing: "cubic-bezier(0.3, 0, 0.3, 1)" });
    }
    st.wasDown = p.down;
    st.bump = Math.max(st.bump - p.dt * 5, 0);

    st.coins.forEach((coin, i) => {
      coin.age += p.dt;
      coin.vy += 1500 * p.dt;
      coin.y += coin.vy * p.dt;
      const node = coins.children[i] as HTMLElement;
      // Spinning on its edge as it flies, then gone in a flash at the top of its arc.
      const life = coin.age / 0.5;
      node.style.opacity = life < 1 ? "1" : "0";
      if (life >= 1) return;
      node.style.transform = `translate(${coin.x}px, ${coin.y}px) scale(${Math.abs(Math.cos(coin.age * 22)) * (1 + Math.max(0, life - 0.8) * 2)}, ${1 + Math.max(0, life - 0.8) * 2})`;
    });
    st.pops.forEach((pop, i) => {
      pop.age += p.dt;
      const k = Math.min(pop.age / 0.7, 1);
      const node = pops.children[i] as HTMLElement;
      // Rising fast, then slowing, so one coin's "+1" is clear of the next before it lands.
      node.style.transform = `translate(${pop.x}px, ${pop.y - (1 - (1 - k) ** 2) * 34}px)`;
      node.style.opacity = String(k < 1 ? 1 - k * k : 0);
    });
    // The "?" block hangs over a hovered control, bobbing.
    block.style.opacity = box ? "1" : "0";
    if (box) block.style.transform = `translate(${box.left + box.width / 2}px, ${box.top - 14 + (p.reduced ? 0 : Math.sin(st.t * 4) * 2)}px)`;
    // The coin in hand turns slowly on the pointer; the score sits beside it once there is one.
    held.style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.reduced ? 1 : Math.max(0.15, Math.abs(Math.cos(st.t * 2.4)))}, 1)`;
    count.style.transform = `translate(${p.x + 12}px, ${p.y + 8}px) scale(${1 + st.bump * 0.35})`;
    count.style.opacity = st.score ? "1" : "0";
    count.textContent = `×${st.score}`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div>
        {Array.from({ length: COINS }, (_, i) => (
          <CoinArt key={i} className="absolute top-0 left-0 size-4 -translate-1/2 opacity-0" />
        ))}
      </div>
      <div>
        {Array.from({ length: POPS }, (_, i) => (
          <span key={i} className="absolute top-0 left-0 -translate-1/2 font-mono text-[11px] font-bold opacity-0" />
        ))}
      </div>
      <div className="absolute top-0 left-0 size-4 -translate-1/2 opacity-0">
        <BlockArt className="size-full" />
      </div>
      <CoinArt className="absolute top-0 left-0 size-3.5 -translate-1/2" />
      <span className="absolute top-0 left-0 origin-left font-mono text-[11px] font-bold opacity-0" />
    </div>
  );
}
