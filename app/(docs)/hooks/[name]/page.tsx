import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cursors, getHook, hooks } from "../../../catalog";
import { Code, GITHUB, Install, JsonLd, Row, SITE, siteOpenGraph } from "../../../ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return hooks.map((h) => ({ name: h.name }));
}

export async function generateMetadata({ params }: PageProps<"/hooks/[name]">): Promise<Metadata> {
  const hook = getHook((await params).name);
  if (!hook) return {};
  const title = `${hook.title} hook for React`;
  const description = `${hook.description} Every hover-ui cursor installs it; add it on its own with the shadcn CLI to build your own.`;
  const url = `/hooks/${hook.name}`;
  return { title, description, alternates: { canonical: url }, openGraph: { ...siteOpenGraph, title, description, url } };
}

// A whole cursor in a dozen lines: the smallest honest example of the hook's contract.
const example = `"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

export function DotCursor({ className = "" }: { className?: string }) {
  const pos = useRef({ x: 0, y: 0 });
  const ref = useCursor((p, el) => {
    pos.current.x += (p.x - pos.current.x) * p.ease(16);
    pos.current.y += (p.y - pos.current.y) * p.ease(16);
    (el.firstElementChild as HTMLElement).style.transform = \`translate(\${pos.current.x}px, \${pos.current.y}px)\`;
  });

  return (
    <div ref={ref} aria-hidden className={\`\${cursorRoot} \${className}\`}>
      <div className="absolute size-3 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}`;

const api: [string, string][] = [
  ["useCursor(frame)", "Returns a ref for your cursor's root element. That element's parent becomes the cursor area: the native cursor hides there, and frame(pointer, element) runs every animation frame while a mouse is inside."],
  ["pointer.x, pointer.y", "The pointer position in viewport pixels."],
  ["pointer.down", "True while a mouse button is held."],
  ["pointer.target", "The element under the pointer, for hover effects: pointer.target?.closest(INTERACTIVE)."],
  ["pointer.ease(speed)", "A frame-rate independent smoothing factor: pos += (pointer.x - pos) * pointer.ease(12). Returns 1 on entry and under reduced motion, so cursors snap instead of trailing."],
  ["cursorRoot", "Tailwind classes for the root: fixed, pointer-events-none, hidden until the pointer is inside the area."],
  ["INTERACTIVE", "The selector cursors treat as hover targets."],
];

export default async function HookPage({ params }: PageProps<"/hooks/[name]">) {
  const hook = getHook((await params).name);
  if (!hook) notFound();

  // Hooks live in hooks/; scoping the path keeps the build from tracing the whole project.
  const files = await Promise.all(
    hook.files.map(async (path) => ({ path, code: await readFile(join(process.cwd(), "hooks", path.split("/").pop()!), "utf8") })),
  );
  const url = `${SITE}/hooks/${hook.name}`;

  return (
    <main className="min-w-0 pb-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareSourceCode",
              name: `${hook.title} hook`,
              description: hook.description,
              url,
              programmingLanguage: "TypeScript",
              runtimePlatform: "React",
              license: "https://opensource.org/licenses/MIT",
              codeRepository: GITHUB,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "hover-ui", item: SITE },
                { "@type": "ListItem", position: 2, name: hook.title, item: url },
              ],
            },
          ],
        }}
      />

      <div className="grid grid-cols-1 gap-x-10 gap-y-12 pt-12 pb-16 lg:pt-16 xl:grid-cols-12">
        <header className="xl:col-span-6">
          <h1 className="text-display">{hook.title}</h1>
          <p className="mt-6 max-w-[46ch] text-ink-soft">{hook.description}</p>
        </header>
        <div id="install" className="flex min-w-0 scroll-mt-28 flex-col gap-4 xl:col-span-6 xl:self-end">
          <Install name={hook.name} />
          <p className="text-[15px] leading-[22px] text-ink-soft">
            Adds <code className="font-mono text-[13px] text-ink">use-cursor.ts</code> to your hooks folder. Every cursor installs it for you; add it on its own to build your own cursor.
          </p>
        </div>
      </div>

      <Row title="Used by">
        <ul className="flex flex-wrap gap-x-8 gap-y-3">
          {cursors.map((c) => (
            <li key={c.name}>
              <Link href={`/cursors/${c.name}`} className="flex items-baseline gap-3 hover:underline hover:underline-offset-4">
                <span className="text-[22px] leading-7 tracking-[-0.01em]">{c.title}</span>
                <span className="mono-label text-ink-soft">{c.number}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Row>

      <Row title="Your own cursor">
        <Code title="dot-cursor.tsx" code={example} />
        <p className="text-[15px] leading-[22px] text-ink-soft">
          Place it like any hover-ui cursor: inside the element it should own, or in <code className="font-mono text-[13px] text-ink">&lt;body&gt;</code> for the whole page.
        </p>
      </Row>

      <Row title="API">
        <dl className="divide-y divide-hairline border-y border-hairline">
          {api.map(([term, def]) => (
            <div key={term} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt className="font-mono text-[13px] leading-6">{term}</dt>
              <dd className="text-ink-soft">{def}</dd>
            </div>
          ))}
        </dl>
      </Row>

      <Row title="Source">
        {files.map((f) => (
          <Code key={f.path} title={f.path.split("/").pop()!} code={f.code} />
        ))}
      </Row>
    </main>
  );
}
