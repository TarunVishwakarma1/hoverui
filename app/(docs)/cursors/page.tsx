import type { Metadata } from "next";
import { categories, cursors, Swap } from "../../catalog";
import { CursorTile, JsonLd, SITE, siteOpenGraph } from "../../ui";
import { CursorSearch, SearchItem, SearchSection } from "../../client";

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

      <header className="pt-12 pb-10 lg:pt-16">
        <h1 className="text-display">All cursors</h1>
        <p className="mt-6 max-w-[46ch] text-ink-soft">
          {cursors.length} cursor components for React.{" "}
          <Swap
            mouse="Every preview wears its own cursor: hover one to try it, open it for the install command and source."
            touch="Open any cursor for its install command and source; with a mouse, each preview wears its own cursor."
          />
        </p>
      </header>

      <CursorSearch index={cursors.map((c) => ({ name: c.name, text: c.search }))}>
        {categories.map((group) => (
          <SearchSection key={group.name} id={group.id} title={group.name} names={group.cursors.map((c) => c.name)}>
            <ul className="mt-12 grid grid-cols-1 gap-x-16 gap-y-20 sm:grid-cols-2 xl:grid-cols-3">
              {group.cursors.map((c) => (
                <SearchItem key={c.name} name={c.name}>
                  <CursorTile cursor={c} />
                </SearchItem>
              ))}
            </ul>
          </SearchSection>
        ))}
      </CursorSearch>
    </main>
  );
}
