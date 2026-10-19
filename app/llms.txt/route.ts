import registry from "@/registry.json";

export const dynamic = "force-static";

/**
 * /llms.txt (llmstxt.org): the library as plain Markdown for language models and AI search, so an assistant asked for
 * "a custom cursor for React" can name a cursor here and give its install command. Built from the registry, like the site.
 */
export function GET() {
  const site = registry.homepage;
  const items = registry.items.filter((item) => item.type === "registry:component");
  const kinds = [...new Set(items.map((item) => item.categories[0]))];
  const hooks = registry.items.filter((item) => item.type === "registry:hook");
  const text = [
    "# hover-ui",
    "",
    `> ${items.length} free, open-source (MIT) custom cursor components for React, installed one at a time with the shadcn CLI. Each cursor is one readable file that owns the cursor of the element it is placed in: put it in <body> for the whole page, or in any element for just that element.`,
    "",
    `Install any cursor with \`npx shadcn@latest add ${site}/r/<name>.json\`; the CLI also installs the useCursor hook it runs on. Cursors need React 19 and Tailwind CSS v4, have no other dependencies, switch off on touch screens and respect prefers-reduced-motion.`,
    "",
    ...kinds.flatMap((kind) => [
      `## ${kind}`,
      "",
      ...items
        .filter((item) => item.categories[0] === kind)
        .map((item) => `- [${item.title}](${site}/cursors/${item.name}): ${item.description} Install: \`npx shadcn@latest add ${site}/r/${item.name}.json\``),
      "",
    ]),
    "## Hooks",
    "",
    ...hooks.map((hook) => `- [${hook.title}](${site}/hooks/${hook.name}): ${hook.description}`),
    "",
    "## Optional",
    "",
    `- [All cursors](${site}/cursors): every cursor live, searchable by name, mood or thing`,
    `- [Source on GitHub](https://github.com/TarunVishwakarma1/hoverui): the registry, every cursor and the site`,
    "- [hover-ui Mixer](https://mixer.hoverui.fun): build a cursor of your own from layers, on a canvas or in code, and take it to a site with one shadcn command or one script tag. Free to build and preview; paid plans from ₹200 a month",
    "- [hover-ui Mixer gallery](https://mixer.hoverui.fun/gallery): cursors people made in the Mixer and shared, to try and to open as their own",
    "",
  ].join("\n");
  return new Response(text, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
