"use client";

import { useId, useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const DISK = "10 3 5 3";
/** The lens round the hole: its width in px, its Einstein radius (where light bends hardest), and its strongest pull, at the shadow's edge. */
const LENS = 180;
const EINSTEIN = 20;
const PULL = EINSTEIN * 2;
const DEBRIS = 18;

/**
 * A displacement map for the lens, as a data URL: each pixel tells the filter where to look instead. Light passing at
 * r is bent by θE²/r toward the hole, so the page behind is pulled outward round it, fading to nothing at the rim.
 */
function lensMap() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = LENS;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(LENS, LENS);
  const h = LENS / 2;
  for (let y = 0; y < LENS; y++)
    for (let x = 0; x < LENS; x++) {
      const [dx, dy] = [x + 0.5 - h, y + 0.5 - h];
      const r = Math.hypot(dx, dy) || 1;
      const pull = ((EINSTEIN * EINSTEIN) / Math.max(r, EINSTEIN / 2)) * Math.max(0, 1 - (r / h) ** 2) ** 2;
      const i = (y * LENS + x) * 4;
      img.data[i] = 127.5 - ((dx / r) * pull * 127.5) / PULL;
      img.data[i + 1] = 127.5 - ((dy / r) * pull * 127.5) / PULL;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/** The black hole edge-on: its disk, the disk's far side bent into a halo round the shadow, and the shadow, the disk's dashes marked `data-disk`; exported so a page can draw it at rest. */
export function BlackHoleArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-32 -20 64 40" className={`overflow-visible ${className}`} aria-hidden>
      <circle r="12.5" fill="none" stroke="#ffb35c" strokeWidth="2.6" />
      <ellipse data-disk rx="29" ry="5" fill="none" stroke="#ff8a2a" strokeWidth="3.2" strokeDasharray={DISK} />
      <circle r="10.5" fill="#050507" />
      {/* The near side of the disk, in front of the shadow; drawn the same way round as the ellipse, so their dashes run together. */}
      <path data-disk d="M29 0a29 5 0 0 1-58 0" fill="none" stroke="#ffd08a" strokeWidth="3.2" strokeDasharray={DISK} />
    </svg>
  );
}

/**
 * A black hole drifting after the pointer that bends the page round it like a lens. Your motion feeds it: dust
 * spirals into its disk. Over anything clickable it swells and feeds faster; hold, and time slows almost to a stop
 * while its light reddens.
 */
export function BlackHoleCursor({ className = "" }: { className?: string }) {
  const filter = `lens${useId().replace(/[^\w-]/g, "")}`;
  const s = useRef({
    x: 0,
    y: 0,
    spin: 0,
    size: 1,
    glow: 0.5,
    time: 1,
    tilt: 0,
    scale: 0,
    travel: 0,
    lx: 0,
    ly: 0,
    next: 0,
    debris: Array.from({ length: DEBRIS }, () => ({ r: 0, a: 0, live: false })),
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [defs, lens, glow, hole, debris, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    // Holding slows time near the hole: everything about it runs on its own, slower clock.
    st.time += ((p.down ? 0.08 : 1) - st.time) * p.ease(5);
    const dt = p.dt * st.time;
    st.x += (p.x - st.x) * p.ease(4 * st.time);
    st.y += (p.y - st.y) * p.ease(4 * st.time);
    st.size += ((p.hover ? 1.3 : 1) - st.size) * p.ease(8);
    st.glow += ((p.hover ? 1 : 0.5) - st.glow) * p.ease(8);
    st.tilt += (Math.max(-14, Math.min(14, (p.x - st.x) * 0.12)) - st.tilt) * p.ease(6);

    // Motion feeds it: every so far you travel, a mote of dust falls into orbit.
    if (!p.dt) {
      [st.lx, st.ly, st.travel] = [p.x, p.y, 0];
      for (const d of st.debris) d.live = false;
    }
    st.travel += Math.hypot(p.x - st.lx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    const feed = () => {
      Object.assign(st.debris[st.next], { r: 34 + Math.random() * 26, a: Math.random() * Math.PI * 2, live: true });
      st.next = (st.next + 1) % DEBRIS;
    };
    if (!p.reduced) {
      st.spin += dt * (p.hover ? 70 : 26);
      for (; st.travel > 30; st.travel -= 30) feed();
      if (p.hover && Math.random() < dt * 12) feed();
    }

    // The lens: the page behind is bent round the hole. Off under reduced motion, where a warp that follows you is too much.
    lens.style.display = p.reduced ? "none" : "";
    if (!p.reduced) {
      const map = defs.querySelector("feImage")!;
      if (!map.getAttribute("href")) map.setAttribute("href", lensMap());
      const scale = Math.round(PULL * 2 * st.size);
      if (scale !== st.scale) defs.querySelector("feDisplacementMap")!.setAttribute("scale", String((st.scale = scale)));
      lens.style.transform = `translate(${st.x}px, ${st.y}px)`;
    }

    // Light climbing out of a slowed clock is redshifted.
    const red = (1 - st.time) / 0.92;
    glow.style.transform = `translate(${st.x}px, ${st.y}px) scale(${st.size})`;
    glow.style.opacity = String(st.glow);
    glow.style.background = `radial-gradient(circle, rgb(255 ${150 - red * 120} ${60 - red * 40} / 0.45), transparent 65%)`;
    hole.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${st.tilt}deg) scale(${st.size})`;
    hole.style.filter = red > 0.01 ? `hue-rotate(${-28 * red}deg) brightness(${1 - red * 0.25})` : "";
    hole.querySelectorAll<SVGElement>("[data-disk]").forEach((disk) => (disk.style.strokeDashoffset = String(-st.spin)));

    // Dust spirals in, faster the deeper it falls, and vanishes behind the shadow or into it.
    debris.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${st.tilt}deg) scale(${st.size})`;
    st.debris.forEach((d, i) => {
      const mote = debris.children[i] as HTMLElement;
      if (d.live) {
        d.a += dt * 2.2 * (27 / d.r) ** 1.5;
        d.r -= dt * (7 + 340 / d.r);
        d.live = d.r > 11;
      }
      const [x, y] = [Math.cos(d.a) * d.r, Math.sin(d.a) * d.r * 0.22];
      mote.style.transform = `translate(${x}px, ${y}px)`;
      mote.style.opacity = !d.live || (y < 0 && Math.abs(x) < 11) ? "0" : String(Math.min(1, (d.r - 11) / 10));
    });
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  // No blend mode or filter on the root: either would cut the lens off from the page it bends.
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute size-0">
        <filter id={filter} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage x="0" y="0" width={LENS} height={LENS} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={PULL * 2} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="absolute -translate-1/2 rounded-full" style={{ width: LENS, height: LENS, backdropFilter: `url(#${filter})` }} />
      <div className="absolute size-24 -translate-1/2 rounded-full" />
      <BlackHoleArt className="absolute h-10 w-16 -translate-1/2" />
      <div className="absolute top-0 left-0">
        {Array.from({ length: DEBRIS }, (_, i) => (
          <div key={i} className="absolute size-1 -translate-1/2 rounded-full bg-[#ffd08a] opacity-0 shadow-[0_0_4px_#ff9a3c]" />
        ))}
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
