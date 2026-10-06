"use client";

import { useId, useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The lens: its radius in px, and how much it enlarges at rest. */
const R = 40;
const ZOOM = 2;
/** The furthest any pixel is pulled: the rim's, where the view inside reaches out half the radius. */
const PULL = R * (1 - 1 / ZOOM);

/**
 * A displacement map that magnifies, as a data URL: inside the lens every pixel looks back toward the centre by
 * (1 - 1/zoom) of its distance, so the page under the middle fills the glass; outside it, nothing moves.
 */
function zoomMap() {
  const size = R * 2;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const [dx, dy] = [x + 0.5 - R, y + 0.5 - R];
      const inside = dx * dx + dy * dy < R * R ? 1 - 1 / ZOOM : 0;
      const i = (y * size + x) * 4;
      img.data[i] = 127.5 - (dx * inside * 127.5) / PULL;
      img.data[i + 1] = 127.5 - (dy * inside * 127.5) / PULL;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/** The magnifying glass: rim, glint and handle, its lens centred; exported so a page can draw it at rest. */
export function MagnifierArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className={`overflow-visible ${className}`} aria-hidden>
      <path d="M33 33 62 62" stroke="currentColor" strokeWidth="13" strokeLinecap="round" />
      <path d="M33 33 62 62" stroke="#7a4a24" strokeWidth="10" strokeLinecap="round" />
      <circle r="48" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle r="48" fill="none" stroke="#c9a54a" strokeWidth="3" />
      <path d="M-30-24a38 38 0 0 1 22-14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/**
 * A magnifying glass that really magnifies: the page under the lens shows at twice its size. Over anything clickable it
 * zooms closer; hold to look closer still. Chromium browsers draw the zoom; elsewhere the glass passes over the page
 * unchanged.
 */
export function MagnifierCursor({ className = "" }: { className?: string }) {
  const filter = `zoom${useId().replace(/[^\w-]/g, "")}`;
  const s = useRef({ x: 0, y: 0, power: 1, scale: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [defs, lens, glass] = el.children as HTMLCollectionOf<HTMLElement>;
    st.x += (p.x - st.x) * p.ease(22);
    st.y += (p.y - st.y) * p.ease(22);
    // Closer over a control, closer still while held: 2x, about 2.5x, about 3.3x. Past that the zoom turns blocky.
    st.power += ((p.down ? 1.4 : p.hover ? 1.2 : 1) - st.power) * p.ease(10);
    const map = defs.querySelector("feImage")!;
    if (!map.getAttribute("href")) map.setAttribute("href", zoomMap());
    const scale = Math.round(PULL * 2 * st.power);
    if (scale !== st.scale) defs.querySelector("feDisplacementMap")!.setAttribute("scale", String((st.scale = scale)));
    lens.style.transform = glass.style.transform = `translate(${st.x}px, ${st.y}px)`;
  });

  // No blend mode or filter on the root: either would cut the lens off from the page it enlarges.
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute size-0">
        <filter id={filter} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage x="0" y="0" width={R * 2} height={R * 2} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={PULL * 2} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="absolute -translate-1/2 rounded-full" style={{ width: R * 2, height: R * 2, backdropFilter: `url(#${filter})` }} />
      <MagnifierArt className="absolute size-[88px] -translate-1/2" />
    </div>
  );
}
