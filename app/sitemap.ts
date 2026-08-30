import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase-temp";

const SITE_URL = "https://dealpilot.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: coupons }, { data: stores }, { data: categories }] =
    await Promise.all([
      supabase.from("coupons").select("slug, created_at"),

      supabase.from("stores").select("slug, created_at"),

      supabase.from("categories").select("slug, created_at"),
    ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/coupons`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/stores`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/deals`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const couponPages: MetadataRoute.Sitemap = (coupons ?? [])
    .filter((coupon) => coupon.slug)
    .map((coupon) => ({
      url: `${SITE_URL}/coupons/${coupon.slug}`,
      lastModified: coupon.created_at
        ? new Date(coupon.created_at)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const storePages: MetadataRoute.Sitemap = (stores ?? [])
    .filter((store) => store.slug)
    .map((store) => ({
      url: `${SITE_URL}/stores/${store.slug}`,
      lastModified: store.created_at ? new Date(store.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const categoryPages: MetadataRoute.Sitemap = (categories ?? [])
    .filter((category) => category.slug)
    .map((category) => ({
      url: `${SITE_URL}/categories/${category.slug}`,
      lastModified: category.created_at
        ? new Date(category.created_at)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [...staticPages, ...couponPages, ...storePages, ...categoryPages];
}
