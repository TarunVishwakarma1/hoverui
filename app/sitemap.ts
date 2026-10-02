import type { MetadataRoute } from "next";
import registry from "@/registry.json";

// No lastModified: a build timestamp would tell crawlers every page changed on every deploy.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: registry.homepage },
    { url: `${registry.homepage}/cursors` },
    ...registry.items.map((item) => ({ url: `${registry.homepage}/${item.type === "registry:hook" ? "hooks" : "cursors"}/${item.name}` })),
  ];
}
