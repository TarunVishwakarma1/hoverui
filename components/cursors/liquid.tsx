"use client";

import { useId, useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The drop at rest: its radius, and the room it keeps round a control it wraps. */
const R = 20;
const PAD = 6;
/** How far, in px, the rim bends the page: at rest, over a control, and squeezed. */
const BEND = [9, 12, 16];

/**
 * A displacement map for a pill of `w` by `h`, as a data URL. Like a lens of liquid glass, it is flat in the middle and
 * bends only toward its rim: within a band along the edge, each pixel looks further in, hardest at the very edge, so
 * the page under the rim swells toward it, the way a thick curved edge of glass magnifies. Measured with the pill's signed distance field, so the band
 * follows the curve exactly. Drawn once per size and kept.
 */
const maps = new Map<string, string>();
function liquidMap(w: number, h: number) {
  const key = `${w}x${h}`;
  const kept = maps.get(key);
  if (kept) return kept;
  const canvas = document.createElement("canvas");
  [canvas.width, canvas.height] = [w, h];
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const r = Math.min(w, h) / 2;
  const band = Math.min(10, r * 0.55);
  // Distance to the pill's edge, negative inside.
  const sdf = (x: number, y: number) => {
    const [qx, qy] = [Math.abs(x - w / 2) - (w / 2 - r), Math.abs(y - h / 2) - (h / 2 - r)];
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [px, py] = [x + 0.5, y + 0.5];
      const inside = -sdf(px, py);
      const pull = inside > 0 && inside < band ? (1 - inside / band) ** 2 : 0;
      // The outward normal, from the field's slope; each pixel looks the other way, inward, so the glass only ever
      // shows the page beneath it (the browser hands a backdrop filter nothing from outside the element).
      const [nx, ny] = [sdf(px + 1, py) - sdf(px - 1, py), sdf(px, py + 1) - sdf(px, py - 1)];
      const n = Math.hypot(nx, ny) || 1;
      const i = (y * w + x) * 4;
      img.data[i] = 127.5 - (nx / n) * pull * 127.5;
      img.data[i + 1] = 127.5 - (ny / n) * pull * 127.5;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL();
  if (maps.size > 24) maps.delete(maps.keys().next().value!);
  maps.set(key, url);
  return url;
}

/** One color channel of the page, displaced by `scale`, so red, green and blue can bend by slightly different amounts. */
function channel(i: number, scale: number) {
  const keep = ["1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0", "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0", "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"][i];
  return (
    <>
      <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" />
      <feColorMatrix type="matrix" values={keep} result={`c${i}`} />
    </>
  );
}

/**
 * A drop of liquid glass that follows the pointer, flat in the middle and bending the page at its rim, where the
 * colors split a little as they do at the edge of real glass. Over anything clickable it flows out to wrap the
 * control in a pill, overshooting and settling like a liquid; press and it squeezes, bending harder. Chromium
 * browsers draw the bending; elsewhere it is frosted glass.
 */
export function LiquidCursor({ className = "" }: { className?: string }) {
  const id = `liquid${useId().replace(/[^\w-]/g, "")}`;
  const s = useRef({ box: [0, 0, 0, 0], v: [0, 0, 0, 0], bend: BEND[0], size: "", map: "" });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [defs, glass, rim, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    const hit = p.hover?.getBoundingClientRect();
    // Where the glass wants to be: a round drop on the pointer, or a pill round the hovered control.
    const target = hit ? [hit.left - PAD, hit.top - PAD, hit.width + PAD * 2, hit.height + PAD * 2] : [p.x - R, p.y - R, R * 2, R * 2];
    if (p.down) [target[0], target[1], target[2], target[3]] = [target[0] + target[2] * 0.04, target[1] + target[3] * 0.06, target[2] * 0.92, target[3] * 0.88];
    if (p.reduced || !p.dt) st.box = [...target];
    else
      // A spring per edge, underdamped, so the glass overshoots as it flows and wobbles to rest.
      st.box = st.box.map((b, i) => {
        st.v[i] += ((target[i] - b) * 420 - st.v[i] * 26) * p.dt;
        return b + st.v[i] * p.dt;
      });
    const [l, t, w, h] = st.box.map((v, i) => (i > 1 ? Math.max(v, 8) : v));
    // The map is drawn for the size the glass is heading to, and stretched over it on the way.
    const size = `${Math.round(target[2])}x${Math.round(target[3])}`;
    if (size !== st.size) {
      st.size = size;
      const map = liquidMap(Math.round(target[2]), Math.round(target[3]));
      if (map !== st.map) defs.querySelectorAll("feImage").forEach((img) => img.setAttribute("href", (st.map = map)));
    }
    st.bend += ((p.down ? BEND[2] : hit ? BEND[1] : BEND[0]) - st.bend) * p.ease(10);
    defs.querySelectorAll("feImage").forEach((img) => {
      img.setAttribute("width", String(w));
      img.setAttribute("height", String(h));
    });
    defs.querySelectorAll("feDisplacementMap").forEach((map, i) => map.setAttribute("scale", String(st.bend * 2 * (1 - i * 0.08))));
    for (const part of [glass, rim]) {
      part.style.transform = `translate(${l}px, ${t}px)`;
      part.style.width = `${w}px`;
      part.style.height = `${h}px`;
    }
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  // No blend mode or filter on the root: either would cut the glass off from the page it bends.
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute size-0">
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage x="0" y="0" width={R * 2} height={R * 2} preserveAspectRatio="none" result="map" />
          {channel(0, BEND[0] * 2)}
          {channel(1, BEND[0] * 2 * 0.92)}
          {channel(2, BEND[0] * 2 * 0.84)}
          <feBlend in="c0" in2="c1" mode="screen" result="rg" />
          <feBlend in="rg" in2="c2" mode="screen" />
        </filter>
      </svg>
      {/* Frosted first, for browsers that cannot bend; Chromium takes the second, the bending one. */}
      <div className="absolute top-0 left-0 rounded-full" style={{ WebkitBackdropFilter: "blur(3px) saturate(1.6)", backdropFilter: `url(#${id}) saturate(1.4)` }} />
      <div
        className="absolute top-0 left-0 rounded-full"
        style={{
          background: "linear-gradient(180deg, rgb(255 255 255 / 0.14), rgb(255 255 255 / 0) 38%, rgb(255 255 255 / 0) 72%, rgb(255 255 255 / 0.08))",
          boxShadow: "inset 0 1px 0.5px rgb(255 255 255 / 0.8), inset 0 -1px 1px rgb(255 255 255 / 0.3), inset 0 0 0 1px rgb(0 0 0 / 0.07), 0 4px 14px -6px rgb(0 0 0 / 0.22)",
        }}
      />
      <div className="absolute size-1 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
