import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dealpilot-ai-iota.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: coupons } = await supabase
    .from("coupons")
    .select("slug, created_at");

  const { data: stores } = await supabase
    .from("stores")
    .select("slug, created_at");

  const { data: categories } = await supabase
    .from("categories")
    .select("slug, created_at");

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, created_at");

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: SITE_URL + "/coupons",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: SITE_URL + "/stores",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: SITE_URL + "/deals",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: SITE_URL + "/blog",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const couponPages: MetadataRoute.Sitemap = (coupons ?? [])
    .filter((coupon) => coupon.slug)
    .map((coupon) => ({
      url: SITE_URL + "/coupons/" + coupon.slug,
      lastModified: coupon.created_at ? new Date(coupon.created_at) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const storePages: MetadataRoute.Sitemap = (stores ?? [])
    .filter((store) => store.slug)
    .map((store) => ({
      url: SITE_URL + "/stores/" + store.slug,
      lastModified: store.created_at ? new Date(store.created_at) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const categoryPages: MetadataRoute.Sitemap = (categories ?? [])
    .filter((category) => category.slug)
    .map((category) => ({
      url: SITE_URL + "/categories/" + category.slug,
      lastModified: category.created_at ? new Date(category.created_at) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const blogPages: MetadataRoute.Sitemap = (posts ?? [])
    .filter((post) => post.slug)
    .map((post) => ({
      url: SITE_URL + "/blog/" + post.slug,
      lastModified: post.created_at ? new Date(post.created_at) : now,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [
    ...staticPages,
    ...couponPages,
    ...storePages,
    ...categoryPages,
    ...blogPages,
  ];
}
