import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { BlendCursor } from "@/components/cursors/blend";
import { LabelCursor } from "@/components/cursors/label";
import { RegisterCursor } from "@/components/cursors/register";
import { RingCursor } from "@/components/cursors/ring";
import { TrailCursor } from "@/components/cursors/trail";
import registry from "@/registry.json";

const cursors: Record<string, ComponentType<{ className?: string }>> = {
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

/** registry.json is the source of truth; plate numbers follow its order. */
export const plates = registry.items.map((item, i) => {
  const Base = cursors[item.name];
  const tone = item.name === "label" ? undefined : cursorTone;
  return {
    name: item.name,
    title: item.title,
    description: item.description,
    files: item.files.map((f) => f.path),
    number: String(i + 1).padStart(2, "0"),
    Cursor: function SiteCursor() {
      return <Base className={tone} />;
    },
  };
});

export type PlateData = (typeof plates)[number];

export const getPlate = (name: string) => plates.find((p) => p.name === name);

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

/** Each cursor drawn at rest, so a plate shows its subject before a pointer arrives and on touch. */
const rest = "pointer-events-none absolute";

/** What sits inside each plate: authored to show that cursor at its best. */
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
        <p className="relative max-w-[26ch] bg-plate pr-2 text-ink-soft">
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
        {plates.slice(0, 3).map((p, i) => (
          <Link key={p.name} href={`/plates/${p.name}`} data-cursor-label={`Open ${p.title}`} className="group flex flex-col gap-3">
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
        <div data-resting aria-hidden className={`${rest} top-[44%] left-[70%]`}>
          <svg viewBox="0 0 24 24" className="absolute size-6 -translate-1/2 overflow-visible">
            <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span className="absolute size-3 -translate-1/2 rounded-full border border-ink" />
        </div>
        <p className="max-w-[30ch] text-ink-soft">
          <Swap
            mouse="You have worn this one since you arrived. Over a control, the ring opens around it."
            touch="On a computer, the whole site wears this one. Over a control, the ring opens around it."
          />
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary">Button</button>
          <Link href="/plates/register" className="btn-secondary">Link</Link>
        </div>
      </div>
    );

  return (
    <div className="relative flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
      <div data-resting aria-hidden className={`${rest} top-[52%] left-[70%] sm:top-[40%] sm:left-[72%]`}>
        <span className="absolute size-12 -translate-1/2 rounded-full border border-ink" />
        <span className="absolute top-[10px] left-[12px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </div>
      <p className="max-w-[15ch] text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.02em]">The ring swells over anything you can click.</p>
      {/* Right-aligned: the hero's seal hangs off this plate's lower-left corner. */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href="/plates/ring" className="btn-secondary">Source</Link>
        <Link href="/#placement" className="btn-secondary">Placement</Link>
        <button type="button" className="btn-secondary cursorless:hidden">Press and hold</button>
      </div>
    </div>
  );
}
