import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getCatalog } from "@/lib/catalog";
import { legalDocs } from "@/lib/legal";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalog();
  const staticPages = ["", "shop", "about", "contact", "faq", "checkout"].map(
    (p) => ({
      url: `${site.url}/${p}`,
      lastModified: new Date(),
    })
  );
  const productPages = products.map((p) => ({
    url: `${site.url}/products/${p.slug}`,
    lastModified: new Date(),
  }));
  const legalPages = legalDocs.map((d) => ({
    url: `${site.url}/policies/${d.slug}`,
    lastModified: new Date(),
  }));
  return [...staticPages, ...productPages, ...legalPages];
}
