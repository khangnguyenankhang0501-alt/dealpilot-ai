import type { MetadataRoute } from "next";

import { supabase } from "@/lib/supabaseClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const categories = [
  "electronics",
  "home",
  "fashion",
  "beauty",
  "kitchen",
  "health",
  "sports",
  "baby",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: coupons }, { data: stores }] = await Promise.all([
    supabase
      .from("coupons")
      .select("slug, created_at, status, expires_at")
      .limit(10000),

    supabase.from("stores").select("slug").limit(10000),
  ]);

  const now = Date.now();

  const activeCoupons = (coupons || []).filter((coupon) => {
    const status = String(coupon.status || "").toLowerCase();

    if (status && status !== "active") {
      return false;
    }

    if (coupon.expires_at) {
      const expiresAt = new Date(coupon.expires_at).getTime();

      if (Number.isFinite(expiresAt) && expiresAt <= now) {
        return false;
      }
    }

    return Boolean(coupon.slug);
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/coupons`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/deals`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/stores`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/categories`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${siteUrl}/categories/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const storePages: MetadataRoute.Sitemap = (stores || [])
    .filter((store) => Boolean(store.slug))
    .map((store) => ({
      url: `${siteUrl}/stores/${store.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
    }));

  const couponPages: MetadataRoute.Sitemap = activeCoupons.map((coupon) => ({
    url: `${siteUrl}/coupons/${coupon.slug}`,
    lastModified: coupon.created_at ? new Date(coupon.created_at) : undefined,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...storePages, ...couponPages];
}
