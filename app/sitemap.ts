import type { MetadataRoute } from "next";
import { supabaseService } from "@/lib/supabase/server";

const BREEDS_DOG = [
  "labrador", "golden-retriever", "german-shepherd", "french-bulldog",
  "bulldog", "poodle", "beagle", "rottweiler", "dachshund", "yorkie",
];
const BREEDS_CAT = ["maine-coon", "persian", "ragdoll", "siamese", "british-shorthair"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes: MetadataRoute.Sitemap = [
    "", "upload", "gallery", "gallery/top", "about", "privacy", "terms",
  ].map((path) => ({
    url: `${base}/${path}`.replace(/\/$/, "") || base,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1.0 : 0.7,
  }));

  const breedRoutes: MetadataRoute.Sitemap = [
    ...BREEDS_DOG.map((b) => `roast-my-${b}`),
    ...BREEDS_CAT.map((b) => `roast-my-${b}`),
  ].map((slug) => ({
    url: `${base}/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  let roastRoutes: MetadataRoute.Sitemap = [];
  try {
    const sb = supabaseService();
    const { data } = await sb
      .from("roasts")
      .select("short_id, created_at")
      .eq("is_public", true)
      .eq("is_flagged", false)
      .order("created_at", { ascending: false })
      .limit(1000);
    roastRoutes = (data || []).map((r) => ({
      url: `${base}/r/${r.short_id}`,
      lastModified: new Date(r.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // ignore sitemap DB errors
  }

  return [...staticRoutes, ...breedRoutes, ...roastRoutes];
}
