import type { MetadataRoute } from "next";
import { DESTINATIONS } from "@/lib/destinations";

const SITE = "https://travel-pin.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const places = DESTINATIONS.map((d) => ({
    url: `${SITE}/place/${d.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [
    { url: SITE, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    ...places,
  ];
}
