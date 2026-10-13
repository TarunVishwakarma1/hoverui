import registry from "@/registry.json";
import { ogPlate, ogSize } from "../../../og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "A hover-ui cursor component for React";

const items = registry.items.filter((item) => item.type === "registry:component");

export function generateStaticParams() {
  return items.map((item) => ({ name: item.name }));
}

/** Each cursor's share card: its name and what it does, with the command that installs it. */
export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const item = items.find((i) => i.name === name)!;
  return ogPlate({ title: item.title, description: item.description, label: `${item.categories[0]} · cursor`, foot: `npx shadcn@latest add ${registry.homepage}/r/${item.name}.json` });
}
