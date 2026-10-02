import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { CopyButton, NavLink } from "./client";
import { plates, type PlateData } from "./plates";

export const SITE = "https://hoverui.fun";
export const installCommand = (name: string) => `npx shadcn@latest add ${SITE}/r/${name}.json`;

export const container = "mx-auto w-full max-w-[1440px] px-6 sm:px-10";
export const h2 = "text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.02] tracking-[-0.02em] text-balance";

/** Printer's registration mark: the hotspot of every cursor, and the corner of every plate. */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`size-6 shrink-0 ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <path d="M12 0v24M0 12h24" vectorEffect="non-scaling-stroke" />
        <circle cx="12" cy="12" r="5" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

const arrows = { right: "M3 12h17M14 6l6 6-6 6", left: "M21 12H4M10 6l-6 6 6 6", out: "M7 17 17 7M8 7h9v9" };

export function Arrow({ to = "right", className = "" }: { to?: keyof typeof arrows; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`size-4 shrink-0 ${className}`}>
      <path d={arrows[to]} fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

/** A live, registered plate. The cursor passed in owns the inner surface. */
export function Plate({
  children,
  className = "",
  surface = "bg-plate",
}: {
  children: ReactNode;
  className?: string;
  surface?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {["-left-[22px] -top-[22px]", "-right-[22px] -top-[22px]", "-bottom-[22px] -left-[22px]", "-bottom-[22px] -right-[22px]"].map((pos) => (
        <Mark key={pos} className={`absolute text-ink ${pos}`} />
      ))}
      <div data-plate className={`relative h-full ${surface}`}>
        {children}
        {/* Set in the top margin between the registration marks, clear of whatever the plate holds. */}
        <p className="mono-label absolute right-8 -top-7 hidden text-ink-soft cursorless:block">Needs a mouse</p>
      </div>
    </div>
  );
}

/** The periwinkle seal: a letterpress stamp whose text ring turns slowly. */
export function Stamp({ id, text, className = "" }: { id: string; text: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={`z-10 size-32 rounded-full bg-seal text-ink transition-[translate] duration-600 ease-annual hover:-translate-y-1 sm:size-36 ${className}`}
    >
      <svg viewBox="0 0 100 100" className="size-full animate-[spin_25s_linear_infinite] motion-reduce:animate-none">
        <path id={id} d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0" fill="none" />
        <text className="font-mono uppercase" fontSize="7.2" fill="currentColor">
          <textPath href={`#${id}`} textLength={2 * Math.PI * 37 - 1} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <Arrow to="out" className="absolute inset-0 m-auto size-9" />
    </div>
  );
}

/** The install command: filled ink as the page's primary action, outlined where it repeats. */
export function Install({ name, quiet = false }: { name: string; quiet?: boolean }) {
  const cmd = installCommand(name);
  const at = cmd.indexOf("https://");
  // "https://hoverui.fun/", "r/", "ring.json": each unbreakable, so phones break only between them.
  const url = cmd.slice(at).match(/^https:\/\/[^/]+\/|[^/]+\/?/g)!;
  return (
    <div className={`flex min-w-0 items-stretch ${quiet ? "border border-ink" : "bg-ink text-paper"}`}>
      <code className="min-w-0 flex-1 overflow-x-auto px-4 py-3 font-mono text-[13px] leading-5 sm:whitespace-nowrap">
        {cmd.slice(0, at)}
        {url.map((part, i) => (
          <Fragment key={i}>
            {i > 0 && <wbr />}
            <span className="whitespace-nowrap">{part}</span>
          </Fragment>
        ))}
      </code>
      <CopyButton
        text={cmd}
        className={`border-l transition-colors duration-100 ${quiet ? "border-ink hover:bg-ink hover:text-paper" : "border-paper/25 hover:bg-paper hover:text-ink"}`}
      />
    </div>
  );
}

export function Code({ title, code }: { title: string; code: string }) {
  return (
    <figure className="min-w-0 border border-hairline bg-paper-warm/70">
      <figcaption className="flex items-center justify-between border-b border-hairline">
        <span className="mono-label truncate px-4 py-3">{title}</span>
        <CopyButton text={code} className="self-stretch border-l border-hairline hover:bg-ink hover:text-paper" />
      </figcaption>
      <pre className="p-5 font-mono text-[13px] leading-5 whitespace-pre-wrap [overflow-wrap:anywhere]">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

/** The credits line under a plate: number, name, what it does, how to get it. */
export function PlateCredits({ plate, install = true, className = "" }: { plate: PlateData; install?: boolean; className?: string }) {
  return (
    <div className={`mt-8 flex min-w-0 flex-col gap-4 border-t border-hairline pt-4 ${className}`}>
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="flex items-baseline gap-3 text-[22px] leading-7 tracking-[-0.01em]">
          {plate.title}
          <span className="mono-label text-ink-soft">{plate.number}</span>
        </h3>
        <Link href={`/plates/${plate.name}`} className="flex shrink-0 items-center gap-2 text-[15px] leading-5 hover:underline hover:underline-offset-4">
          View plate <Arrow />
        </Link>
      </div>
      <p className="max-w-[52ch] text-[15px] leading-[22px] text-ink-soft">{plate.description}</p>
      {install && <Install name={plate.name} quiet />}
    </div>
  );
}

export function SiteBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper">
      <div className={`${container} flex h-18 items-center gap-10`}>
        <Link href="/" className="flex items-center gap-2.5 tracking-[-0.01em]">
          <Mark className="size-5" />
          hover-ui
        </Link>
        <nav aria-label="Plates" className="hidden flex-1 items-center gap-7 lg:flex">
          {plates.map((p) => (
            <NavLink
              key={p.name}
              href={`/plates/${p.name}`}
              className="mono-label text-ink-soft hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:underline-offset-[6px]"
            >
              {p.number} {p.title}
            </NavLink>
          ))}
        </nav>
        <Link href="/#install" className="btn-secondary ml-auto">
          Install
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className={`${container} grid grid-cols-1 gap-10 py-24 lg:grid-cols-12`}>
        <p className="text-display lg:col-span-7">Start with the one you&apos;re wearing.</p>
        <div className="flex flex-col gap-6 self-end lg:col-span-5">
          <Install name="register" />
          <p className="mono-label text-ink-soft">hover-ui · MIT license · Set in Host Grotesk and Fragment Mono</p>
        </div>
      </div>
    </footer>
  );
}
