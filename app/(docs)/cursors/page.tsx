import type { Metadata } from "next";
import Link from "next/link";
import { categories, cursors, Swap } from "../../catalog";
import { Scene } from "../../scenes";
import { JsonLd, Preview, SITE, Words, siteOpenGraph } from "../../ui";

const title = "All React cursor components";
const description = `Browse all ${cursors.length} hover-ui cursors: copy-paste React cursor components grouped by what they do, each installed with the shadcn CLI.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/cursors" },
  openGraph: { ...siteOpenGraph, title, description, url: "/cursors" },
};

/** Every cursor as a live preview tile; the shared layout puts the cursor index beside it. */
export default function CursorsIndex() {
  return (
    <main className="min-w-0 pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: title,
              description,
              url: `${SITE}/cursors`,
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: cursors.length,
                itemListElement: cursors.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: `${p.title} cursor`, url: `${SITE}/cursors/${p.name}` })),
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "hover-ui", item: SITE },
                { "@type": "ListItem", position: 2, name: "Cursors", item: `${SITE}/cursors` },
              ],
            },
          ],
        }}
      />

      <header className="pt-12 pb-16 lg:pt-16">
        <h1 className="text-display">All cursors</h1>
        <p className="mt-6 max-w-[46ch] text-ink-soft">
          {cursors.length} cursor components for React.{" "}
          <Swap
            mouse="Every preview wears its own cursor: hover one to try it, open it for the install command and source."
            touch="Open any cursor for its install command and source; with a mouse, each preview wears its own cursor."
          />
        </p>
      </header>

      {categories.map((group) => (
        <section key={group.name} id={group.id} aria-labelledby={`${group.id}-title`} className="scroll-mt-24 border-t border-hairline pt-6 pb-20">
          <h2 id={`${group.id}-title`} className="flex items-baseline gap-3 text-[28px] leading-8 tracking-[-0.02em]">
            {group.name}
            <span className="mono-label text-ink-soft">{group.cursors.length}</span>
          </h2>
          <ul className="mt-12 grid grid-cols-1 gap-x-16 gap-y-20 sm:grid-cols-2 xl:grid-cols-3">
            {group.cursors.map((c) => (
              <li key={c.name}>
                {/* The preview is the cursor's area: hover to wear it, click to open its page. */}
                <Link href={`/cursors/${c.name}`} data-cursor-label={`Open ${c.title}`} className="group block">
                  <Preview className="aspect-[4/3]" touchNote={false}>
                    <c.Cursor />
                    <Scene name={c.name} />
                  </Preview>
                  <span className="mt-8 block border-t border-hairline pt-3 text-[22px] leading-7 tracking-[-0.01em] group-hover:underline group-hover:underline-offset-4">
                    {c.title}
                  </span>
                  <span className="mt-2 block max-w-[52ch] text-[15px] leading-[22px] text-ink-soft">
                    <Words text={c.description} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
