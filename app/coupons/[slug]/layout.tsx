import type { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";

interface CouponLayoutProps {
  children: React.ReactNode;
}

interface CouponRow {
  title: string | null;
  slug: string | null;
  store_name: string | null;
  discount_value: number | null;
  image_url: string | null;
  verified: boolean | null;
  status: string | null;
  expires_at: string | null;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getCoupon(slug: string): Promise<CouponRow | null> {
  const { data, error } = await supabase
    .from("coupons")
    .select(
      "title, slug, store_name, discount_value, image_url, verified, status, expires_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const coupon = await getCoupon(slug);

  if (!coupon) {
    return {
      title: "Coupon Not Found | DealPilot",
      description:
        "The coupon you are looking for could not be found on DealPilot.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = coupon.title?.trim() || "Coupon & Deal";
  const storeName = coupon.store_name?.trim() || "Popular Stores";

  const discount =
    typeof coupon.discount_value === "number" && coupon.discount_value > 0
      ? `${coupon.discount_value}% off`
      : "Save more";

  const description = `${title} at ${storeName}. Discover this ${discount} coupon, promo code, and deal on DealPilot.`;

  const url = `${siteUrl}/coupons/${coupon.slug || slug}`;

  const isExpired =
    Boolean(coupon.expires_at) &&
    Number.isFinite(new Date(coupon.expires_at!).getTime()) &&
    new Date(coupon.expires_at!).getTime() < Date.now();

  const isInactive =
    Boolean(coupon.status) && coupon.status!.trim().toLowerCase() !== "active";

  const shouldIndex = !isExpired && !isInactive;

  return {
    title: `${title} | ${storeName} | DealPilot`,
    description,

    alternates: {
      canonical: url,
    },

    robots: {
      index: shouldIndex,
      follow: true,
    },

    openGraph: {
      title: `${title} | ${storeName} | DealPilot`,
      description,
      url,
      siteName: "DealPilot",
      type: "website",

      ...(coupon.image_url
        ? {
            images: [
              {
                url: coupon.image_url,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
    },
  };
}

export default function CouponLayout({ children }: CouponLayoutProps) {
  return children;
}
