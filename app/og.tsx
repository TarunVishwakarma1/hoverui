import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

const INK = "#16181a";
const SOFT = "#55585c";

/**
 * The site's two faces, read from the repository (assets/fonts, SIL Open Font License, licenses beside them), so drawing
 * the cards never depends on the network. The renderer needs TrueType, so these are .ttf, not the site's woff2.
 */
const fonts = Promise.all(
  [
    ["Host Grotesk", "HostGrotesk-Regular.ttf"],
    ["Fragment Mono", "FragmentMono-Regular.ttf"],
  ].map(async ([name, file]) => ({ name, data: await readFile(join(process.cwd(), "assets/fonts", file)), weight: 400 as const, style: "normal" as const })),
);

/** The registration mark, as on every preview's corners. */
function Mark({ x, y }: { x: number; y: number }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" style={{ position: "absolute", left: x - 18, top: y - 18 }}>
      <path d="M12 0v24M0 12h24" stroke={INK} strokeWidth="1" fill="none" />
      <circle cx="12" cy="12" r="5" stroke={INK} strokeWidth="1" fill="none" />
    </svg>
  );
}

/**
 * A share card set as a plate from the annual: the Sheet, registration marks at an inset frame's corners, the name in
 * the display size, a line of description, and at the foot the mono credit line: what it is, and how to get it.
 */
export async function ogPlate({ title, description, label, foot }: { title: string; description: string; label: string; foot: string }) {
  const [w, h, m] = [ogSize.width, ogSize.height, 56];
  const mono = { fontFamily: "Fragment Mono", fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase" as const };
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#f5f4f6", color: INK, fontFamily: "Host Grotesk" }}>
        {[
          [m, m],
          [w - m, m],
          [m, h - m],
          [w - m, h - m],
        ].map(([x, y]) => (
          <Mark key={`${x},${y}`} x={x} y={y} />
        ))}
        <div style={{ position: "absolute", left: m + 40, top: m + 40, right: m + 40, bottom: m + 40, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, letterSpacing: "-0.01em" }}>
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M12 0v24M0 12h24" stroke={INK} strokeWidth="1.4" fill="none" />
                <circle cx="12" cy="12" r="5" stroke={INK} strokeWidth="1.4" fill="none" />
              </svg>
              hover-ui
            </div>
            <div style={{ ...mono, color: SOFT }}>{label}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
            <div style={{ fontSize: title.length > 14 ? 104 : 132, lineHeight: 0.95, letterSpacing: "-0.03em" }}>{title}</div>
            <div style={{ marginTop: 26, fontSize: 30, lineHeight: 1.3, color: SOFT, maxWidth: 940 }}>{description}</div>
          </div>
          <div style={{ display: "flex", marginTop: 34, borderTop: `1px solid #c9c7c4`, paddingTop: 20 }}>
            <div style={{ fontFamily: "Fragment Mono", fontSize: 20, color: INK }}>{foot}</div>
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: await fonts },
  );
}
