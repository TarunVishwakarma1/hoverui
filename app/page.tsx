import Link from "next/link";
import { BlendCursor } from "@/components/cursors/blend";
import { LabelCursor } from "@/components/cursors/label";
import { cursorTone, plates, Specimen, Swap } from "./plates";
import { Arrow, Code, Install, Plate, PlateCredits, Stamp, container, h2 } from "./ui";

const placement = `// app/layout.tsx: the whole page wears it
<body>
  {children}
  <RegisterCursor />
</body>

// any element: only this section does
<section>
  <TrailCursor />
  …
</section>`;

// Spans for plates 02 onward: one beside the intro, one full bleed, then a pair.
const spans = ["lg:col-span-8", "lg:col-span-12", "lg:col-span-6", "lg:col-span-6"];
const aspects = ["aspect-[16/10]", "aspect-[4/3] sm:aspect-[21/9]", "aspect-[4/3]", "aspect-[4/3]"];

export default function Home() {
  const [hero, ...rest] = plates;

  return (
    <main>
      <section className={`${container} grid grid-cols-1 items-center gap-x-10 gap-y-16 pt-12 pb-20 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-12 lg:pt-16`}>
        <div className="lg:col-span-6">
          <h1 className="text-display max-w-[12ch]">Every cursor owns the element you drop it in.</h1>
          <p className="mt-8 max-w-[46ch] text-ink-soft">
            Copy-paste cursor components for React, installed with shadcn. Drop one in a section and it owns that section. Drop one in{" "}
            <code className="font-mono text-[15px] text-ink">&lt;body&gt;</code> and it owns the page.
          </p>
          <div id="install" className="mt-10 flex max-w-xl scroll-mt-28 flex-col gap-4">
            <Install name={hero.name} />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="#plates" className="btn-secondary">
                Browse plates <Arrow />
              </Link>
              <span className="mono-label text-ink-soft">React 19 · Tailwind v4 · MIT</span>
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-6">
          <div className="relative">
            <Plate className="aspect-[4/5] sm:aspect-[4/3]">
              <hero.Cursor />
              <Specimen name={hero.name} />
            </Plate>
            <Stamp id="seal-hero" text="Drop one in <body> · it owns the page · " className="absolute -bottom-12 -left-6 sm:-left-14" />
          </div>
          {/* Indented so the credit clears the seal hanging off the plate's corner. */}
          <PlateCredits plate={hero} install={false} className="pl-28" />
        </div>
      </section>

      <nav aria-label="All plates" className={container}>
        <ol className="grid border-t border-hairline sm:grid-cols-2 lg:grid-cols-5">
          {/* Below lg the hero plate's own credit sits right above this row, so plate 01 is listed only on wide screens. */}
          {plates.map((p, i) => (
            <li
              key={p.name}
              className={`border-b border-dashed border-hairline sm:max-lg:odd:border-l sm:max-lg:odd:pl-6 lg:border-b-0 lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0 ${i === 0 ? "max-lg:hidden" : ""}`}
            >
              <Link href={`/plates/${p.name}`} className="group flex h-full flex-col gap-2 py-6 sm:pr-6">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[22px] leading-7 tracking-[-0.01em] group-hover:underline group-hover:underline-offset-4">{p.title}</span>
                  <span className="mono-label text-ink-soft">{p.number}</span>
                </span>
                <span className="text-[15px] leading-[22px] text-ink-soft">{p.description}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <section id="plates" className={`${container} mt-24 grid scroll-mt-24 grid-cols-1 gap-x-16 gap-y-24 border-t border-hairline pt-20 lg:grid-cols-12`}>
        <div className="lg:col-span-4">
          <h2 className={h2}>The plates</h2>
          <p className="mt-6 max-w-[34ch] text-ink-soft">
            Each one is a single file plus the shared <code className="font-mono text-[15px] text-ink">use-cursor</code> hook. Put your pointer in a plate and the page&apos;s cursor hands it over.
          </p>
        </div>
        {rest.map((p, i) => (
          <article key={p.name} className={spans[i % spans.length]}>
            <Plate className={aspects[i % aspects.length]}>
              <p.Cursor />
              <Specimen name={p.name} />
            </Plate>
            <PlateCredits plate={p} />
          </article>
        ))}
      </section>

      <section id="placement" className={`${container} mt-32 grid scroll-mt-24 grid-cols-1 gap-x-16 gap-y-16 border-t border-hairline pt-20 pb-32 lg:grid-cols-12`}>
        <div className="flex flex-col gap-10 lg:col-span-5">
          <h2 className={h2}>Where you put it is the whole API.</h2>
          <dl className="divide-y divide-hairline border-y border-hairline">
            {[
              ["In <body>", "The whole page wears it."],
              ["In an element", "Only that element does. Leave it and the outer cursor takes back over."],
              ["Nested", "The innermost cursor wins."],
              ["Touch, reduced motion", "Touch keeps the native pointer. Reduced motion snaps into place instead of trailing."],
            ].map(([term, def]) => (
              <div key={term} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="font-mono text-[13px] leading-6">{term}</dt>
                <dd className="text-ink-soft">{def}</dd>
              </div>
            ))}
          </dl>
          <Code title="Placement" code={placement} />
        </div>

        <div className="lg:col-span-7">
          <Plate className="aspect-[4/5] sm:aspect-[4/3]">
            <BlendCursor className={cursorTone} />
            <div className="flex h-full flex-col gap-8 p-6 sm:p-8">
              <p className="max-w-[28ch] text-ink-soft">
                <Swap
                  mouse="This plate wears Blend. The one inside it wears Label. Move between them."
                  touch="This plate wears Blend; the one inside wears Label. With a mouse, the inner one takes over as you cross into it."
                />
              </p>
              <Plate className="mt-auto ml-auto aspect-[4/3] w-[78%] sm:w-3/5" surface="bg-paper-warm">
                <LabelCursor />
                <div className="flex h-full flex-col justify-between p-5 sm:p-6">
                  <p className="text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] tracking-[-0.02em]">Inner plate</p>
                  <Link href="/plates/label" data-cursor-label="Innermost wins" className="btn-secondary self-start">
                    <Swap mouse="Hover me" touch="Open Label" /> <Arrow />
                  </Link>
                </div>
              </Plate>
            </div>
          </Plate>
        </div>
      </section>
    </main>
  );
}
