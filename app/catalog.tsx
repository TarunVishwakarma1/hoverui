import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { BlendCursor } from "@/components/cursors/blend";
import { LabelCursor } from "@/components/cursors/label";
import { RegisterCursor } from "@/components/cursors/register";
import { RingCursor } from "@/components/cursors/ring";
import { TrailCursor } from "@/components/cursors/trail";
import registry from "@/registry.json";

const components: Record<string, ComponentType<{ className?: string }>> = {
  ring: RingCursor,
  trail: TrailCursor,
  blend: BlendCursor,
  label: LabelCursor,
  register: RegisterCursor,
};

/**
 * Cursors on this site invert what is beneath them: ink over paper, paper over ink-filled hovers.
 * Label is the exception: its pill carries words, and inverted, the text under it would show through.
 */
export const cursorTone = "text-white mix-blend-difference";

/** registry.json is the source of truth; cursor numbers follow its order. */
export const cursors = registry.items.filter((item) => item.type === "registry:component").map((item, i) => {
  const Base = components[item.name];
  const tone = item.name === "label" ? undefined : cursorTone;
  return {
    name: item.name,
    title: item.title,
    description: item.description,
    files: item.files.map((f) => f.path),
    category: item.categories[0],
    number: String(i + 1).padStart(2, "0"),
    Cursor: function SiteCursor() {
      return <Base className={tone} />;
    },
  };
});

export type CursorData = (typeof cursors)[number];

/** Cursors grouped by their registry category, both in registry order: the all-cursors page and the sidebar. */
export const categories = [...new Set(cursors.map((p) => p.category))].map((name) => ({
  name,
  cursors: cursors.filter((p) => p.category === name),
}));

/** The home page shows the first few; /cursors shows them all. */
export const featured = cursors.slice(0, 5);

export const getCursor = (name: string) => cursors.find((p) => p.name === name);

/** Registry hooks (today: useCursor, the engine every cursor depends on). */
export const hooks = registry.items
  .filter((item) => item.type === "registry:hook")
  .map((item) => ({ name: item.name, title: item.title, description: item.description, files: item.files.map((f) => f.path) }));

export const getHook = (name: string) => hooks.find((h) => h.name === name);

/** Attributes a cursor reads off the page, beyond the shared hover targets. */
export const attributes: Record<string, [string, string][]> = {
  label: [["data-cursor-label", "On any element: the words the pill shows while the pointer is over it."]],
};

/** Copy that stays true without a cursor; `cursorless` mirrors the hook's own media gate. */
export function Swap({ mouse, touch }: { mouse: ReactNode; touch: ReactNode }) {
  return (
    <>
      <span className="cursorless:hidden">{mouse}</span>
      <span className="hidden cursorless:inline">{touch}</span>
    </>
  );
}

/** Each cursor drawn at rest, so a preview shows its subject before a pointer arrives and on touch. */
const rest = "pointer-events-none absolute";

/** A cursor drawn at rest around a point (centre by default): fades while that preview's live cursor is active. */
export function Glyph({ name, className = "top-1/2 left-1/2" }: { name: string; className?: string }) {
  const drawing: Record<string, ReactNode> = {
    ring: (
      <>
        <span className="absolute size-12 -translate-1/2 rounded-full border border-ink" />
        <span className="absolute top-[10px] left-[12px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    trail: Array.from({ length: 14 }, (_, i) => {
      const t = i / 13;
      return (
        <span
          key={i}
          className="absolute size-3 -translate-1/2 rounded-full bg-ink"
          style={{ left: `${72 - t * 144}px`, top: `${-12 + Math.sin(t * Math.PI * 1.4) * 34}px`, scale: String(1 - i / 14) }}
        />
      );
    }),
    blend: (
      <>
        <span className="absolute top-[-20px] left-[-64px] h-10 w-24 bg-ink" />
        <span className="absolute top-[-28px] left-[8px] size-14 rounded-full bg-white mix-blend-difference" />
      </>
    ),
    label: (
      <span className="absolute -translate-1/2 rounded-full bg-ink px-3 py-1.5 text-xs leading-4 font-medium whitespace-nowrap text-paper">Open Label</span>
    ),
    register: (
      <>
        <svg viewBox="0 0 24 24" className="absolute size-10 -translate-1/2 overflow-visible">
          <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute size-4 -translate-1/2 rounded-full border border-ink" />
      </>
    ),
  };
  if (!drawing[name]) return null;
  return (
    <div data-resting aria-hidden className={`${rest} ${className}`}>
      {drawing[name]}
    </div>
  );
}

/**
 * A gallery tile's resting scene: the cursor drawn engaged with a small target, centred, about 200px across.
 * No transforms on the wrapper: a transform would isolate Blend's difference disc from the field it inverts.
 */
export function Scene({ name }: { name: string }) {
  const word = "absolute -translate-1/2 text-2xl leading-8 tracking-[-0.02em] whitespace-nowrap";
  const scene: Record<string, ReactNode> = {
    ring: (
      <>
        <span className={`${word} underline decoration-1 underline-offset-4`}>Case study</span>
        <span className="absolute top-[6px] left-[30px] size-[58px] -translate-1/2 rounded-full border border-ink" />
        <span className="absolute top-[2px] left-[40px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    trail: Array.from({ length: 14 }, (_, i) => {
      const t = i / 13;
      return (
        <span
          key={i}
          className="absolute size-3.5 -translate-1/2 rounded-full bg-ink"
          style={{ left: `${108 - t * 216}px`, top: `${-16 + Math.sin(t * Math.PI * 1.4) * 44}px`, scale: String(1 - i / 14) }}
        />
      );
    }),
    blend: (
      <>
        <span className="absolute top-[-24px] left-[-96px] h-12 w-36 bg-ink" />
        <span className="absolute top-[-40px] left-[8px] size-20 rounded-full bg-white mix-blend-difference" />
      </>
    ),
    label: (
      <>
        <span className={`${word} top-[14px] underline decoration-hairline decoration-1 underline-offset-4`}>Case study</span>
        <span className="absolute top-[-14px] left-[18px] -translate-1/2 rounded-full bg-ink px-3 py-1.5 text-xs leading-4 font-medium whitespace-nowrap text-paper">View</span>
      </>
    ),
    register: (
      <>
        <span className="absolute flex h-11 w-36 -translate-1/2 items-center justify-center border border-ink text-[15px]">Button</span>
        <span className="absolute top-[2px] left-[34px] size-[29px] -translate-1/2 rounded-full border border-ink bg-ink/10" />
        <svg viewBox="0 0 24 24" className="absolute top-0 left-[40px] size-6 -translate-1/2 overflow-visible">
          <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" />
        </svg>
      </>
    ),
  };
  if (!scene[name]) return null;
  return (
    <div data-resting aria-hidden className={`${rest} top-1/2 left-1/2`}>
      {scene[name]}
    </div>
  );
}

/** What sits inside each preview: authored to show that cursor at its best. */
export function Specimen({ name }: { name: string }) {
  if (name === "trail")
    return (
      <div className="flex h-full items-end bg-[radial-gradient(circle,var(--color-hairline)_1px,transparent_1.5px)] bg-size-[16px_16px] p-6 sm:p-8">
        <div data-resting aria-hidden className={`${rest} inset-0`}>
          {Array.from({ length: 14 }, (_, i) => {
            const t = i / 13;
            return (
              <span
                key={i}
                className="absolute size-3 -translate-1/2 rounded-full bg-ink"
                style={{ left: `${64 - t * 42}%`, top: `${34 + Math.sin(t * Math.PI * 1.4) * 16}%`, scale: String(1 - i / 14) }}
              />
            );
          })}
        </div>
        <p className="relative max-w-[26ch] bg-preview pr-2 text-pretty text-ink-soft">
          <Swap mouse="Draw through the empty space. Each dot chases the one ahead of it." touch="Each dot chases the one ahead of it. Open this on a computer to draw with it." />
        </p>
      </div>
    );

  if (name === "blend")
    return (
      <div className="flex h-full flex-col justify-center gap-6 p-6 sm:p-8">
        <p className="relative self-start text-[clamp(4.5rem,13vw,12.5rem)] leading-[0.85] tracking-[-0.04em]">
          Invert
          <span data-resting aria-hidden className={`${rest} top-1/2 left-[62%] size-[0.5em] -translate-1/2 rounded-full bg-white mix-blend-difference`} />
        </p>
        <div className="relative flex flex-wrap gap-3">
          <button type="button" className="btn-primary">Over ink</button>
          <button type="button" className="btn-secondary">Over a rule</button>
        </div>
      </div>
    );

  if (name === "label")
    return (
      <div className="grid h-full grid-cols-3 content-center gap-3 p-6 sm:gap-5 sm:p-8">
        {cursors.slice(0, 3).map((p, i) => (
          <Link key={p.name} href={`/cursors/${p.name}`} data-cursor-label={`Open ${p.title}`} className="group flex flex-col gap-3">
            <span
              className={`relative flex aspect-[4/5] items-end p-3 text-[clamp(1.5rem,3vw,2.5rem)] leading-none tracking-[-0.02em] ${
                ["bg-ink text-paper", "bg-seal", "border border-hairline"][i]
              }`}
            >
              {p.number}
              {i === 1 && (
                <span data-resting aria-hidden className={`${rest} top-[38%] left-1/2 -translate-1/2 rounded-full bg-ink px-3 py-1.5 text-xs leading-4 font-medium whitespace-nowrap text-paper`}>
                  Open {p.title}
                </span>
              )}
            </span>
            <span className="mono-label text-ink-soft group-hover:text-ink">{p.title}</span>
          </Link>
        ))}
      </div>
    );

  if (name === "register")
    return (
      <div className="relative flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
        <Glyph name="register" className="top-[44%] left-[70%]" />
        <p className="max-w-[30ch] text-pretty text-ink-soft">
          <Swap
            mouse="You have worn this one since you arrived. Over a control, the ring opens around it."
            touch="On a computer, the whole site wears this one. Over a control, the ring opens around it."
          />
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary">Button</button>
          <Link href="/cursors/register" className="btn-secondary">Link</Link>
        </div>
      </div>
    );

  return (
    <div className="relative flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
      <Glyph name="ring" className="top-[52%] left-[70%] sm:top-[40%] sm:left-[72%]" />
      <p className="max-w-[15ch] text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.02em]">The ring swells over anything you can click.</p>
      {/* Right-aligned: the hero's seal hangs off this preview's lower-left corner. */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href="/cursors/ring" className="btn-secondary">Source</Link>
        <Link href="/#placement" className="btn-secondary">Placement</Link>
        <button type="button" className="btn-secondary cursorless:hidden">Press and hold</button>
      </div>
    </div>
  );
}
